import 'react-quill-new/dist/quill.snow.css'

import DOMPurify from 'dompurify'
import dynamic from 'next/dynamic'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

// Normalize HTML content to ensure proper block structure
const normalizeContent = (html) => {
  if (!html || typeof html !== 'string') {
    // Always return at least an empty paragraph for empty content
    // This ensures Quill has a block element to edit
    return '<p><br></p>'
  }

  // Trim whitespace but preserve structure
  let normalized = html.trim()

  // If content is empty after trimming, ensure we have at least one paragraph
  if (!normalized || normalized === '') {
    return '<p><br></p>'
  }

  // If content starts with a heading, add a leading paragraph to allow editing before it
  // This paragraph will be invisible/hidden but allows cursor positioning
  if (normalized.match(/^<h[2-4]/)) {
    // Add a zero-width paragraph at the start that can be edited
    normalized = '<p><br></p>' + normalized
  }

  // Ensure content doesn't start with a non-block element
  // If it does, wrap it in a paragraph
  if (!normalized.match(/^<(p|h[2-4]|ul|ol|li|div)/i)) {
    normalized = '<p>' + normalized + '</p>'
  }

  return normalized
}

const RichTextEditor = forwardRef(
  (
    { value, onChange, placeholder = 'Enter text...', availableVariables = [] },
    ref,
  ) => {
    const quillRef = useRef(null)
    const lastSentValueRef = useRef('')

    // Quill modules configuration
    const modules = useMemo(
      () => ({
        toolbar: [
          [{ header: [2, 3, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
          ['clean'], // remove formatting
        ],
        keyboard: {
          bindings: {
            // Custom handler for space key at document start
            'space-at-start': {
              key: ' ',
              handler: function (range, context) {
                // If at the very beginning of the document
                if (range.index === 0) {
                  const editor = this.quill
                  const delta = editor.getContents()

                  // Check if first block is a heading
                  if (delta.ops && delta.ops.length > 0) {
                    const firstOp = delta.ops[0]
                    if (firstOp.attributes && firstOp.attributes.header) {
                      // Insert space at the beginning of the heading
                      editor.insertText(0, ' ', 'user')
                      editor.setSelection(1, 'user')
                      return false // Prevent default behavior
                    }
                  }
                }
                return true // Allow default behavior
              },
            },
            // Prevent space from creating new line at end of blocks (especially headings)
            'prevent-space-newline': {
              key: ' ',
              handler: function (range, context) {
                const editor = this.quill
                
                try {
                  // Get the format at the current position
                  const format = editor.getFormat(range.index)
                  
                  // Check if we're in a heading
                  const isHeading = format.header === 2 || 
                                   format.header === 3 || 
                                   format.header === 4
                  
                  // Get the line/block we're in
                  const [line, offset] = editor.getLine(range.index)
                  
                  if (line) {
                    // Get the text content of the current line
                    const lineStart = editor.getIndex(line)
                    const lineLength = line.length()
                    const lineText = editor.getText(lineStart, lineLength)
                    
                    // Check if cursor is at or near the end of the line
                    const isAtEnd = offset >= lineText.length
                    
                    // If at end of a block (especially headings), insert space instead of creating new line
                    if (isAtEnd) {
                      // Insert space at current position
                      editor.insertText(range.index, ' ', 'user')
                      // Move cursor after the space
                      setTimeout(() => {
                        editor.setSelection(range.index + 1, 'user')
                      }, 0)
                      return false // Prevent default behavior
                    }
                  }
                } catch (error) {
                  // If there's an error, allow default behavior
                  console.warn('Error in prevent-space-newline handler:', error)
                }
                
                return true // Allow default behavior
              },
            },
          },
        },
      }),
      [],
    )

    // Quill formats configuration
    const formats = [
      'header',
      'bold',
      'italic',
      'underline',
      'list',
      'link',
    ]

    // Handle content change with sanitization
    const handleChange = (content) => {
      // Sanitize HTML to prevent XSS
      let sanitized = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          'p',
          'br',
          'strong',
          'em',
          'u',
          'ol',
          'ul',
          'li',
          'a',
          'span',
          'h2',
          'h3',
          'h4',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      })

      // Remove the leading empty paragraph we added for editing before headings
      // But only if it's followed by a heading (not if it's the only content)
      const hasHeadingAfter = sanitized.match(/^<p><br><\/p>\s*<h[2-4]/)
      if (hasHeadingAfter) {
        sanitized = sanitized.replace(/^<p><br><\/p>\s*/, '')
      }

      // If content is empty after cleaning, ensure we have at least an empty paragraph
      // This is needed for the editor to remain editable
      const trimmed = sanitized.trim()
      if (!trimmed || trimmed === '' || trimmed === '<p></p>' || trimmed === '<p><br></p>') {
        // Keep empty paragraph for editor functionality, but parent can handle empty state
        sanitized = '<p><br></p>'
      }

      // Only call onChange if the value actually changed to prevent infinite loops
      // Compare with the last value we sent to avoid unnecessary updates
      if (sanitized !== lastSentValueRef.current) {
        lastSentValueRef.current = sanitized
        onChange(sanitized)
      }
    }

    // Insert variable at cursor position
    const insertVariable = (variable) => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor()
        const selection = editor.getSelection()
        const cursorPosition = selection ? selection.index : 0
        editor.insertText(cursorPosition, variable)
        editor.setSelection(cursorPosition + variable.length)
      }
    }

    // Expose insertVariable via ref
    useImperativeHandle(ref, () => ({
      insertVariable,
    }))

    // Set up keyboard handler to prevent space from creating new lines/blocks
    useEffect(() => {
      if (!quillRef.current) return

      const editor = quillRef.current.getEditor()
      const editorElement = editor.root

      const handleBeforeInput = (e) => {
        // Only handle space input
        if (e.data !== ' ') return

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const container = range.startContainer

        // Find the block element (p, h2, h3, h4, li, etc.)
        let blockElement =
          container.nodeType === Node.TEXT_NODE
            ? container.parentElement
            : container

        // Traverse up to find block element
        while (blockElement && blockElement !== editorElement) {
          const tagName = blockElement.tagName
          // Check if we're inside a block element
          if (
            tagName &&
            ['P', 'H2', 'H3', 'H4', 'LI', 'DIV'].includes(tagName)
          ) {
            // Check if cursor is at the end of the block text
            const textLength =
              container.nodeType === Node.TEXT_NODE
                ? container.textContent.length
                : blockElement.textContent.length
            const isAtEnd = range.startOffset >= textLength

            if (isAtEnd) {
              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation()

              // Get Quill selection
              const quillSelection = editor.getSelection()
              if (quillSelection) {
                // Insert space at current position
                editor.insertText(quillSelection.index, ' ')
                // Keep cursor after the space
                setTimeout(() => {
                  editor.setSelection(quillSelection.index + 1)
                }, 0)
              }
              return false
            }
            break
          }
          blockElement = blockElement.parentElement
        }
      }

      const handleKeyDown = (e) => {
        // Only handle space key
        if (e.key !== ' ' && e.keyCode !== 32) return

        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) return

        const range = selection.getRangeAt(0)
        const container = range.startContainer

        // Find the block element (p, h2, h3, h4, li, etc.)
        let blockElement =
          container.nodeType === Node.TEXT_NODE
            ? container.parentElement
            : container

        // Traverse up to find block element
        while (blockElement && blockElement !== editorElement) {
          const tagName = blockElement.tagName
          // Check if we're inside a block element
          if (
            tagName &&
            ['P', 'H2', 'H3', 'H4', 'LI', 'DIV'].includes(tagName)
          ) {
            // Check if cursor is at the end of the block text
            const textLength =
              container.nodeType === Node.TEXT_NODE
                ? container.textContent.length
                : blockElement.textContent.length
            const isAtEnd = range.startOffset >= textLength

            if (isAtEnd) {
              e.preventDefault()
              e.stopPropagation()
              e.stopImmediatePropagation()

              // Get Quill selection
              const quillSelection = editor.getSelection()
              if (quillSelection) {
                // Insert space at current position
                editor.insertText(quillSelection.index, ' ')
                // Keep cursor after the space
                setTimeout(() => {
                  editor.setSelection(quillSelection.index + 1)
                }, 0)
              }
              return false
            }
            break
          }
          blockElement = blockElement.parentElement
        }
      }

      // Use both beforeinput (modern) and keydown (fallback)
      editorElement.addEventListener('beforeinput', handleBeforeInput, {
        capture: true,
        passive: false,
      })
      editorElement.addEventListener('keydown', handleKeyDown, {
        capture: true,
        passive: false,
      })

      return () => {
        editorElement.removeEventListener('beforeinput', handleBeforeInput, {
          capture: true,
        })
        editorElement.removeEventListener('keydown', handleKeyDown, {
          capture: true,
        })
      }
    }, [value])

    // Update lastSentValueRef when value prop changes from parent
    useEffect(() => {
      const sanitized = (value || '').replace(/^<p><br><\/p>\s*/, '')
      lastSentValueRef.current = sanitized
    }, [value])

    // Normalize value when it changes
    const normalizedValue = useMemo(() => {
      return normalizeContent(value || '')
    }, [value])

    // Ensure editor is properly initialized when it mounts or value changes
    useEffect(() => {
      if (!quillRef.current) return

      const editor = quillRef.current.getEditor()
      const editorElement = editor.root
      
      // Function to ensure editor has editable content
      const ensureEditable = () => {
        try {
          const contents = editor.getContents()
          const text = editor.getText().trim()
          const html = editorElement.innerHTML.trim()
          
          // If editor appears empty, ensure it has at least one paragraph
          const isEmpty = !contents.ops || 
                         contents.ops.length === 0 || 
                         (contents.ops.length === 1 && contents.ops[0].insert === '\n' && !text) ||
                         html === '' ||
                         html === '<p><br></p>' ||
                         html === '<p></p>'
          
          if (isEmpty) {
            // Ensure we have at least one paragraph block
            editor.clipboard.dangerouslyPasteHTML('<p><br></p>')
          }
        } catch (error) {
          console.warn('Error ensuring editor is editable:', error)
        }
      }
      
      // Small delay to ensure Quill is fully initialized
      const timer = setTimeout(ensureEditable, 150)

      // Handle clicks on the editor to ensure it's editable
      const handleClick = (e) => {
        // Only handle if clicking directly on the editor content area
        if (e.target === editorElement || editorElement.contains(e.target)) {
          setTimeout(() => {
            try {
              const selection = editor.getSelection()
              const contents = editor.getContents()
              
              // If no selection and editor is empty, ensure it's editable
              if (!selection && (!contents.ops || contents.ops.length === 0)) {
                ensureEditable()
                // Set cursor at the start
                editor.setSelection(0, 'user')
              } else if (selection && selection.index === 0) {
                // If cursor is at start, ensure we can type
                ensureEditable()
              }
            } catch (error) {
              console.warn('Error handling editor click:', error)
            }
          }, 10)
        }
      }

      editorElement.addEventListener('click', handleClick, true)

      return () => {
        clearTimeout(timer)
        editorElement.removeEventListener('click', handleClick, true)
      }
    }, [normalizedValue])

    return (
      <div className="rich-text-editor-container">
        {/* Rich Text Editor */}
        <div className="quill-editor-wrapper">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={normalizedValue}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        </div>

        <style jsx global>{`
          .rich-text-editor-container {
            width: 100%;
          }

          .quill-editor-wrapper {
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            overflow: hidden;
            margin-top: 8px;
          }

          .quill-editor-wrapper .ql-toolbar {
            background: #f9fafb;
            border: none;
            border-bottom: 1px solid #e5e7eb;
          }

          .quill-editor-wrapper .ql-container {
            border: none;
            font-size: 16px;
            font-family: Arial, sans-serif;
          }

          .quill-editor-wrapper .ql-editor {
            min-height: 200px;
            max-height: 400px;
            overflow-y: auto;
          }

          /* Prevent auto-capitalization and line jumping in headings */
          .quill-editor-wrapper .ql-editor h2,
          .quill-editor-wrapper .ql-editor h3,
          .quill-editor-wrapper .ql-editor h4 {
            text-transform: none;
            font-weight: bold;
          }

          /* Ensure proper cursor behavior in all blocks */
          .quill-editor-wrapper .ql-editor * {
            text-transform: none;
          }

          /* Prevent space from creating new lines - allow spaces within blocks */
          .quill-editor-wrapper .ql-editor p,
          .quill-editor-wrapper .ql-editor h2,
          .quill-editor-wrapper .ql-editor h3,
          .quill-editor-wrapper .ql-editor h4,
          .quill-editor-wrapper .ql-editor li {
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          /* Hide leading empty paragraph that allows editing before headings */
          /* Only hide if it's followed by a heading (not if it's the only content) */
          .quill-editor-wrapper .ql-editor > p:first-child:empty:has(+ h2),
          .quill-editor-wrapper .ql-editor > p:first-child:empty:has(+ h3),
          .quill-editor-wrapper .ql-editor > p:first-child:empty:has(+ h4),
          .quill-editor-wrapper
            .ql-editor
            > p:first-child:has(br:only-child):has(+ h2),
          .quill-editor-wrapper
            .ql-editor
            > p:first-child:has(br:only-child):has(+ h3),
          .quill-editor-wrapper
            .ql-editor
            > p:first-child:has(br:only-child):has(+ h4) {
            min-height: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 0 !important;
            overflow: hidden !important;
            visibility: hidden !important;
          }

          /* Ensure first paragraph is always visible and editable when it's the only content */
          .quill-editor-wrapper .ql-editor > p:first-child:only-child {
            min-height: 1.5em !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.5em !important;
            overflow: visible !important;
            visibility: visible !important;
          }

          /* Ensure first paragraph is editable even when empty (if no heading follows) */
          .quill-editor-wrapper .ql-editor > p:first-child:not(:has(+ h2)):not(:has(+ h3)):not(:has(+ h4)) {
            min-height: 1.5em;
          }

          .quill-editor-wrapper .ql-editor > p:first-child + h2,
          .quill-editor-wrapper .ql-editor > p:first-child + h3,
          .quill-editor-wrapper .ql-editor > p:first-child + h4 {
            margin-top: 0;
          }

          .quill-editor-wrapper .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: italic;
          }

          /* Purple theme for active buttons */
          .quill-editor-wrapper .ql-toolbar button:hover,
          .quill-editor-wrapper .ql-toolbar button.ql-active {
            color: #7902df;
          }

          .quill-editor-wrapper .ql-toolbar .ql-stroke {
            stroke: #6b7280;
          }

          .quill-editor-wrapper .ql-toolbar button:hover .ql-stroke,
          .quill-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
            stroke: #7902df;
          }

          .quill-editor-wrapper .ql-toolbar .ql-fill {
            fill: #6b7280;
          }

          .quill-editor-wrapper .ql-toolbar button:hover .ql-fill,
          .quill-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
            fill: #7902df;
          }

          .quill-editor-wrapper .ql-toolbar .ql-picker-label:hover,
          .quill-editor-wrapper .ql-toolbar .ql-picker-label.ql-active {
            color: #7902df;
          }

          .quill-editor-wrapper .ql-toolbar .ql-picker-label:hover .ql-stroke,
          .quill-editor-wrapper
            .ql-toolbar
            .ql-picker-label.ql-active
            .ql-stroke {
            stroke: #7902df;
          }
        `}</style>
      </div>
    )
  },
)

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
