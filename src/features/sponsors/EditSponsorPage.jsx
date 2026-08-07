// src/features/sponsors/EditSponsorPage.jsx
// Página para editar patrocinador existente.

import { useParams } from 'react-router-dom';
import AppShell from '../../app/AppShell.jsx';
import { useSponsor } from '../../hooks/useSponsors.js';
import SponsorForm from './components/SponsorForm.jsx';

export default function EditSponsorPage() {
  const { id } = useParams();
  const { data: sponsor, isLoading } = useSponsor(id);

  if (isLoading) {
    return (
      <AppShell activeNav="sponsors" breadcrumb="Carregando...">
        <div className="sda-content">
          <div className="sd-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <p className="sd-muted">Carregando...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="sponsors" breadcrumb="Editar marca">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Editar marca
            </h1>
            <p className="sd-muted sd-small">Atualize as informações da marca</p>
          </div>
        </header>

        <div className="sd-card">
          {sponsor && <SponsorForm initialData={sponsor} isEditMode={true} />}
        </div>
      </div>
    </AppShell>
  );
}
