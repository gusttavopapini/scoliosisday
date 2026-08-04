// src/components/form/CollaboratorCardSelect.jsx
// Seletor multi-escolha de colaboradores em cards clicáveis: busca por nome,
// clique para marcar/desmarcar, chips removíveis no rodapé.
//
// Puramente controlado (value/onChange), sem depender do React Hook Form —
// mesmo contrato do ImageUploader. Isso permite plugar tanto em campos de
// nível superior de um formulário (via Controller, ver CollaboratorMultiSelect
// nos passos do wizard de eventos) quanto em estado local aninhado, como as
// sessões de programação, que vivem fora da árvore do RHF.

import { useState } from 'react';
import { X } from 'lucide-react';
import AvatarInitials from '../ui/AvatarInitials.jsx';

/**
 * @param {{
 *   value: string[],
 *   onChange: (ids: string[]) => void,
 *   collaborators: object[],
 *   searchPlaceholder: string,
 *   emptyMessage: string,
 * }} props
 */
export default function CollaboratorCardSelect({
  value,
  onChange,
  collaborators,
  searchPlaceholder,
  emptyMessage,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = collaborators.filter((c) =>
    c.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function toggle(id) {
    const isSelected = value.includes(id);
    onChange(isSelected ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <input
        type="text"
        className="sd-input"
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {collaborators.length === 0 ? (
        <p className="sd-note">{emptyMessage}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtered.map((collaborator) => {
            const isSelected = value.includes(collaborator.id);

            return (
              <div
                key={collaborator.id}
                onClick={() => toggle(collaborator.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  border: `2px solid ${isSelected ? 'var(--teal-600)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--teal-050)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all var(--dur-fast) var(--ease-out)',
                }}
              >
                <AvatarInitials
                  name={collaborator.fullName}
                  photoUrl={collaborator.photoUrl}
                  id={collaborator.id}
                  className="sda-avatar"
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: 'var(--text-body)' }}>
                      {collaborator.fullName}
                    </h4>
                    {isSelected && (
                      <span style={{ color: 'var(--teal-600)', fontSize: '12px', flexShrink: 0 }}>✓</span>
                    )}
                  </div>
                  {collaborator.minibio && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {collaborator.minibio}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-default)' }}>
          {value.map((id) => {
            const collaborator = collaborators.find((c) => c.id === id);
            if (!collaborator) return null;

            return (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--surface-sunken)',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '12px',
                  color: 'var(--text-body)',
                }}
              >
                {collaborator.fullName}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((v) => v !== id));
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
