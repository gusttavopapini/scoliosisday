// src/features/events/CreateEventPage.jsx
// Página para criar novo evento

import AppShell from '../../app/AppShell.jsx';
import EventForm from './components/EventForm.jsx';

export default function CreateEventPage() {
  return (
    <AppShell activeNav="events" breadcrumb="Nova edição">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Criar Edição
            </h1>
            <p className="sd-muted sd-small">Configure a edição em 5 passos</p>
          </div>
        </header>

        <div className="sd-card">
          <EventForm />
        </div>
      </div>
    </AppShell>
  );
}
