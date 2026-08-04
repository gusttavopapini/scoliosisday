// src/features/programmings/EditProgrammingPage.jsx
// Página para editar programação existente.

import { useParams } from 'react-router-dom';
import AppShell from '../../app/AppShell.jsx';
import { useProgramming } from '../../hooks/useProgrammings.js';
import ProgrammingForm from './components/ProgrammingForm.jsx';

export default function EditProgrammingPage() {
  const { id } = useParams();
  const { data: programming, isLoading } = useProgramming(id);

  if (isLoading) {
    return (
      <AppShell activeNav="schedules" breadcrumb="Carregando...">
        <div className="sda-content">
          <div className="sd-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <p className="sd-muted">Carregando...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="schedules" breadcrumb="Editar programação">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Editar programação
            </h1>
            <p className="sd-muted sd-small">Atualize a programação de sessões</p>
          </div>
        </header>

        <div className="sd-card">
          {programming && <ProgrammingForm initialData={programming} isEditMode={true} />}
        </div>
      </div>
    </AppShell>
  );
}
