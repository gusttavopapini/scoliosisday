// src/features/events/EditEventPage.jsx
// Página para editar evento existente

import { useParams } from 'react-router-dom';
import AppShell from '../../app/AppShell.jsx';
import { useEvent } from '../../hooks/useEvents.js';
import EventForm from './components/EventForm.jsx';

export default function EditEventPage() {
  const { id } = useParams();
  const { data: event, isLoading } = useEvent(id);

  if (isLoading) {
    return (
      <AppShell activeNav="events" breadcrumb="Carregando...">
        <div className="sda-content">
          <div className="sd-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <p className="sd-muted">Carregando...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="events" breadcrumb="Editar evento">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Editar Evento
            </h1>
            <p className="sd-muted sd-small">Atualize as informações do evento</p>
          </div>
        </header>

        <div className="sd-card">
          {event && <EventForm initialData={event} isEditMode={true} />}
        </div>
      </div>
    </AppShell>
  );
}
