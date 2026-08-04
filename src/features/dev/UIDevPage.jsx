// src/features/dev/UIDevPage.jsx
// Catálogo visual de todos os componentes sda-* e sd-* em uso no painel.
// Esta rota existe apenas em desenvolvimento (/dev/ui).
// Quebrada em subcomponentes no final do arquivo para manter legibilidade.

import { useState } from 'react';
import {
  LayoutDashboard, Users, Calendar, Building2, Star, Menu, X,
  Search, Plus, Pencil, Trash2, Download, GripVertical,
  CheckCircle, AlertCircle, ChevronLeft, ChevronRight,
  MoreVertical, Upload, Palette, Settings, LogOut, FileText,
  Home, Image, Video, Link, Bold, Italic, List, Bell, User,
  Shield, Eye, Filter, Type, Hash, Code, Layers, Globe,
} from 'lucide-react';
import t from '../../i18n/pt-BR.js';
import { AVATAR_COLORS, COLLABORATOR_TYPES } from '../../utils/constants.js';
import { getInitials, avatarColorIndex } from '../../utils/initials.js';
import { toDate } from '../../utils/formatTimestamp.js';

// ---- Mock data ----
const MOCK_COLLABORATORS = [
  { id: 'collab-ana',     fullName: 'Dra. Ana Lima',         type: COLLABORATOR_TYPES.SPEAKER,            createdAt: new Date('2026-01-15') },
  { id: 'collab-carlos',  fullName: 'Prof. Carlos Mendes',   type: COLLABORATOR_TYPES.SCIENTIFIC_CURATOR, createdAt: new Date('2026-02-03') },
  { id: 'collab-beatriz', fullName: 'Beatriz Santos',        type: COLLABORATOR_TYPES.ORGANIZER,          createdAt: new Date('2026-02-20') },
  { id: 'collab-fernando',fullName: 'Dr. Fernando Costa',    type: COLLABORATOR_TYPES.SPEAKER,            createdAt: new Date('2026-03-01') },
];

const MOCK_SESSIONS = [
  { time: '09:00', title: 'Abertura e boas-vindas', speaker: 'Comissão organizadora · Auditório principal' },
  { time: '09:30', title: 'Inovações no tratamento cirúrgico da escoliose', speaker: 'Dra. Ana Lima · HC-USP' },
  { time: '10:30', title: 'Fisioterapia pré e pós-operatória', speaker: 'Prof. Carlos Mendes · UNIFESP' },
];

const MOCK_ICONS = [
  LayoutDashboard, Users, Calendar, Building2, Star, Menu, Search, Plus,
  Pencil, Trash2, Download, GripVertical, CheckCircle, AlertCircle,
  ChevronLeft, ChevronRight, MoreVertical, Upload, Palette, Settings,
  LogOut, Home, Image, Video, Link, Bold, Italic, List, Bell, User,
  Shield, Eye, Filter, Type, Hash, Code, Layers, Globe,
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: t.nav.dashboard },
  { icon: Calendar,        label: t.nav.events },
  { icon: Users,           label: t.nav.collaborators },
  { icon: Building2,       label: t.nav.sponsors },
  { icon: FileText,        label: t.nav.schedules },
  { icon: Star,            label: t.nav.staff },
  { icon: Palette,         label: 'UI Catalog', active: true },
];

const TYPE_TAG_CLASS = {
  speaker:            'sd-tag sd-tag--orange',
  scientific_curator: 'sd-tag',
  organizer:          'sd-tag sd-tag--neutral',
};

// ============================================================
// Sub-componentes locais
// ============================================================

function Avatar({ person, size }) {
  const colorIdx = avatarColorIndex(person.id, AVATAR_COLORS.length);
  const sizeClass = size === 'sm' ? ' sda-avatar--sm' : size === 'lg' ? ' sda-avatar--lg' : '';
  return (
    <div
      className={`sda-avatar${sizeClass}`}
      style={{ backgroundColor: AVATAR_COLORS[colorIdx] }}
      aria-label={person.fullName}
      title={person.fullName}
    >
      {getInitials(person.fullName)}
    </div>
  );
}

function TypeTag({ type }) {
  return (
    <span className={TYPE_TAG_CLASS[type] ?? 'sd-tag'}>
      {t.collaboratorType[type]}
    </span>
  );
}

function CatalogSection({ id, title, children }) {
  return (
    <section
      id={id}
      style={{ marginBottom: 'var(--space-12)' }}
      aria-labelledby={`${id}-heading`}
    >
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h2
          id={`${id}-heading`}
          style={{
            fontFamily: 'var(--font-text)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--fw-semibold)',
            letterSpacing: 'var(--ls-label)',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            margin: 'var(--space-0)',
          }}
        >
          {title}
        </h2>
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            height: 'var(--border-width)',
            background: 'var(--border-subtle)',
            marginTop: 'var(--space-3)',
          }}
        />
      </div>
      {children}
    </section>
  );
}

// ============================================================
// Página principal
// ============================================================

export default function UIDevPage() {
  const [modalOpen,    setModalOpen]    = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [page,         setPage]         = useState(3);
  const [iconSearch,   setIconSearch]   = useState('');

  const filteredIcons = MOCK_ICONS.filter((_, i) =>
    iconSearch === '' || String(i).includes(iconSearch)
  );

  return (
    <>
      <div className="sda-shell">

        {/* ── SIDEBAR ── */}
        <aside
          className={`sda-sidebar${sidebarOpen ? ' sda-sidebar--open' : ''}`}
          aria-label="Navegação principal"
        >
          <div className="sda-sidebar__logo">
            <div className="sda-sidebar__logo-text">Scoliosis<br />Day</div>
            <span className="sda-sidebar__logo-sub">Painel Admin</span>
          </div>

          <nav>
            <span className="sda-sidebar__section-label">Menu</span>
            {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
              <a
                key={label}
                href="#"
                className={`sda-navitem${active ? ' sda-navitem--active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={(e) => e.preventDefault()}
              >
                <span className="sda-navitem__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                {label}
              </a>
            ))}
          </nav>

          <div className="sda-sidebar__footer">
            <button className="sda-navitem" type="button">
              <span className="sda-navitem__icon" aria-hidden="true">
                <Settings size={18} />
              </span>
              Configurações
            </button>
            <button className="sda-navitem" type="button">
              <span className="sda-navitem__icon" aria-hidden="true">
                <LogOut size={18} />
              </span>
              {t.nav.logout}
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="sda-sidebar-backdrop sda-sidebar-backdrop--visible"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── MAIN ── */}
        <main className="sda-main">

          {/* Topbar */}
          <header className="sda-topbar">
            <div className="sda-topbar__left">
              <button
                className="sda-topbar__menu-btn"
                type="button"
                aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              </button>
              <div className="sda-topbar__breadcrumb">
                Scoliosis Day&nbsp;/&nbsp;<span>UI Catalog</span>
              </div>
            </div>
            <div className="sda-topbar__right">
              <span className="sd-badge sd-badge--teal">Dev</span>
              <div
                className="sda-avatar"
                style={{ backgroundColor: 'var(--teal-800)' }}
                title="Usuário dev"
              >
                GP
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="sda-content">

            {/* Page header */}
            <header className="sda-pagehead">
              <div className="sda-pagehead__meta">
                <h1 className="sd-display sd-display--sm sd-display--upright">
                  Catálogo de Componentes
                </h1>
                <p className="sd-muted sd-small">
                  Primitivos <code>sda-*</code> e kit <code>sd-*</code> — Fase 1b
                </p>
              </div>
              <span className="sd-tag sd-tag--orange sd-tag--solid">Fase 1b</span>
            </header>

            {/* ── 1. SHELL ── */}
            <CatalogSection id="section-shell" title="1. Shell & Layout — sda-shell · sda-sidebar · sda-navitem · sda-topbar · sda-pagehead · sda-toolbar">
              <div className="sd-card">
                <p className="sd-muted sd-small">
                  ✓ Você está dentro do shell agora: sidebar fixa 260px · topbar sticky 64px · conteúdo em <code>sda-content</code>.
                  Abaixo de 900px a sidebar vira gaveta (botão ≡ aparece no topbar).
                </p>
              </div>
              <div style={{ marginTop: 'var(--space-5)' }}>
                <div className="sda-toolbar">
                  <label className="sd-field sda-toolbar__search">
                    <span className="sr-only">{t.common.search}</span>
                    <input className="sd-input" type="search" placeholder={t.collaborators.searchPlaceholder} />
                  </label>
                  <span className="sd-select-wrap">
                    <select className="sd-select" aria-label={t.collaborators.filterByType}>
                      <option>{t.common.allTypes}</option>
                      <option>{t.collaboratorType.speaker}</option>
                    </select>
                  </span>
                  <button className="sd-btn sd-btn--primary" type="button">
                    <Plus size={16} aria-hidden="true" />
                    {t.collaborators.create}
                  </button>
                </div>
              </div>
            </CatalogSection>

            {/* ── 2. TYPOGRAPHY ── */}
            <CatalogSection id="section-type" title="2. Tipografia — sd-display · sd-lead · sd-muted · sd-small · sd-label · sd-em-*">
              <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <h2 className="sd-display sd-display--lg sd-display--upright">DISPLAY LG · BARLOW CONDENSED</h2>
                <h3 className="sd-display sd-display--md sd-display--upright">Display MD · Barlow Condensed</h3>
                <h4 className="sd-display sd-display--sm sd-display--upright">Display SM · Barlow Condensed</h4>
                <div className="sd-rule" aria-hidden="true"><i /><i /><i /><i /></div>
                <p className="sd-lead">Lead — Open Sans 18px. Para descrições de seção e chamadas.</p>
                <p>Corpo — Open Sans 16px. Tabelas, formulários, conteúdo geral.</p>
                <p className="sd-muted">Muted — informações secundárias, datas, metadados.</p>
                <p className="sd-small">Small — 14px, rótulos e notas de apoio.</p>
                <p className="sd-label">RÓTULO CAIXA ALTA — tracking + 12px</p>
                <p>Destaque <span className="sd-em-teal">teal bold</span> e <span className="sd-em-orange">laranja bold</span> inline.</p>
              </div>
            </CatalogSection>

            {/* ── 3. BUTTONS ── */}
            <CatalogSection id="section-buttons" title="3. Botões (sd-btn) — primary · secondary · outline · ghost · on-dark · sm · lg">
              <div className="sd-card" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
                <button className="sd-btn sd-btn--primary" type="button">
                  <Plus size={16} aria-hidden="true" /> Primary
                </button>
                <button className="sd-btn sd-btn--secondary" type="button">Secondary</button>
                <button className="sd-btn sd-btn--outline" type="button">Outline</button>
                <button className="sd-btn sd-btn--ghost" type="button">Ghost</button>
                <button className="sd-btn sd-btn--primary sd-btn--sm" type="button">Small</button>
                <button className="sd-btn sd-btn--primary sd-btn--lg" type="button">Large</button>
                <button className="sd-btn sd-btn--primary" type="button" disabled>Desabilitado</button>
              </div>
              <div
                className="sd-surface-dark"
                style={{ padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}
              >
                <button className="sd-btn sd-btn--on-dark" type="button">On Dark</button>
                <button className="sd-btn sd-btn--ghost" type="button" style={{ color: 'var(--white)', borderColor: 'var(--white)' }}>Ghost on Dark</button>
              </div>
            </CatalogSection>

            {/* ── 4. TAGS ── */}
            <CatalogSection id="section-tags" title="4. Tags, Badges & Medalhões — sd-tag · sd-badge · sd-icon-badge">
              <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <span className="sd-tag">Teal</span>
                  <span className="sd-tag sd-tag--orange">Laranja</span>
                  <span className="sd-tag sd-tag--neutral">Neutro</span>
                  <span className="sd-tag sd-tag--solid">Sólido Teal</span>
                  <span className="sd-tag sd-tag--orange sd-tag--solid">Sólido Laranja</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <span className="sd-badge">9</span>
                  <span className="sd-badge sd-badge--teal">12</span>
                  <span className="sd-badge sd-badge--success">3</span>
                  <span className="sd-badge sd-badge--danger">!</span>
                  <span className="sd-badge sd-badge--neutral">0</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'center' }}>
                  <span className="sd-icon-badge sd-icon-badge--sm"><Users size={16} aria-hidden="true" /></span>
                  <span className="sd-icon-badge"><Star size={22} aria-hidden="true" /></span>
                  <span className="sd-icon-badge sd-icon-badge--lg"><Calendar size={28} aria-hidden="true" /></span>
                  <span className="sd-icon-badge sd-icon-badge--teal-soft"><Building2 size={22} aria-hidden="true" /></span>
                  <span className="sd-icon-badge sd-icon-badge--orange"><Plus size={22} aria-hidden="true" /></span>
                </div>
              </div>
            </CatalogSection>

            {/* ── 5. AVATAR ── */}
            <CatalogSection id="section-avatar" title="5. Avatar (sda-avatar) — iniciais · paleta determinística seção 12.7">
              <div className="sd-card">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', alignItems: 'flex-end' }}>
                  {MOCK_COLLABORATORS.map((c) => (
                    <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Avatar person={c} size="lg" />
                      <Avatar person={c} />
                      <Avatar person={c} size="sm" />
                      <span className="sd-label">{getInitials(c.fullName)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CatalogSection>

            {/* ── 6. FORMS ── */}
            <CatalogSection id="section-forms" title="6. Formulários (sd-field) — sd-input · sd-select · sd-textarea · sd-checkbox · sd-form--panel">
              <form className="sd-form sd-form--panel" onSubmit={(e) => e.preventDefault()}>
                <label className="sd-field">
                  <span className="sd-field__label" htmlFor="demo-name">Nome completo</span>
                  <input id="demo-name" className="sd-input" type="text" placeholder="Dr. Fulano de Tal" />
                  <span className="sd-field__hint">Como aparecerá no certificado.</span>
                </label>
                <label className="sd-field">
                  <span className="sd-field__label" htmlFor="demo-type">Tipo</span>
                  <span className="sd-select-wrap">
                    <select id="demo-type" className="sd-select">
                      <option>{t.collaboratorType.speaker}</option>
                      <option>{t.collaboratorType.scientific_curator}</option>
                    </select>
                  </span>
                </label>
                <div className="sd-field sd-field--error">
                  <label className="sd-field__label" htmlFor="demo-email">E-mail</label>
                  <input
                    id="demo-email"
                    className="sd-input"
                    type="email"
                    placeholder="seu@email.com"
                    aria-describedby="demo-email-err"
                    aria-invalid="true"
                  />
                  <span id="demo-email-err" className="sd-field__error" aria-live="polite">
                    E-mail inválido.
                  </span>
                </div>
                <div className="sd-form__full">
                  <label className="sd-field">
                    <span className="sd-field__label" htmlFor="demo-bio">Biografia</span>
                    <textarea id="demo-bio" className="sd-textarea" rows={3} placeholder="Breve apresentação…" />
                  </label>
                </div>
                <div className="sd-form__full">
                  <label className="sd-checkbox">
                    <input type="checkbox" defaultChecked />
                    <span className="sd-checkbox__box" aria-hidden="true" />
                    <span>Exibir no site público do evento</span>
                  </label>
                </div>
              </form>
            </CatalogSection>

            {/* ── 7. TABLE ── */}
            <CatalogSection id="section-table" title="7. Tabela (sda-table) — sda-table__row · sda-table__person · sda-table__actions">
              <table className="sda-table">
                <thead>
                  <tr>
                    <th scope="col">{t.collaborators.name}</th>
                    <th scope="col">{t.collaborators.type}</th>
                    <th scope="col">{t.common.createdAt}</th>
                    <th scope="col"><span className="sr-only">{t.common.actions}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_COLLABORATORS.map((c) => (
                    <tr key={c.id} className="sda-table__row">
                      <td>
                        <div className="sda-table__person">
                          <Avatar person={c} />
                          <span>{c.fullName}</span>
                        </div>
                      </td>
                      <td><TypeTag type={c.type} /></td>
                      <td className="sd-muted sd-small">
                        {toDate(c.createdAt)?.toLocaleDateString('pt-BR')}
                      </td>
                      <td className="sda-table__actions">
                        <button
                          className="sd-btn sd-btn--ghost sd-btn--sm"
                          type="button"
                          aria-label={`${t.common.edit} ${c.fullName}`}
                        >
                          <Pencil size={15} aria-hidden="true" />
                        </button>
                        <button
                          className="sd-btn sd-btn--ghost sd-btn--sm"
                          type="button"
                          aria-label={`${t.common.delete} ${c.fullName}`}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CatalogSection>

            {/* ── 8. EMPTY STATE ── */}
            <CatalogSection id="section-empty" title="8. Estado Vazio (sda-empty)">
              <div className="sda-empty">
                <span className="sd-icon-badge sd-icon-badge--lg sd-icon-badge--teal-soft">
                  <Users size={28} aria-hidden="true" />
                </span>
                <h2 className="sd-display sd-display--sm sd-display--upright">
                  {t.collaborators.emptyTitle}
                </h2>
                <p className="sd-muted">{t.collaborators.emptyBody}</p>
                <button className="sd-btn sd-btn--primary" type="button">
                  <Plus size={16} aria-hidden="true" /> {t.collaborators.create}
                </button>
              </div>
            </CatalogSection>

            {/* ── 9. SKELETON ── */}
            <CatalogSection id="section-skeleton" title="9. Skeleton (sda-skeleton) — shimmer · prefers-reduced-motion">
              <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div
                      className="sda-skeleton"
                      style={{
                        width: 'var(--space-10)',
                        height: 'var(--space-10)',
                        borderRadius: 'var(--radius-pill)',
                        flexShrink: '0',
                      }}
                    />
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <div
                        className="sda-skeleton"
                        style={{ height: 'var(--space-4)', width: `${65 + i * 10}%` }}
                      />
                      <div
                        className="sda-skeleton"
                        style={{ height: 'var(--space-3)', width: `${35 + i * 5}%` }}
                      />
                    </div>
                    <div
                      className="sda-skeleton"
                      style={{ width: 'var(--space-16)', height: 'var(--space-6)', borderRadius: 'var(--radius-pill)' }}
                    />
                  </div>
                ))}
              </div>
            </CatalogSection>

            {/* ── 10. TOAST ── */}
            <CatalogSection id="section-toast" title="10. Toast (sda-toast) — success · error · neutro">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div className="sda-toast sda-toast--success" role="status">
                  <span className="sda-toast__icon"><CheckCircle size={18} aria-hidden="true" /></span>
                  {t.toast.saved}
                </div>
                <div className="sda-toast sda-toast--error" role="alert">
                  <span className="sda-toast__icon"><AlertCircle size={18} aria-hidden="true" /></span>
                  {t.toast.error}
                </div>
                <div className="sda-toast" role="status">
                  <span className="sda-toast__icon"><Bell size={18} aria-hidden="true" /></span>
                  {t.toast.inviteSent}
                </div>
              </div>
            </CatalogSection>

            {/* ── 11. MENU ── */}
            <CatalogSection id="section-menu" title="11. Dropdown (sda-menu) — sda-menu__item · --danger · sda-menu__divider">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  className="sd-btn sd-btn--outline sd-btn--sm"
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  id="menu-trigger"
                >
                  <MoreVertical size={16} aria-hidden="true" /> Ações
                </button>
                {menuOpen && (
                  <div
                    className="sda-menu"
                    role="menu"
                    aria-labelledby="menu-trigger"
                    style={{ top: 'calc(100% + var(--space-2))', left: '0' }}
                  >
                    <button className="sda-menu__item" role="menuitem" type="button">
                      <Pencil size={15} aria-hidden="true" /> Editar
                    </button>
                    <button className="sda-menu__item" role="menuitem" type="button">
                      <Download size={15} aria-hidden="true" /> Exportar
                    </button>
                    <div className="sda-menu__divider" aria-hidden="true" />
                    <button className="sda-menu__item sda-menu__item--danger" role="menuitem" type="button">
                      <Trash2 size={15} aria-hidden="true" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            </CatalogSection>

            {/* ── 12. MODAL ── */}
            <CatalogSection id="section-modal" title="12. Modal (sda-modal) — overlay · panel · head · body · foot · foco preso · Esc fecha">
              <button className="sd-btn sd-btn--secondary" type="button" onClick={() => setModalOpen(true)}>
                Abrir modal de demonstração
              </button>
            </CatalogSection>

            {/* ── 13. PAGINATION ── */}
            <CatalogSection id="section-pagination" title="13. Paginação (sda-pagination) — botões em cápsula · ativo em --surface-brand">
              <div className="sda-pagination" role="navigation" aria-label="Navegação de páginas">
                <button
                  className="sda-pagination__btn"
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                {[1, 2, 3, 4, 5].map((p) => (
                  <button
                    key={p}
                    className={`sda-pagination__btn${page === p ? ' sda-pagination__btn--active' : ''}`}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={page === p ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="sda-pagination__btn"
                  type="button"
                  onClick={() => setPage((p) => Math.min(5, p + 1))}
                  disabled={page === 5}
                  aria-label="Próxima página"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
                <span className="sda-pagination__info">Página {page} de 5</span>
              </div>
            </CatalogSection>

            {/* ── 14. UPLOAD ── */}
            <CatalogSection id="section-upload" title="14. Upload (sda-upload) — normal · dragging · error">
              <div className="sd-grid sd-grid--3">
                <div>
                  <p className="sd-label" style={{ marginBottom: 'var(--space-2)' }}>Normal</p>
                  <div className="sda-upload" role="button" tabIndex={0} aria-label="Área de upload">
                    <span className="sda-upload__icon"><Upload size={24} aria-hidden="true" /></span>
                    <span className="sda-upload__label">Arraste ou clique para enviar</span>
                    <span className="sda-upload__hint">PNG, JPG ou WebP · máx. 2MB</span>
                  </div>
                </div>
                <div>
                  <p className="sd-label" style={{ marginBottom: 'var(--space-2)' }}>Dragging</p>
                  <div className="sda-upload sda-upload--dragging" role="button" tabIndex={0} aria-label="Solte o arquivo">
                    <span className="sda-upload__icon"><Upload size={24} aria-hidden="true" /></span>
                    <span className="sda-upload__label">Solte o arquivo aqui</span>
                    <span className="sda-upload__hint">PNG, JPG ou WebP · máx. 2MB</span>
                  </div>
                </div>
                <div>
                  <p className="sd-label" style={{ marginBottom: 'var(--space-2)' }}>Erro</p>
                  <div className="sda-upload sda-upload--error" role="button" tabIndex={0} aria-label="Erro no upload">
                    <span className="sda-upload__icon sda-upload__icon--error"><AlertCircle size={24} aria-hidden="true" /></span>
                    <span className="sda-upload__label sda-upload__label--error">Arquivo inválido</span>
                    <span className="sda-upload__hint">Somente PNG, JPG ou WebP</span>
                  </div>
                </div>
              </div>
            </CatalogSection>

            {/* ── 15. PROGRESS ── */}
            <CatalogSection id="section-progress" title="15. Progresso (sda-progress) — trilho --gray-200 · preenchimento --grad-brand">
              <div className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {[25, 50, 75, 100].map((val) => (
                  <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div
                      className="sda-progress"
                      style={{ flex: '1' }}
                      role="progressbar"
                      aria-valuenow={val}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${val}%`}
                    >
                      <div className="sda-progress__fill" style={{ width: `${val}%` }} />
                    </div>
                    <span className="sd-small sd-muted" style={{ width: 'var(--space-8)', textAlign: 'right' }}>
                      {val}%
                    </span>
                  </div>
                ))}
              </div>
            </CatalogSection>

            {/* ── 16. STEPS ── */}
            <CatalogSection id="section-steps" title="16. Passos do Wizard (sda-steps) — done · current · pendente">
              <div className="sd-card">
                <div className="sda-steps">
                  {[
                    { label: 'Informações', state: '--done' },
                    { label: 'Programação', state: '--done' },
                    { label: 'Colaboradores', state: '--current' },
                    { label: 'Patrocinadores', state: '' },
                    { label: 'Publicar', state: '' },
                  ].map(({ label, state }, i) => (
                    <div
                      key={label}
                      className={`sda-steps__step${state ? ` sda-steps__step${state}` : ''}`}
                      aria-current={state === '--current' ? 'step' : undefined}
                    >
                      <div className="sda-steps__number" aria-hidden="true">
                        {state === '--done' ? <CheckCircle size={14} /> : i + 1}
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CatalogSection>

            {/* ── 17. ICON PICKER ── */}
            <CatalogSection id="section-iconpicker" title="17. Seletor de Ícones (sda-iconpicker) — grade 8 cols · busca · anel --focus-ring">
              <div className="sda-iconpicker">
                <label className="sd-field">
                  <span className="sr-only">Buscar ícone</span>
                  <input
                    className="sd-input"
                    type="search"
                    placeholder="Buscar ícone…"
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    aria-label="Buscar ícone"
                  />
                </label>
                <div className="sda-iconpicker__grid" role="listbox" aria-label="Selecionar ícone">
                  {filteredIcons.map((Icon, i) => (
                    <button
                      key={i}
                      className={`sda-iconpicker__item${selectedIcon === i ? ' sda-iconpicker__item--selected' : ''}`}
                      type="button"
                      onClick={() => setSelectedIcon(i)}
                      role="option"
                      aria-selected={selectedIcon === i}
                      aria-label={`Ícone ${i + 1}`}
                    >
                      <Icon size={20} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </CatalogSection>

            {/* ── 18. COLOR FIELD ── */}
            <CatalogSection id="section-colorfield" title="18. Campo de Cor (sda-colorfield) — amostra · valor · rótulo">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxWidth: '420px' }}>
                {[
                  { label: 'Background',  token: '--teal-950',   name: 'Fundo do evento' },
                  { label: 'Text',        token: '--white',       name: 'Texto principal' },
                  { label: 'Buttons',     token: '--orange-600',  name: 'Botão de ação' },
                  { label: 'Details',     token: '--teal-400',    name: 'Detalhes' },
                  { label: 'Highlights',  token: '--orange-400',  name: 'Destaques' },
                ].map(({ label, token, name }) => (
                  <div key={label} className="sda-colorfield">
                    <div
                      className="sda-colorfield__swatch"
                      style={{ backgroundColor: `var(${token})` }}
                      aria-hidden="true"
                    />
                    <span className="sda-colorfield__value">{name}</span>
                    <span className="sda-colorfield__label">{label}</span>
                  </div>
                ))}
              </div>
            </CatalogSection>

            {/* ── 19. SESSION CARDS ── */}
            <CatalogSection id="section-sessioncard" title="19. Card de Sessão (sda-sessioncard) — alça de arraste · reordenável via @dnd-kit">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {MOCK_SESSIONS.map(({ time, title, speaker }, i) => (
                  <div key={i} className="sda-sessioncard">
                    <div
                      className="sda-sessioncard__handle"
                      aria-label="Arrastar para reordenar"
                      title="Reordenar"
                    >
                      <GripVertical size={16} aria-hidden="true" />
                    </div>
                    <div className="sda-sessioncard__body">
                      <span className="sda-sessioncard__time">{time}</span>
                      <div className="sda-sessioncard__info">
                        <span className="sda-sessioncard__title">{title}</span>
                        <span className="sda-sessioncard__speaker">{speaker}</span>
                      </div>
                      <div className="sda-sessioncard__actions">
                        <button className="sd-btn sd-btn--ghost sd-btn--sm" type="button" aria-label="Editar sessão">
                          <Pencil size={14} aria-hidden="true" />
                        </button>
                        <button className="sd-btn sd-btn--ghost sd-btn--sm" type="button" aria-label="Excluir sessão">
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CatalogSection>

            {/* ── 20. PALETTE PREVIEW ── */}
            <CatalogSection id="section-palette" title="20. Prévia de Paleta (sda-palette-preview) — cores --ev-* escopadas localmente · nunca vazam para :root">
              <div
                className="sda-palette-preview"
                style={{
                  '--ev-bg':        'var(--teal-900)',
                  '--ev-text':      'var(--white)',
                  '--ev-button':    'var(--orange-600)',
                  '--ev-detail':    'var(--teal-400)',
                  '--ev-highlight': 'var(--orange-400)',
                }}
              >
                <div className="sda-palette-preview__title">Scoliosis Day 2026</div>
                <p className="sda-palette-preview__body">
                  Prévia de como as cores do evento aparecem no site público.
                  Cada cor é aplicada apenas dentro deste contêiner — as variáveis <code>--ev-*</code> não existem fora dele.
                </p>
                <button className="sda-palette-preview__btn" type="button">Inscrever-se</button>
                <div className="sda-palette-swatches">
                  {['--ev-bg', '--ev-text', '--ev-button', '--ev-detail', '--ev-highlight'].map((token) => (
                    <div
                      key={token}
                      className="sda-palette-swatch"
                      style={{ backgroundColor: `var(${token})` }}
                      title={token}
                      aria-label={token}
                    />
                  ))}
                </div>
              </div>
            </CatalogSection>

            {/* ── 21. KIT REFERENCE ── */}
            <CatalogSection id="section-kit" title="21. Kit Reference (sd-*) — sd-stat · sd-tabs · sd-accordion · sd-card--accent · sd-speaker">
              <div className="sd-grid sd-grid--4" style={{ marginBottom: 'var(--space-6)' }}>
                {[
                  { value: '847', label: 'Inscritos',      mod: '' },
                  { value: '12',  label: 'Palestrantes',   mod: '' },
                  { value: '6',   label: 'Patrocinadores', mod: '' },
                  { value: '3',   label: 'Pendentes',      mod: 'sd-stat--orange' },
                ].map(({ value, label, mod }) => (
                  <article key={label} className="sd-card">
                    <div className={`sd-stat ${mod}`.trim()}>
                      <span className="sd-stat__value">{value}</span>
                      <span className="sd-stat__label">{label}</span>
                    </div>
                  </article>
                ))}
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <div className="sd-tabs" role="tablist" aria-label="Status da equipe">
                  <button className="sd-tabs__tab sd-tabs__tab--active" role="tab" aria-selected="true">Pendentes</button>
                  <button className="sd-tabs__tab" role="tab" aria-selected="false">Ativos</button>
                  <button className="sd-tabs__tab" role="tab" aria-selected="false">Desativados</button>
                </div>
              </div>

              <div className="sd-accordion">
                <details>
                  <summary>Como publicar um evento?</summary>
                  <div className="sd-accordion__body">
                    <p>Preencha todas as etapas do wizard e clique em Publicar. O site público é atualizado em tempo real.</p>
                  </div>
                </details>
                <details open>
                  <summary>Posso editar após publicar?</summary>
                  <div className="sd-accordion__body">
                    <p>Sim. O painel permite editar todos os campos a qualquer momento.</p>
                  </div>
                </details>
              </div>
            </CatalogSection>

          </div>
        </main>
      </div>

      {/* ── MODAL (portado fora do shell para z-index correto) ── */}
      {modalOpen && (
        <div
          className="sda-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-demo-title"
          onKeyDown={(e) => e.key === 'Escape' && setModalOpen(false)}
        >
          <div
            className="sda-modal__overlay"
            onClick={() => setModalOpen(false)}
            aria-hidden="true"
          />
          <div className="sda-modal__panel">
            <div className="sda-modal__head">
              <h2 id="modal-demo-title">Confirmar exclusão</h2>
              <button
                className="sd-btn sd-btn--ghost sd-btn--sm"
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Fechar modal"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="sda-modal__body">
              <p>
                Excluir o colaborador <strong>Dra. Ana Lima</strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="sd-card" style={{ marginTop: 'var(--space-4)' }}>
                <div className="sda-table__person">
                  <Avatar person={MOCK_COLLABORATORS[0]} />
                  <div>
                    <div style={{ fontWeight: 'var(--fw-semibold)', color: 'var(--text-heading)' }}>
                      Dra. Ana Lima
                    </div>
                    <TypeTag type="speaker" />
                  </div>
                </div>
              </div>
            </div>
            <div className="sda-modal__foot">
              <button
                className="sd-btn sd-btn--outline"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                {t.common.cancel}
              </button>
              <button
                className="sd-btn sd-btn--primary"
                type="button"
                onClick={() => setModalOpen(false)}
              >
                {t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
