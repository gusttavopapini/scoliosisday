// src/app/AppShell.jsx
// Shell reutilizável: sidebar fixa + topbar sticky + área de conteúdo.
// Usado por todas as páginas do painel. Passa activeNav para destacar o item correto.
// Integrado com AuthContext para avatar, logout e filtragem de nav por permissão.

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Building2, Star,
  FileText, Quote, Image, Settings, Menu, X, LogOut,
} from 'lucide-react';
import t from '../i18n/pt-BR.js';
import { useAuth } from '../hooks/useAuth.js';
import { usePermissions } from '../hooks/usePermissions.js';
import { AVATAR_COLORS } from '../utils/constants.js';
import { getInitials, avatarColorIndex } from '../utils/initials.js';
// Mesmo arquivo do site público usado no PublicNavbar.jsx (variante
// branca) — troca pedida explicitamente, mesmo o Footer usando a colorida
// (logo-color.svg): confirmado antes de trocar, decisão do usuário.
import logoWhite from '../assets/logo-white.svg';

const NAV_ITEMS = [
  { key: 'dashboard',     icon: LayoutDashboard, label: t.nav.dashboard,      href: '/painel' },
  { key: 'events',        icon: Calendar,        label: t.nav.events,          href: '/painel/eventos' },
  { key: 'collaborators', icon: Users,           label: t.nav.collaborators,   href: '/painel/colaboradores' },
  { key: 'sponsors',      icon: Building2,       label: t.nav.sponsors,        href: '/painel/patrocinadores' },
  { key: 'schedules',     icon: FileText,        label: t.nav.schedules,       href: '/painel/programacoes' },
  { key: 'testimonials',  icon: Quote,           label: t.nav.testimonials,    href: '/painel/depoimentos' },
  { key: 'banners',       icon: Image,           label: t.nav.banners,         href: '/painel/banners' },
  { key: 'settings',      icon: Settings,        label: t.nav.settings,        href: '/painel/configuracoes' },
  { key: 'staff',         icon: Star,            label: t.nav.staff,           href: '/painel/staff', module: 'staff' },
];

/**
 * @param {{ activeNav: string, breadcrumb?: string, children: React.ReactNode }} props
 */
export default function AppShell({ activeNav, breadcrumb, children }) {
  // REFORÇO de noindex no painel. Quem de fato barra é o robots.txt
  // (Disallow: /painel), porque o crawler nem chega a baixar a página —
  // e num SPA o HTML servido é o mesmo do site público, então não há
  // como ter a meta correta já no arquivo.
  //
  // Isto cobre o caso em que o Googlebot chega a uma rota do painel por
  // um link e RENDERIZA o JS (ele faz, em segunda passada): a meta é
  // trocada antes de ele avaliar a página. Restaura no desmonte para o
  // site público não herdar o noindex ao sair do painel.
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]');
    if (!meta) return undefined;
    const previous = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex, nofollow');
    return () => meta.setAttribute('content', previous);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const { can } = usePermissions();

  // Dados do usuário logado
  const userName = userData?.displayName || userData?.email || '';
  const userInitials = getInitials(userName);
  const avatarColor = AVATAR_COLORS[avatarColorIndex(userData?.id || '', AVATAR_COLORS.length)];

  // Filtrar nav items por permissão
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.module) return true;
    return can(item.module, 'view');
  });

  async function handleLogout(e) {
    e.preventDefault();
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <div className="sda-shell">

        {/* ── SIDEBAR ── */}
        <aside
          className={`sda-sidebar${sidebarOpen ? ' sda-sidebar--open' : ''}`}
          aria-label="Navegação principal"
        >
          <div className="sda-sidebar__logo">
            <Link to="/painel" aria-label="Scoliosis Day — Painel Admin">
              <img src={logoWhite} alt="Scoliosis Day" className="sda-sidebar__logo-img" />
            </Link>
          </div>

          <nav>
            <span className="sda-sidebar__section-label">Menu</span>
            {visibleNavItems.map(({ key, icon: Icon, label, href }) => (
              <Link
                key={key}
                to={href}
                className={`sda-navitem${activeNav === key ? ' sda-navitem--active' : ''}`}
                aria-current={activeNav === key ? 'page' : undefined}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sda-navitem__icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                {label}
              </Link>
            ))}
          </nav>

          <div className="sda-sidebar__footer">
            <button
              className="sda-navitem"
              type="button"
              onClick={handleLogout}
            >
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
        <main className="sda-main" id="main-content">
          <header className="sda-topbar">
            <div className="sda-topbar__left">
              <button
                className="sda-topbar__menu-btn"
                type="button"
                aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={sidebarOpen}
                aria-controls="main-nav"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen
                  ? <X size={22} aria-hidden="true" />
                  : <Menu size={22} aria-hidden="true" />}
              </button>
              {breadcrumb && (
                <div className="sda-topbar__breadcrumb" aria-label="Navegação estrutural">
                  Scoliosis Day&nbsp;/&nbsp;<span>{breadcrumb}</span>
                </div>
              )}
            </div>
            <div className="sda-topbar__right">
              {/* Avatar do usuário logado */}
              <div
                className="sda-avatar"
                style={{ backgroundColor: avatarColor }}
                title={userName}
                aria-label={userName || 'Usuário logado'}
              >
                {userInitials}
              </div>
            </div>
          </header>

          {/* Conteúdo da página */}
          {children}
        </main>
      </div>
    </>
  );
}
