import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import 'react-quill-new/dist/quill.snow.css';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean'] // remove formatting
    ]
  }), []);

  // Quill formats configuration
  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  // Handle content change with sanitization
  const handleChange = (content) => {
    // Only call onChange if content actually changed
    if (content === value) return;

    // Sanitize HTML to prevent XSS
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });

    // Only call onChange if sanitized content is different from current value
    if (sanitized !== value) {
      onChange(sanitized);
    }
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

  return (
    <div className="rich-text-editor-container">
      {/* Rich Text Editor */}
      <div className="quill-editor-wrapper">
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
