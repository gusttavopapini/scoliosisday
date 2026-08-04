// src/features/events/components/EventsEmpty.jsx

import { Plus } from 'lucide-react';

export default function EventsEmpty({ onCreate }) {
  return (
    <div
      className="sd-card"
      style={{
        textAlign: 'center',
        padding: 'var(--space-12)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ fontSize: '48px', opacity: 0.5 }}>📅</div>
      <div>
        <h3 className="sd-subtitle">Nenhum evento ainda</h3>
        <p className="sd-muted">Crie seu primeiro evento para começar</p>
      </div>
      <button className="sd-btn sd-btn--primary" type="button" onClick={onCreate}>
        <Plus size={16} aria-hidden="true" />
        Novo evento
      </button>
    </div>
  );
}
