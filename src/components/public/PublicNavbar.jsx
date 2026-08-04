// src/components/public/PublicNavbar.jsx
// Navbar fixo do site público: wordmark, links, switch PT/EN, CTA e
// hambúrguer no mobile.
//
// A base visual é o .sd-navbar do design system (sticky, vidro fosco, link
// ativo sublinhado em laranja). public.css só acrescenta o que falta.

import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage.js';
import { useCurrentPublicEvent } from '../../hooks/useEvents.js';

/** Rótulo de cada link vem do dicionário: a chave é resolvida em render.
 * Esta lista alimenta tanto a barra do desktop quanto a gaveta mobile, que
 * renderizam o mesmo array — tirar um item daqui o remove dos dois.
 * Academy não entra: a rota /academy segue existindo (redireciona para a
 * home), mas sem link visível no menu. */
const NAV_LINKS = [
  { key: 'home',        to: '/',                 end: true },
  { key: 'editions',    to: '/edicoes' },
  { key: 'about',       to: '/sobre' },
  { key: 'hallOfStars', to: '/hall-de-estrelas' },
  { key: 'sponsors',    to: '/patrocinadores' },
  { key: 'testimonials', to: '/depoimentos' },
];

const LANG_LABELS = { 'pt-BR': 'PT', en: 'EN' };

/** Destino do CTA quando não há evento atual publicado. */
const CTA_FALLBACK_HREF = '/edicoes';

export default function PublicNavbar() {
  const { t, lang, languages, setLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // O CTA espelha o evento em destaque: rótulo e link saem do próprio evento.
  // Enquanto a busca não responde — ou quando não há destaque publicado — cai
  // no rótulo genérico apontando para as edições, então o botão nunca some
  // nem pisca vazio.
  const { data: currentEvent } = useCurrentPublicEvent();
  const ctaLabel = currentEvent?.cta?.trim() || t.site.cta;
  const ctaLink = currentEvent?.ctaLink?.trim() || '';

  // Navegar fecha a gaveta: sem isso ela fica aberta por cima da página nova.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape fecha, como em qualquer sobreposição.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const langSwitch = (
    <div className="sdp-lang" role="group" aria-label={t.site.languageLabel}>
      {languages.map((code) => (
        <button
          key={code}
          type="button"
          className={`sdp-lang__btn${lang === code ? ' sdp-lang__btn--active' : ''}`}
          onClick={() => setLanguage(code)}
          aria-pressed={lang === code}
        >
          {LANG_LABELS[code]}
        </button>
      ))}
    </div>
  );

  // O ctaLink do evento é uma URL externa (o schema valida .url()), então vira
  // <a> de verdade; o fallback é rota interna e continua no <Link>.
  function renderCta(extraClass = '') {
    const className = `sd-btn sd-btn--primary sd-btn--sm${extraClass}`;

    return ctaLink ? (
      <a className={className} href={ctaLink} target="_blank" rel="noopener noreferrer">
        {ctaLabel}
      </a>
    ) : (
      <Link className={className} to={CTA_FALLBACK_HREF}>
        {ctaLabel}
      </Link>
    );
  }

  const links = NAV_LINKS.map(({ key, to, end }) => (
    <NavLink
      key={key}
      to={to}
      end={end}
      className={({ isActive }) =>
        `sd-navbar__link${isActive ? ' sd-navbar__link--active' : ''}`
      }
    >
      {t.site[key]}
    </NavLink>
  ));

  return (
    <header className="sd-navbar sdp-navbar">
      <div className="sdp-navbar__inner">
        <Link to="/" className="sdp-wordmark">
          Scoliosis <em>Day</em>
        </Link>

        <nav className="sd-navbar__nav" aria-label={t.site.brand}>
          {links}
        </nav>

        <div className="sdp-navbar__actions">
          {langSwitch}

          {renderCta(' sdp-navbar__cta')}

          <button
            type="button"
            className="sdp-navbar__burger"
            aria-label={menuOpen ? t.site.closeMenu : t.site.openMenu}
            aria-expanded={menuOpen}
            aria-controls="sdp-drawer"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen
              ? <X size={20} aria-hidden="true" />
              : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Gaveta mobile — irmã do __inner, desce colada ao navbar. */}
      <div
        id="sdp-drawer"
        className={`sdp-navbar__drawer${menuOpen ? ' sdp-navbar__drawer--open' : ''}`}
      >
        <nav className="sdp-navbar__drawer-nav" aria-label={t.site.brand}>
          {links}
        </nav>

        <div className="sdp-navbar__drawer-foot">
          {langSwitch}
          {renderCta()}
        </div>
      </div>
    </header>
  );
}
