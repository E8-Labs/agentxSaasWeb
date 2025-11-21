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

    const handleBeforeInput = (e) => {
      // Only handle space input
      if (e.data !== ' ') return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const container = range.startContainer;
      
      // Check if we're inside a heading element
      let headingElement = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container;
      
      // Traverse up to find heading element
      while (headingElement && headingElement !== editorElement) {
        if (headingElement.tagName && ['H2', 'H3', 'H4'].includes(headingElement.tagName)) {
          // Check if cursor is at the end of the heading text
          const isAtEnd = range.startOffset === (container.nodeType === Node.TEXT_NODE 
            ? container.textContent.length 
            : headingElement.textContent.length);
          
          if (isAtEnd) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Get Quill selection
            const quillSelection = editor.getSelection();
            if (quillSelection) {
              // Insert space at current position
              editor.insertText(quillSelection.index, ' ');
              // Keep cursor after the space
              setTimeout(() => {
                editor.setSelection(quillSelection.index + 1);
              }, 0);
            }
            return false;
          }
          break;
        }
        headingElement = headingElement.parentElement;
      }
    };

    const handleKeyDown = (e) => {
      // Only handle space key
      if (e.key !== ' ' && e.keyCode !== 32) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const container = range.startContainer;
      
      // Check if we're inside a heading element
      let headingElement = container.nodeType === Node.TEXT_NODE 
        ? container.parentElement 
        : container;
      
      // Traverse up to find heading element
      while (headingElement && headingElement !== editorElement) {
        if (headingElement.tagName && ['H2', 'H3', 'H4'].includes(headingElement.tagName)) {
          // Check if cursor is at the end of the heading text
          const textLength = container.nodeType === Node.TEXT_NODE 
            ? container.textContent.length 
            : headingElement.textContent.length;
          const isAtEnd = range.startOffset >= textLength;
          
          if (isAtEnd) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Get Quill selection
            const quillSelection = editor.getSelection();
            if (quillSelection) {
              // Insert space at current position
              editor.insertText(quillSelection.index, ' ');
              // Keep cursor after the space
              setTimeout(() => {
                editor.setSelection(quillSelection.index + 1);
              }, 0);
            }
            return false;
          }
          break;
        }
        headingElement = headingElement.parentElement;
      }
    };

    // Use both beforeinput (modern) and keydown (fallback)
    editorElement.addEventListener('beforeinput', handleBeforeInput, { capture: true, passive: false });
    editorElement.addEventListener('keydown', handleKeyDown, { capture: true, passive: false });
    
    return () => {
      editorElement.removeEventListener('beforeinput', handleBeforeInput, { capture: true });
      editorElement.removeEventListener('keydown', handleKeyDown, { capture: true });
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
