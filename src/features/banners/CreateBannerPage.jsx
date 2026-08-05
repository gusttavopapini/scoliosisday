// src/features/banners/CreateBannerPage.jsx
// Página para criar novo banner.

import AppShell from '../../app/AppShell.jsx';
import BannerForm from './components/BannerForm.jsx';

export default function CreateBannerPage() {
  return (
    <AppShell activeNav="banners" breadcrumb="Novo banner">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Novo banner
            </h1>
            <p className="sd-muted sd-small">Adicione um novo banner ao carrossel da Home</p>
          </div>
        </header>

        <div className="sd-card">
          <BannerForm />
        </div>
      </div>
    </AppShell>
  );
}
