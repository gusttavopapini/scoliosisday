// src/features/programmings/CreateProgrammingPage.jsx
// Página para criar nova programação.

import AppShell from '../../app/AppShell.jsx';
import ProgrammingForm from './components/ProgrammingForm.jsx';

export default function CreateProgrammingPage() {
  return (
    <AppShell activeNav="schedules" breadcrumb="Nova programação">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Nova programação
            </h1>
            <p className="sd-muted sd-small">Crie uma nova programação de sessões</p>
          </div>
        </header>

        <div className="sd-card">
          <ProgrammingForm />
        </div>
      </div>
    </AppShell>
  );
}
