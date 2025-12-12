import 'react-quill-new/dist/quill.snow.css'

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

    // Handle link tooltip positioning to prevent clipping
    useEffect(() => {
      if (!quillRef.current) return

      const adjustTooltipPosition = () => {
        // Find tooltip within the current editor instance
        const editor = quillRef.current?.getEditor()
        if (!editor) return

        const editorContainer = editor.container
        if (!editorContainer) return

        const editorWrapper = editorContainer.closest('.quill-editor-wrapper')
        if (!editorWrapper) return

        const tooltip = editorWrapper.querySelector('.ql-tooltip')
        if (!tooltip) return

        // Only show and adjust tooltip if it's in editing mode
        // Quill manages visibility - we should not force it to be visible
        if (!tooltip.classList.contains('ql-editing')) {
          // Hide tooltip if it's not in editing mode
          return
        }

        const tooltipRect = tooltip.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const wrapperRect = editorWrapper.getBoundingClientRect()

        // Get current position relative to wrapper
        const currentLeft = tooltipRect.left - wrapperRect.left
        const currentTop = tooltipRect.top - wrapperRect.top
        const tooltipWidth = tooltipRect.width || 300 // Default width if not calculated
        const tooltipHeight = tooltipRect.height || 50 // Default height if not calculated

        // Ensure input field is visible
        const input = tooltip.querySelector('input[type="text"]')
        if (input) {
          input.style.visibility = 'visible'
          input.style.opacity = '1'
          input.style.display = 'block'
          input.style.color = '#000'
          input.style.background = '#fff'
        }

        // Fix left clipping - ensure at least 10px from left edge of viewport
        if (tooltipRect.left < 10) {
          const newLeft = 10 - wrapperRect.left
          tooltip.style.left = `${Math.max(0, newLeft)}px`
          tooltip.style.right = 'auto'
        }

        // Fix right clipping - ensure at least 10px from right edge of viewport
        if (tooltipRect.right > viewportWidth - 10) {
          const newLeft = viewportWidth - 10 - wrapperRect.left - tooltipWidth
          tooltip.style.left = `${Math.max(0, newLeft)}px`
          tooltip.style.right = 'auto'
        }

        // Fix bottom clipping
        if (tooltipRect.bottom > viewportHeight - 10) {
          // Try to position above the editor
          const spaceAbove = wrapperRect.top
          if (spaceAbove >= tooltipHeight + 10) {
            // Position above editor
            tooltip.style.top = `-${tooltipHeight + 8}px`
            tooltip.style.bottom = 'auto'
          } else {
            // Not enough space above, position at top of viewport relative to wrapper
            const topOffset = 10 - wrapperRect.top
            tooltip.style.top = `${Math.max(0, topOffset)}px`
            tooltip.style.bottom = 'auto'
          }
        }

        // Fix top clipping
        if (tooltipRect.top < 10) {
          // Position below the editor
          const spaceBelow = viewportHeight - wrapperRect.bottom
          if (spaceBelow >= tooltipHeight + 10) {
            tooltip.style.top = `${wrapperRect.height + 8}px`
            tooltip.style.bottom = 'auto'
          }
        }
      }

      // Use MutationObserver to watch for tooltip appearance
      const observer = new MutationObserver(() => {
        // Small delay to ensure tooltip is fully rendered
        setTimeout(adjustTooltipPosition, 50)
      })

      // Observe the editor wrapper for tooltip changes
      const editor = quillRef.current?.getEditor()
      const editorContainer = editor?.container
      const editorWrapper = editorContainer?.closest('.quill-editor-wrapper')
      
      if (editorWrapper) {
        observer.observe(editorWrapper, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style'],
        })
      }

      // Also adjust on window resize and scroll
      window.addEventListener('resize', adjustTooltipPosition)
      window.addEventListener('scroll', adjustTooltipPosition, true)

      // Initial adjustment with delay to catch tooltip after it appears
      const intervalId = setInterval(() => {
        adjustTooltipPosition()
      }, 100)

      return () => {
        observer.disconnect()
        clearInterval(intervalId)
        window.removeEventListener('resize', adjustTooltipPosition)
        window.removeEventListener('scroll', adjustTooltipPosition, true)
      }
    }, [toolbarPosition])

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

          /* Link tooltip positioning - prevent clipping */
          /* Only style when tooltip is actually visible (Quill manages visibility) */
          .quill-editor-wrapper .ql-tooltip.ql-editing {
            z-index: 10000 !important;
            position: absolute !important;
            background: white !important;
            border: 1px solid #ccc !important;
            border-radius: 4px !important;
            padding: 8px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
          }
          
          /* Hide tooltip when not in editing mode */
          .quill-editor-wrapper .ql-tooltip:not(.ql-editing) {
            display: none !important;
          }

          /* Ensure link tooltip input is visible and properly styled when tooltip is active */
          .quill-editor-wrapper .ql-tooltip.ql-editing input[type="text"] {
            min-width: 200px !important;
            max-width: calc(100vw - 40px) !important;
            width: 200px !important;
            box-sizing: border-box !important;
            padding: 4px 8px !important;
            border: 1px solid #ccc !important;
            border-radius: 4px !important;
            font-size: 14px !important;
            color: #000 !important;
            background: white !important;
          }

          /* Ensure tooltip buttons are visible when tooltip is active */
          .quill-editor-wrapper .ql-tooltip.ql-editing a {
            display: inline-block !important;
            color: #06c !important;
            text-decoration: none !important;
            margin-left: 8px !important;
            padding: 4px 12px !important;
            border: 1px solid #06c !important;
            border-radius: 4px !important;
            background: white !important;
          }

          .quill-editor-wrapper .ql-tooltip.ql-editing a:hover {
            background: #06c !important;
            color: white !important;
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
