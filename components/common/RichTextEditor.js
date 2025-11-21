import React, { useRef, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Normalize HTML content to ensure proper block structure
const normalizeContent = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Trim whitespace but preserve structure
  let normalized = html.trim();
  
  // If content starts with a heading, add a leading paragraph to allow editing before it
  // This paragraph will be invisible/hidden but allows cursor positioning
  if (normalized.match(/^<h[2-4]/)) {
    // Add a zero-width paragraph at the start that can be edited
    normalized = '<p><br></p>' + normalized;
  }
  
  return normalized;
};

const RichTextEditor = forwardRef(({
  value,
  onChange,
  placeholder = 'Enter text...',
  availableVariables = []
}, ref) => {
  const quillRef = useRef(null);

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean'] // remove formatting
    ],
    keyboard: {
      bindings: {
        // Custom handler for space key at document start
        'space-at-start': {
          key: ' ',
          handler: function(range, context) {
            // If at the very beginning of the document
            if (range.index === 0) {
              const editor = this.quill;
              const delta = editor.getContents();
              
              // Check if first block is a heading
              if (delta.ops && delta.ops.length > 0) {
                const firstOp = delta.ops[0];
                if (firstOp.attributes && firstOp.attributes.header) {
                  // Insert space at the beginning of the heading
                  editor.insertText(0, ' ', 'user');
                  editor.setSelection(1, 'user');
                  return false; // Prevent default behavior
                }
              }
            }
            return true; // Allow default behavior
          }
        }
      }
    }
  }), []);

  // Quill formats configuration
  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  // Handle content change with sanitization
  const handleChange = (content) => {
    // Sanitize HTML to prevent XSS
    let sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span', 'h2', 'h3', 'h4'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });

    // Remove the leading empty paragraph we added for editing if it's still empty
    // This keeps the saved content clean
    sanitized = sanitized.replace(/^<p><br><\/p>\s*/, '');

    // Always call onChange to ensure ReactQuill state stays in sync
    // The parent component should handle deduplication if needed
    onChange(sanitized);
  };

  // Insert variable at cursor position
  const insertVariable = (variable) => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const selection = editor.getSelection();
      const cursorPosition = selection ? selection.index : 0;
      editor.insertText(cursorPosition, variable);
      editor.setSelection(cursorPosition + variable.length);
    }
  };

  // Expose insertVariable via ref
  useImperativeHandle(ref, () => ({
    insertVariable
  }));

  // Set up keyboard handler to prevent cursor jumping when adding space in headings
  useEffect(() => {
    if (!quillRef.current) return;

    const editor = quillRef.current.getEditor();
    const editorElement = editor.root;

    const handleKeyDown = (e) => {
      // Only handle space key
      if (e.key !== ' ' && e.keyCode !== 32) return;

      const selection = editor.getSelection();
      if (!selection || selection.length > 0) return;

      try {
        // Get the current line/block where the cursor is
        const [line, offset] = editor.getLine(selection.index);
        if (!line || !line.domNode) return;

        const isHeading = ['H2', 'H3', 'H4'].includes(line.domNode.tagName);
        
        // If we're in a heading block
        if (isHeading) {
          // Check if we're at the end of the heading content
          const lineLength = line.length;
          const isAtEndOfHeading = offset === lineLength;
          
          // If at the end of heading and pressing space, prevent creating new block
          if (isAtEndOfHeading) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Insert space at the end of the heading
            editor.insertText(selection.index, ' ');
            // Keep cursor after the space
            requestAnimationFrame(() => {
              editor.setSelection(selection.index + 1);
            });
            return false;
          }
        }

        // Also handle case when cursor is at the very beginning (index 0)
        if (selection.index === 0) {
          // Check DOM directly to see if first element is a heading
          const firstChild = editorElement.firstElementChild;
          if (firstChild && ['H2', 'H3', 'H4'].includes(firstChild.tagName)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Insert space at the beginning of the heading
            editor.insertText(0, ' ');
            requestAnimationFrame(() => {
              editor.setSelection(1);
            });
            return false;
          }
        }
      } catch (err) {
        // If there's an error, allow default behavior
        console.debug('Error in keyboard handler:', err);
      }
    };

    editorElement.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [value]);

  // Normalize value when it changes
  const normalizedValue = useMemo(() => {
    return normalizeContent(value || '');
  }, [value]);

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

        /* Hide leading empty paragraph that allows editing before headings */
        .quill-editor-wrapper .ql-editor > p:first-child:empty,
        .quill-editor-wrapper .ql-editor > p:first-child:only-child:has(br:only-child) {
          min-height: 0 !important;
          height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: 0 !important;
          overflow: hidden !important;
          visibility: hidden !important;
        }
        
        /* Fallback for browsers that don't support :has() */
        .quill-editor-wrapper .ql-editor > p:first-child {
          min-height: 0;
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
          color: #7902DF;
        }

        .quill-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #6b7280;
        }

        .quill-editor-wrapper .ql-toolbar button:hover .ql-stroke,
        .quill-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #7902DF;
        }

        .quill-editor-wrapper .ql-toolbar .ql-fill {
          fill: #6b7280;
        }

        .quill-editor-wrapper .ql-toolbar button:hover .ql-fill,
        .quill-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #7902DF;
        }

        .quill-editor-wrapper .ql-toolbar .ql-picker-label:hover,
        .quill-editor-wrapper .ql-toolbar .ql-picker-label.ql-active {
          color: #7902DF;
        }

        .quill-editor-wrapper .ql-toolbar .ql-picker-label:hover .ql-stroke,
        .quill-editor-wrapper .ql-toolbar .ql-picker-label.ql-active .ql-stroke {
          stroke: #7902DF;
        }
      `}</style>
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
