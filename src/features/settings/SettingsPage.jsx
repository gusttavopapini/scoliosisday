// src/features/settings/SettingsPage.jsx
// Configurações globais do site, em duas partes independentes:
//
//   · redes sociais do rodapé público (settings/socialMedia) — edição
//     inline, sem modal, no mesmo padrão visual de listagem da página de
//     Marcas (SponsorsPage.jsx): header com título/subtítulo/ação, itens em
//     sd-card individuais, sem card-wrapper externo;
//   · imagem de preview de link (settings/seo) — ver OgImageCard.jsx.
//
// O nome da página no menu continua "Redes Sociais" por decisão de
// produto: ela já foi renomeada uma vez e um campo novo não justifica mais
// churn ali. Os dois documentos do Firestore são separados de propósito —
// ver services/seoSettings.js.

import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { useSocialLinks, useSaveSocialLinks } from '../../hooks/useSettings.js';
import { newSocialLinkId } from '../../services/settings.js';
import { SOCIAL_PLATFORMS, getSocialPlatform } from '../../utils/socialPlatforms.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import SocialLinkRow from './components/SocialLinkRow.jsx';
import OgImageCard from './components/OgImageCard.jsx';

export default function SettingsPage() {
  const { data: socialLinks = [], isLoading } = useSocialLinks();
  const saveMutation = useSaveSocialLinks();

  const [editingId, setEditingId] = useState(null);
  const [draftUrl, setDraftUrl] = useState('');
  const [rowError, setRowError] = useState(null); // { id, message }
  const [isAdding, setIsAdding] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sortedLinks = [...socialLinks].sort((a, b) => a.order - b.order);
  const usedPlatformIds = new Set(sortedLinks.map((link) => link.platform));
  const availablePlatforms = SOCIAL_PLATFORMS.filter((platform) => !usedPlatformIds.has(platform.id));

  // Persiste a lista inteira (mesmo contrato de saveSocialLinks de antes:
  // substitui, não faz merge item a item) — order recalculado pela posição
  // final, que é o que o footer usa pra decidir a sequência dos ícones.
  async function persist(nextLinks, successMessage) {
    try {
      await saveMutation.mutateAsync(nextLinks.map((link, index) => ({ ...link, order: index })));
      toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar redes sociais');
      return false;
    }
  }

  // Nasce inativa: link sem URL ainda não deve aparecer no footer público.
  function handleAdd() {
    if (!selectedPlatform) return;
    const nextLinks = [
      ...sortedLinks,
      { id: newSocialLinkId(), platform: selectedPlatform, url: '', order: sortedLinks.length, active: false },
    ];
    persist(nextLinks, 'Rede social adicionada!').then((ok) => {
      if (ok) {
        setIsAdding(false);
        setSelectedPlatform('');
      }
    });
  }

  function handleStartEdit(link) {
    setEditingId(link.id);
    setDraftUrl(link.url);
    setRowError(null);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setDraftUrl('');
    setRowError(null);
  }

  async function handleConfirmEdit(link) {
    const trimmed = draftUrl.trim();
    if (link.active && !trimmed) {
      setRowError({ id: link.id, message: 'Informe uma URL ou desative esta rede.' });
      return;
    }
    const nextLinks = sortedLinks.map((item) => (item.id === link.id ? { ...item, url: trimmed } : item));
    const ok = await persist(nextLinks, 'URL atualizada!');
    if (ok) {
      setEditingId(null);
      setDraftUrl('');
      setRowError(null);
    }
  }

  async function handleToggleActive(link) {
    const nextActive = !link.active;
    if (nextActive && !link.url.trim()) {
      toast.error('Informe uma URL antes de ativar esta rede.');
      return;
    }
    const nextLinks = sortedLinks.map((item) => (item.id === link.id ? { ...item, active: nextActive } : item));
    await persist(nextLinks, nextActive ? 'Rede social ativada!' : 'Rede social desativada!');
  }

  async function handleMove(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= sortedLinks.length) return;
    const nextLinks = [...sortedLinks];
    [nextLinks[index], nextLinks[target]] = [nextLinks[target], nextLinks[index]];
    await persist(nextLinks, 'Ordem atualizada!');
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const nextLinks = sortedLinks.filter((item) => item.id !== deleteTarget.id);
    const ok = await persist(nextLinks, 'Rede social removida!');
    if (ok) setDeleteTarget(null);
  }

  return (
    <>
      <AppShell activeNav="settings" breadcrumb={t.nav.settings}>
        <div className="sda-content">
          <header className="sda-pagehead">
            <div className="sda-pagehead__meta">
              <h1 className="sd-display sd-display--sm sd-display--upright">
                {t.nav.settings}
              </h1>
              <p className="sd-muted sd-small">Ícones exibidos no rodapé do site público</p>
            </div>
            {availablePlatforms.length > 0 && (
              <button
                type="button"
                className="sd-btn sd-btn--primary"
                onClick={() => setIsAdding((prev) => !prev)}
                disabled={isLoading}
              >
                <Plus size={16} aria-hidden="true" />
                Adicionar rede social
              </button>
            )}
          </header>

          {isAdding && (
            <div
              className="sd-card"
              style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'flex-end', marginBottom: 'var(--space-4)' }}
            >
              <label className="sd-field" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                <span className="sd-label">Plataforma</span>
                <span className="sd-select-wrap">
                  <select
                    className="sd-select"
                    value={selectedPlatform}
                    onChange={(event) => setSelectedPlatform(event.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {availablePlatforms.map((platform) => (
                      <option key={platform.id} value={platform.id}>{platform.label}</option>
                    ))}
                  </select>
                </span>
              </label>
              <button
                type="button"
                className="sd-btn sd-btn--secondary"
                onClick={handleAdd}
                disabled={!selectedPlatform || saveMutation.isPending}
              >
                Adicionar
              </button>
              <button
                type="button"
                className="sd-btn sd-btn--ghost"
                onClick={() => { setIsAdding(false); setSelectedPlatform(''); }}
                disabled={saveMutation.isPending}
              >
                Cancelar
              </button>
            </div>
          )}

          {isLoading && <p className="sd-muted sd-small">Carregando...</p>}

          {!isLoading && sortedLinks.length === 0 && (
            <div className="sd-card" style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
              <p className="sd-muted">Nenhuma rede social cadastrada ainda.</p>
            </div>
          )}

          {!isLoading && sortedLinks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {sortedLinks.map((link, index) => (
                <SocialLinkRow
                  key={link.id}
                  link={link}
                  isFirst={index === 0}
                  isLast={index === sortedLinks.length - 1}
                  isEditing={editingId === link.id}
                  draftUrl={draftUrl}
                  error={rowError?.id === link.id ? rowError.message : null}
                  isBusy={saveMutation.isPending}
                  onStartEdit={() => handleStartEdit(link)}
                  onChangeDraftUrl={setDraftUrl}
                  onConfirmEdit={() => handleConfirmEdit(link)}
                  onCancelEdit={handleCancelEdit}
                  onToggleActive={() => handleToggleActive(link)}
                  onMoveUp={() => handleMove(index, -1)}
                  onMoveDown={() => handleMove(index, 1)}
                  onDeleteRequest={() => setDeleteTarget(link)}
                />
              ))}
            </div>
          )}

          {/* Segunda seção da página, independente da lista acima: nada
              aqui compartilha estado com as redes sociais. */}
          <div className="sda-settings__section">
            <OgImageCard />
          </div>
        </div>
      </AppShell>

      {deleteTarget && (
        <ConfirmModal
          title="Excluir rede social?"
          itemName={getSocialPlatform(deleteTarget.platform)?.label}
          warning={t.common.deleteConfirmBody}
          isBusy={saveMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
}
