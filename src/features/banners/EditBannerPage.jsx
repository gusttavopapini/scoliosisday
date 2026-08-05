// src/features/banners/EditBannerPage.jsx
// Página para editar banner existente.

import { useParams } from 'react-router-dom';
import AppShell from '../../app/AppShell.jsx';
import { useBanner } from '../../hooks/useBanners.js';
import BannerForm from './components/BannerForm.jsx';

export default function EditBannerPage() {
  const { id } = useParams();
  const { data: banner, isLoading } = useBanner(id);

  if (isLoading) {
    return (
      <AppShell activeNav="banners" breadcrumb="Carregando...">
        <div className="sda-content">
          <div className="sd-card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <p className="sd-muted">Carregando...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="banners" breadcrumb="Editar banner">
      <div className="sda-content">
        <header className="sda-pagehead">
          <div className="sda-pagehead__meta">
            <h1 className="sd-display sd-display--sm sd-display--upright">
              Editar banner
            </h1>
            <p className="sd-muted sd-small">Atualize as informações do banner</p>
          </div>
        </header>

        <div className="sd-card">
          {banner && <BannerForm initialData={banner} isEditMode={true} />}
        </div>
      </div>
    </AppShell>
  );
}
