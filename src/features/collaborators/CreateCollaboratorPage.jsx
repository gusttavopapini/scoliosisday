// src/features/collaborators/CreateCollaboratorPage.jsx
// Página para criar novo colaborador — Fase 2.

import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import CollaboratorForm from './components/CollaboratorForm.jsx';

export default function CreateCollaboratorPage() {
  return (
    <AppShell activeNav="collaborators" breadcrumb="Novo colaborador">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              {t.collaborators.create}
            </h1>
            <p className="sd-muted sd-small">Crie um novo colaborador no painel</p>
          </div>
        </header>

        <CollaboratorForm isEditMode={false} />
      </div>
    </AppShell>
  );
}
