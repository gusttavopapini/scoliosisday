// src/features/collaborators/components/RichTextEditor.jsx
// Editor de rich text com TipTap para currículo de colaboradores.

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useState } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, Type, List, ListOrdered,
  Link as LinkIcon, Trash2, Type as TypeIcon,
} from 'lucide-react';

/**
 * @param {{ value: string, onChange: (content: string) => void }} props
 */
export default function RichTextEditor({ value, onChange }) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  function handleInsertLink() {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .setLink({ href: linkUrl })
        .run();
      setLinkUrl('');
      setIsLinkDialogOpen(false);
    }
  }

  function toggleUpperCase() {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    if (text) {
      editor.chain().focus().insertContent(text.toUpperCase()).run();
    }
  }

  return (
    <div
      style={{
        border: 'var(--border-hairline)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-1)',
          padding: 'var(--space-2)',
          backgroundColor: 'var(--surface-sunken)',
          borderBottom: 'var(--border-hairline)',
        }}
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`sd-btn sd-btn--sm${editor.isActive('bold') ? ' sd-btn--primary' : ' sd-btn--ghost'}`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`sd-btn sd-btn--sm${editor.isActive('italic') ? ' sd-btn--primary' : ' sd-btn--ghost'}`}
          title="Itálico (Ctrl+I)"
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`sd-btn sd-btn--sm${editor.isActive('underline') ? ' sd-btn--primary' : ' sd-btn--ghost'}`}
          title="Sublinhado (Ctrl+U)"
        >
          <UnderlineIcon size={16} />
        </button>

        <div style={{ width: 1, backgroundColor: 'var(--border-color)' }} />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`sd-btn sd-btn--sm${editor.isActive('heading', { level: 2 }) ? ' sd-btn--primary' : ' sd-btn--ghost'}`}
          title="Heading 2"
        >
          <Type size={16} />
        </button>

        <button
          type="button"
          onClick={() => toggleUpperCase()}
          className="sd-btn sd-btn--sm sd-btn--ghost"
          title="Converter para MAIÚSCULAS"
        >
          <TypeIcon size={16} />
        </button>

        <div style={{ width: 1, backgroundColor: 'var(--border-color)' }} />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`sd-btn sd-btn--sm${editor.isActive('bulletList') ? ' sd-btn--primary' : ' sd-btn--ghost'}`}
          title="Lista com bullet"
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`sd-btn sd-btn--sm${editor.isActive('orderedList') ? ' sd-btn--primary' : ' sd-btn--ghost'}`}
          title="Lista numerada"
        >
          <ListOrdered size={16} />
        </button>

        <div style={{ width: 1, backgroundColor: 'var(--border-color)' }} />

        <button
          type="button"
          onClick={() => setIsLinkDialogOpen(true)}
          className="sd-btn sd-btn--sm sd-btn--ghost"
          title="Inserir link"
        >
          <LinkIcon size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().run()}
          className="sd-btn sd-btn--sm sd-btn--ghost"
          title="Limpar formatação"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Editor content */}
      <div
        style={{
          padding: 'var(--space-3)',
          minHeight: 200,
          backgroundColor: 'var(--surface-raised)',
          fontSize: 'var(--fs-base)',
          lineHeight: 'var(--lh-relaxed)',
          color: 'var(--text-default)',
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Link dialog */}
      {isLinkDialogOpen && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--surface-sunken)',
            borderTop: 'var(--border-hairline)',
            display: 'flex',
            gap: 'var(--space-2)',
          }}
        >
          <input
            type="url"
            className="sd-input"
            placeholder="https://exemplo.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsertLink();
              if (e.key === 'Escape') setIsLinkDialogOpen(false);
            }}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="sd-btn sd-btn--primary"
            onClick={handleInsertLink}
          >
            Inserir
          </button>
          <button
            type="button"
            className="sd-btn sd-btn--outline"
            onClick={() => setIsLinkDialogOpen(false)}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
