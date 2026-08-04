// src/features/collaborators/EditCollaboratorPage.jsx
// Página para editar colaborador — Fase 2.

import { useParams } from 'react-router-dom';
import { useCollaborator } from '../../hooks/useCollaborators.js';
import AppShell from '../../app/AppShell.jsx';
import CollaboratorForm from './components/CollaboratorForm.jsx';

export default function EditCollaboratorPage() {
  const { id } = useParams();
  const { data: collaborator, isLoading, error } = useCollaborator(id);

  if (isLoading) {
    return (
      <AppShell activeNav="collaborators" breadcrumb="Carregando...">
        <div className="sda-content" style={{ padding: 'var(--space-6)' }}>
          <div className="sd-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <p className="sd-muted">Carregando colaborador...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !collaborator) {
    return (
      <AppShell activeNav="collaborators" breadcrumb="Erro">
        <div className="sda-content" style={{ padding: 'var(--space-6)' }}>
          <div className="sd-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <p className="sd-muted">Colaborador não encontrado</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="collaborators" breadcrumb={`Editar ${collaborator.fullName}`}>
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Editar Colaborador
            </h1>
            <p className="sd-muted sd-small">Atualize as informações de {collaborator.fullName}</p>
          </div>
        </header>

        <CollaboratorForm
          initialData={{
            ...collaborator,
            firstName: collaborator.fullName?.split(' ')[0] || '',
            lastName: collaborator.fullName?.split(' ').slice(1).join(' ') || '',
          }}
          isEditMode={true}
        />
      </div>
    </AppShell>
  );
}
