// src/features/programmings/components/SessionCard.jsx
// Card de sessão reordenável.

import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CollaboratorCardSelect from '../../../components/form/CollaboratorCardSelect.jsx';

export default function SessionCard({
  session,
  index,
  onUpdate,
  onDelete,
  collaborators,
  canDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: session.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className="sd-card"
      style={{
        ...style,
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start',
        padding: 'var(--space-4)',
      }}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="sd-btn sd-btn--ghost"
        style={{
          flexShrink: 0,
          cursor: 'grab',
          padding: 'var(--space-2)',
          color: 'var(--text-muted)',
        }}
        aria-label="Reordenar"
        title="Arraste para reordenar"
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
            <span className="sd-label" style={{ fontSize: 'var(--text-sm)' }}>Título</span>
            <input
              className="sd-input"
              type="text"
              placeholder="Ex: Abertura do evento"
              value={session.title}
              onChange={(e) => onUpdate({ ...session, title: e.target.value })}
              style={{ marginTop: 'var(--space-1)' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
            <span className="sd-label" style={{ fontSize: 'var(--text-sm)' }}>Tema</span>
            <input
              className="sd-input"
              type="text"
              placeholder="Ex: Inovações no tratamento"
              value={session.theme}
              onChange={(e) => onUpdate({ ...session, theme: e.target.value })}
              style={{ marginTop: 'var(--space-1)' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <label>
            <span className="sd-label" style={{ fontSize: 'var(--text-sm)' }}>Início</span>
            <input
              className="sd-input"
              type="time"
              value={session.startTime}
              onChange={(e) => onUpdate({ ...session, startTime: e.target.value })}
              style={{ marginTop: 'var(--space-1)' }}
            />
          </label>
          <label>
            <span className="sd-label" style={{ fontSize: 'var(--text-sm)' }}>Fim (opcional)</span>
            <input
              className="sd-input"
              type="time"
              value={session.endTime || ''}
              onChange={(e) => onUpdate({ ...session, endTime: e.target.value || null })}
              style={{ marginTop: 'var(--space-1)' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <span className="sd-label" style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            Palestrantes
          </span>
          <CollaboratorCardSelect
            value={session.speakers}
            onChange={(speakers) => onUpdate({ ...session, speakers })}
            collaborators={collaborators}
            searchPlaceholder="Buscar palestrante..."
            emptyMessage="Nenhum colaborador cadastrado como palestrante."
          />
        </div>

        {session.speakers.length === 0 && (
          <div style={{ color: 'var(--danger)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>
            ⚠ Mínimo 1 palestrante obrigatório
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDelete(index)}
        disabled={!canDelete}
        className="sd-btn sd-btn--outline sd-btn--danger sd-btn--sm"
        style={{ flexShrink: 0 }}
        aria-label="Excluir sessão"
        title={canDelete ? 'Excluir' : 'Não é possível remover o último card'}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
