// src/features/settings/SettingsPage.jsx
// Configurações globais do site (seção nova) — hoje só redes sociais do
// rodapé público (settings/socialMedia), mas a página fica aberta a
// crescer com outras configurações no futuro.

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import AppShell from '../../app/AppShell.jsx';
import t from '../../i18n/pt-BR.js';
import { useSocialLinks, useSaveSocialLinks } from '../../hooks/useSettings.js';
import { getSocialPlatform } from '../../utils/socialPlatforms.js';
import SocialMediaModal from './components/SocialMediaModal.jsx';

export default function SettingsPage() {
  const [editOpen, setEditOpen] = useState(false);
  const { data: socialLinks = [], isLoading } = useSocialLinks();
  const saveMutation = useSaveSocialLinks();

  const sortedLinks = [...socialLinks].sort((a, b) => a.order - b.order);

  async function handleSave(nextLinks) {
    try {
      await saveMutation.mutateAsync(nextLinks);
      toast.success('Redes sociais atualizadas com sucesso!');
      setEditOpen(false);
    } catch (error) {
      toast.error(error.message || 'Erro ao salvar redes sociais');
    }
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
              <p className="sd-muted sd-small">Configurações globais exibidas no site público</p>
            </div>
          </header>

          <div className="sd-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <div>
                <h2 className="sd-subtitle">Redes sociais</h2>
                <p className="sd-muted sd-small">Ícones exibidos no rodapé do site público</p>
              </div>
              <button
                type="button"
                className="sd-btn sd-btn--outline"
                onClick={() => setEditOpen(true)}
                disabled={isLoading}
              >
                <Pencil size={16} aria-hidden="true" />
                Editar redes sociais
              </button>
            </div>

            {isLoading && <p className="sd-muted sd-small">Carregando...</p>}

            {!isLoading && sortedLinks.length === 0 && (
              <p className="sd-muted sd-small">Nenhuma rede social cadastrada ainda.</p>
            )}

            {!isLoading && sortedLinks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {sortedLinks.map((link) => {
                  const platform = getSocialPlatform(link.platform);
                  if (!platform) return null;
                  const { Icon } = platform;

                  return (
                    <div
                      key={link.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: 'var(--space-3)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <Icon size={20} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--teal-600)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>
                          {platform.label}
                        </p>
                        <p className="sd-small sd-muted" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {link.url || 'Sem URL definida'}
                        </p>
                      </div>
                      <span className={`sd-badge${link.active ? ' sd-badge--teal' : ' sd-badge--neutral'}`}>
                        {link.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </AppShell>

      {editOpen && (
        <SocialMediaModal
          initialLinks={sortedLinks}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
          isSaving={saveMutation.isPending}
        />
      )}
    </>
  );
}
