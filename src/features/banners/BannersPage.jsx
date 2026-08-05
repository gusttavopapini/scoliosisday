// src/features/banners/BannersPage.jsx
// Listagem de banners — tabela paginada, sem cascata (nada mais referencia
// um banner: excluir é sempre seguro).

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { useBannersPage, useDeleteBanner } from '../../hooks/useBanners.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import LoadMore from '../../components/ui/LoadMore.jsx';
import BannersTable from './components/BannersTable.jsx';
import BannersSkeleton from './components/BannersSkeleton.jsx';
import BannersEmpty from './components/BannersEmpty.jsx';

export default function BannersPage() {
  const navigate = useNavigate();

  const { banners, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useBannersPage();
  const deleteMutation = useDeleteBanner();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const isEmpty = banners.length === 0 && !isLoading;

  function handleEdit(banner) {
    navigate(`/painel/banners/${banner.id}/editar`);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Banner excluído com sucesso!');
      },
      onError: (error) => toast.error(error.message || 'Erro ao excluir banner'),
    });
  }

  return (
    <>
      <AppShell activeNav="banners" breadcrumb={t.banners.title}>
        <div className="sda-content">
          <header className="sda-pagehead">
            <div className="sda-pagehead__meta">
              <h1 className="sd-display sd-display--sm sd-display--upright">
                {t.banners.title}
              </h1>
              <p className="sd-muted sd-small">{t.banners.subtitle}</p>
            </div>
            <button
              className="sd-btn sd-btn--primary"
              type="button"
              onClick={() => navigate('/painel/banners/novo')}
              disabled={isLoading}
              aria-label={t.banners.create}
            >
              <Plus size={16} aria-hidden="true" />
              {t.banners.create}
            </button>
          </header>

          {isLoading && <BannersSkeleton />}

          {isEmpty && (
            <BannersEmpty onCreate={() => navigate('/painel/banners/novo')} />
          )}

          {!isEmpty && !isLoading && (
            <BannersTable
              banners={banners}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          )}

          {!isEmpty && (
            <LoadMore
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
              label="Carregar mais banners"
            />
          )}
        </div>
      </AppShell>

      {deleteTarget && (
        <ConfirmModal
          title={t.common.deleteConfirmTitle.replace('{name}', deleteTarget.headline)}
          itemName={deleteTarget.headline}
          warning={t.common.deleteConfirmBody}
          isBusy={deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}
