// src/features/sponsors/CreateSponsorPage.jsx
// Página para criar novo patrocinador.

import AppShell from '../../app/AppShell.jsx';
import SponsorForm from './components/SponsorForm.jsx';

export default function CreateSponsorPage() {
  return (
    <AppShell activeNav="sponsors" breadcrumb="Nova marca">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Nova marca
            </h1>
            <p className="sd-muted sd-small">Adicione uma nova marca patrocinadora ou apoiadora</p>
          </div>
        </header>

        <div className="sd-card">
          <SponsorForm />
        </div>
      </div>
    </AppShell>
  );
}
