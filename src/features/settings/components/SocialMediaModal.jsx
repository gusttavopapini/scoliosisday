// src/features/settings/components/SocialMediaModal.jsx
// Edição da lista de redes sociais (settings/socialMedia) — ícone da
// plataforma, URL, ativo/inativo, reordenar (setas — lista curta, no
// máximo 7 itens, não justifica trazer @dnd-kit só pra isto) e remover.
// "Adicionar rede social" só oferece plataformas ainda não usadas —
// nunca duplica.

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import Modal from '../../../components/ui/Modal.jsx';
import { SOCIAL_PLATFORMS, getSocialPlatform } from '../../../utils/socialPlatforms.js';
import { newSocialLinkId } from '../../../services/settings.js';

/**
 * @param {{
 *   initialLinks: { id: string, platform: string, url: string, order: number, active: boolean }[],
 *   onClose: () => void,
 *   onSave: (links: object[]) => Promise<void>,
 *   isSaving?: boolean,
 * }} props
 */
export default function SocialMediaModal({ initialLinks, onClose, onSave, isSaving = false }) {
  const [links, setLinks] = useState(() => initialLinks.map((link) => ({ ...link })));
  const [selectedPlatform, setSelectedPlatform] = useState('');
  // { [linkId]: mensagem } — só para links ativos sem URL.
  const [errors, setErrors] = useState({});

  const usedPlatformIds = new Set(links.map((link) => link.platform));
  const availablePlatforms = SOCIAL_PLATFORMS.filter((platform) => !usedPlatformIds.has(platform.id));

  function updateLink(id, patch) {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, ...patch } : link)));
  }

  function removeLink(id) {
    setLinks((prev) => prev.filter((link) => link.id !== id));
    setErrors((prev) => {
      const { [id]: _removed, ...rest } = prev;
      return rest;
    });
  }

  function moveLink(index, delta) {
    setLinks((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleAdd() {
    if (!selectedPlatform) return;
    setLinks((prev) => [
      ...prev,
      { id: newSocialLinkId(), platform: selectedPlatform, url: '', order: prev.length, active: true },
    ]);
    setSelectedPlatform('');
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    for (const link of links) {
      if (link.active && !link.url.trim()) {
        nextErrors[link.id] = 'Informe uma URL ou desative esta rede.';
      }
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // order recalculado pela posição final na lista — é o que o site
    // público usa pra decidir a sequência dos ícones.
    onSave(links.map((link, index) => ({ ...link, order: index })));
  }

  return (
    <Modal labelledBy="social-media-title" onClose={onClose} isBusy={isSaving}>
      <form onSubmit={handleSubmit}>
        <div className="sda-modal__head">
          <h2 id="social-media-title">Redes sociais</h2>
          <button
            className="sd-btn sd-btn--ghost sd-btn--sm"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div className="sda-modal__body">
          {links.length === 0 && (
            <p className="sd-muted sd-small" style={{ marginBottom: 'var(--space-4)' }}>
              Nenhuma rede social adicionada ainda.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {links.map((link, index) => {
              const platform = getSocialPlatform(link.platform);
              if (!platform) return null;
              const { Icon } = platform;

              return (
                <div key={link.id} className="sd-card" style={{ padding: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <Icon size={20} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--teal-600)' }} />
                    <span style={{ fontWeight: 'var(--fw-semibold)', flexShrink: 0, minWidth: '90px' }}>
                      {platform.label}
                    </span>

                    <input
                      type="url"
                      className="sd-input"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(event) => updateLink(link.id, { url: event.target.value })}
                      style={{ flex: 1, minWidth: '180px' }}
                    />

                    <label className="sda-switch" style={{ flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={link.active}
                        onChange={(event) => updateLink(link.id, { active: event.target.checked })}
                      />
                      <span className="sda-switch__track" aria-hidden="true" />
                      <span className="sda-switch__label">{link.active ? 'Ativo' : 'Inativo'}</span>
                    </label>

                    <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="sd-btn sd-btn--ghost sd-btn--sm"
                        onClick={() => moveLink(index, -1)}
                        disabled={index === 0}
                        aria-label={`Mover ${platform.label} para cima`}
                      >
                        <ChevronUp size={14} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="sd-btn sd-btn--ghost sd-btn--sm"
                        onClick={() => moveLink(index, 1)}
                        disabled={index === links.length - 1}
                        aria-label={`Mover ${platform.label} para baixo`}
                      >
                        <ChevronDown size={14} aria-hidden="true" />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="sd-btn sd-btn--ghost sd-btn--sm"
                      onClick={() => removeLink(link.id)}
                      aria-label={`Remover ${platform.label}`}
                    >
                      <Trash2 size={16} aria-hidden="true" style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                  {errors[link.id] && <span className="sd-error">{errors[link.id]}</span>}
                </div>
              );
            })}
          </div>

          {availablePlatforms.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', alignItems: 'flex-end' }}>
              <label className="sd-field" style={{ flex: 1, marginBottom: 0 }}>
                <span className="sd-label">Adicionar rede social</span>
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
                disabled={!selectedPlatform}
              >
                <Plus size={16} aria-hidden="true" />
                Adicionar
              </button>
            </div>
          )}
        </div>

        <div className="sda-modal__foot">
          <button className="sd-btn sd-btn--outline" type="button" onClick={onClose} disabled={isSaving}>
            Cancelar
          </button>
          <button className="sd-btn sd-btn--primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
