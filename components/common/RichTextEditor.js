import 'react-quill-new/dist/quill.snow.css'

import dynamic from 'next/dynamic'
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Input } from '@/components/ui/input'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

const RichTextEditor = forwardRef(
  (
    {
      value,
      onChange,
      placeholder = 'Enter text...',
      availableVariables = [],
      toolbarPosition = 'top',
    },
    ref,
  ) => {
    const quillRef = useRef(null)
    const lastHtmlRef = useRef(value || '')
    const [showLinkModal, setShowLinkModal] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [linkRange, setLinkRange] = useState(null)

    // Custom link handler to show our custom modal
    const handleLinkClick = useCallback(() => {
      if (!quillRef.current) return
      
      const editor = quillRef.current.getEditor()
      let selection = editor.getSelection(true)
      
      // If no selection, try to get current selection
      if (!selection) {
        selection = editor.getSelection()
      }
      
      if (selection) {
        setLinkRange(selection)
        // Get existing link if any - check the format at the selection
        try {
          const format = editor.getFormat(selection.index, selection.length)
          if (format.link) {
            setLinkUrl(format.link)
          } else {
            // Try to find link in the DOM
            const [line, offset] = editor.getLine(selection.index)
            const linkElement = line?.domNode?.querySelector('a')
            if (linkElement) {
              setLinkUrl(linkElement.href || '')
            } else {
              setLinkUrl('')
            }
          }
        } catch (e) {
          setLinkUrl('')
        }
        setShowLinkModal(true)
      } else {
        // If still no selection, create a range at cursor position
        const length = editor.getLength()
        const cursorPos = length > 1 ? length - 1 : 0
        setLinkRange({ index: cursorPos, length: 0 })
        setLinkUrl('')
        setShowLinkModal(true)
      }
    }, [])

    // Quill modules configuration with custom link handler
    const modules = useMemo(
      () => ({
        toolbar: {
          container: [
            [{ header: [2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'], // remove formatting
          ],
          handlers: {
            link: handleLinkClick,
          },
        },
      }),
      [handleLinkClick],
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

    // Handle content change with sanitization (only for outgoing value)
    const handleChange = (content, _delta, _source, editor) => {
      // Use Quill's HTML output directly to avoid reformatting loops
      const html = editor.getHTML()
      const outgoing = html && html.trim() ? html : '<p><br></p>'

      // Avoid sending the same value repeatedly (prevents render loops when toggling formats)
      if (outgoing !== lastHtmlRef.current) {
        lastHtmlRef.current = outgoing
        onChange(outgoing)
      }
    }

    // Keep lastHtmlRef in sync with external value changes
    React.useEffect(() => {
      lastHtmlRef.current = value || ''
    }, [value])

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

    // Handle link modal save
    const handleLinkSave = () => {
      if (!quillRef.current || !linkRange) return
      
      const editor = quillRef.current.getEditor()
      const url = linkUrl.trim()
      
      if (url) {
        // Ensure URL has protocol
        const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
          ? url 
          : `https://${url}`
        
        // Restore selection
        editor.setSelection(linkRange.index, linkRange.length)
        // Format as link
        editor.format('link', formattedUrl)
      }
      
      setShowLinkModal(false)
      setLinkUrl('')
      setLinkRange(null)
    }

    // Handle link modal cancel/close
    const handleLinkCancel = () => {
      setShowLinkModal(false)
      setLinkUrl('')
      setLinkRange(null)
    }

    // Handle Enter key in link input
    const handleLinkKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleLinkSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleLinkCancel()
      }
    }

    // Expose insertVariable via ref
    useImperativeHandle(ref, () => ({
      insertVariable,
    }))

    return (
      <div className="rich-text-editor-container">
        {/* Rich Text Editor */}
        <div
          className={`quill-editor-wrapper ${
            toolbarPosition === 'bottom' ? 'toolbar-bottom' : 'toolbar-top'
          }`}
        >
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value || ''}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
          />
        </div>

        {/* Custom Link Modal */}
        {showLinkModal && (
          <>
            <div 
              className="fixed inset-0 z-[10001] bg-black/20"
              onClick={handleLinkCancel}
            />
            <div className="fixed left-1/2 top-1/2 z-[10002] -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px]">
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Enter link:
                </label>
                <Input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={handleLinkKeyDown}
                  placeholder="https://example.com"
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleLinkSave}
                  className="px-4 py-1.5 bg-brand-primary text-white rounded hover:bg-brand-primary/90 transition-colors"
                  style={{ fontSize: '10px' }}
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )}

        <style jsx global>{`
          .rich-text-editor-container {
            width: 100%;
          }

          .quill-editor-wrapper {
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            overflow: visible;
            margin-top: 0;
            position: relative;
            z-index: 1;
          }

          /* ReactQuill root element - needs flex display */
          .quill-editor-wrapper .quill {
            display: flex;
            flex-direction: column;
            border: none !important;
            box-shadow: none !important;
          }

          /* Toolbar at top (default) */
          .quill-editor-wrapper.toolbar-top .quill {
            flex-direction: column;
          }

          /* Toolbar at bottom - reverse the order */
          .quill-editor-wrapper.toolbar-bottom .quill {
            flex-direction: column-reverse;
          }

          .quill-editor-wrapper .ql-toolbar {
            background: #f9fafb;
            border: none !important;
            border-top: none !important;
            border-bottom: none !important;
          }

          .quill-editor-wrapper.toolbar-top .ql-toolbar {
            border-bottom: 1px solid #e5e7eb !important;
          }

          .quill-editor-wrapper.toolbar-bottom .ql-toolbar {
            border-top: 1px solid #e5e7eb !important;
          }

          .quill-editor-wrapper .ql-container {
            border: none !important;
            border-top: none !important;
            border-bottom: none !important;
            font-size: 16px;
            font-family: Arial, sans-serif;
          }

          .quill-editor-wrapper .ql-editor {
            min-height: 120px;
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

          /* Brand theme for active buttons */
          .quill-editor-wrapper .ql-toolbar button:hover,
          .quill-editor-wrapper .ql-toolbar button.ql-active {
            color: hsl(var(--brand-primary, 270 75% 50%));
          }

          .quill-editor-wrapper .ql-toolbar .ql-stroke {
            stroke: #6b7280;
          }

          .quill-editor-wrapper .ql-toolbar button:hover .ql-stroke,
          .quill-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
            stroke: hsl(var(--brand-primary, 270 75% 50%));
          }

          .quill-editor-wrapper .ql-toolbar .ql-fill {
            fill: #6b7280;
          }

          .quill-editor-wrapper .ql-toolbar button:hover .ql-fill,
          .quill-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
            fill: hsl(var(--brand-primary, 270 75% 50%));
          }

          .quill-editor-wrapper .ql-toolbar .ql-picker-label:hover,
          .quill-editor-wrapper .ql-toolbar .ql-picker-label.ql-active {
            color: hsl(var(--brand-primary, 270 75% 50%));
          }

          .quill-editor-wrapper .ql-toolbar .ql-picker-label:hover .ql-stroke,
          .quill-editor-wrapper
            .ql-toolbar
            .ql-picker-label.ql-active
            .ql-stroke {
            stroke: hsl(var(--brand-primary, 270 75% 50%));
          }

          /* Dropdown positioning - default (toolbar at top) */
          .quill-editor-wrapper.toolbar-top .ql-picker-options {
            top: 100% !important;
            bottom: auto !important;
            margin-top: 0 !important;
            margin-bottom: 0 !important;
          }

          /* Dropdown positioning - when toolbar is at bottom, open upwards */
          .quill-editor-wrapper.toolbar-bottom .ql-picker-options {
            bottom: 100% !important;
            top: auto !important;
            margin-top: 0 !important;
            margin-bottom: 4px !important;
          }

          /* Ensure dropdown is visible and properly positioned */
          .quill-editor-wrapper .ql-picker.ql-expanded .ql-picker-options {
            display: block;
            z-index: 1000;
          }

          /* Hide default Quill link tooltip since we're using custom modal */
          .quill-editor-wrapper .ql-tooltip {
            display: none !important;
          }

          /* Container needs to allow overflow for tooltips */
          .rich-text-editor-container {
            position: relative;
            overflow: visible;
          }

          /* Editor container should clip content but allow tooltips */
          .quill-editor-wrapper .ql-container {
            overflow: visible;
          }

          .quill-editor-wrapper .ql-editor {
            overflow-y: auto;
            overflow-x: hidden;
          }
        `}</style>
      </div>
    )
  },
)

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
