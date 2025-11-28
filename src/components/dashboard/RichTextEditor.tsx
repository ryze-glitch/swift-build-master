import { useEffect, useRef } from "react";
import "react-quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const quillRef = useRef<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('react-quill').then((module) => {
        const ReactQuill = module.default;
        if (editorRef.current && !quillRef.current) {
          const QuillComponent = ReactQuill as any;
          const container = editorRef.current;
          container.innerHTML = '';
          
          // Create a new div for React Quill
          const quillContainer = document.createElement('div');
          container.appendChild(quillContainer);

          // Import Quill for direct instantiation
          import('quill').then((QuillModule) => {
            const Quill = QuillModule.default;
            
            const quill = new Quill(quillContainer, {
              theme: 'snow',
              placeholder: placeholder || 'Scrivi il contenuto del comunicato...',
              modules: {
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  ['link'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ]
              }
            });

            quill.root.innerHTML = value;

            quill.on('text-change', () => {
              onChange(quill.root.innerHTML);
            });

            quillRef.current = quill;
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (quillRef.current && quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="rich-text-editor min-h-[200px]">
      <div ref={editorRef} className="w-full h-full" />
      <style>{`
        .ql-toolbar {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem 0.5rem 0 0;
        }
        .ql-container {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-top: none;
          border-radius: 0 0 0.5rem 0.5rem;
          font-family: inherit;
          min-height: 200px;
        }
        .ql-editor {
          min-height: 200px;
          color: hsl(var(--foreground));
        }
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
        }
        .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        .ql-fill {
          fill: hsl(var(--foreground));
        }
        .ql-picker-label {
          color: hsl(var(--foreground));
        }
        .ql-toolbar button:hover .ql-stroke,
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: hsl(var(--primary));
        }
        .ql-toolbar button:hover .ql-fill,
        .ql-toolbar button.ql-active .ql-fill {
          fill: hsl(var(--primary));
        }
        .ql-editor a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        .ql-snow .ql-tooltip {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .ql-snow .ql-tooltip input[type=text] {
          background: hsl(var(--secondary));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
        }
      `}</style>
    </div>
  );
};
