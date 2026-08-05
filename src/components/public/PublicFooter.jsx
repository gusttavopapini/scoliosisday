// src/components/public/PublicFooter.jsx
// Rodapé do site público.
//
// Usa o .sd-footer do design system. A coluna de navegação repete os destinos
// do navbar de propósito: é o padrão de rodapé do kit e dá um segundo caminho
// de navegação a quem chegou ao fim da página.

import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage.js';
import logoColor from '../../assets/logo-color.svg';

const FOOTER_LINKS = [
  { key: 'home', to: '/' },
  { key: 'editions', to: '/edicoes' },
  { key: 'about', to: '/sobre' },
  { key: 'hallOfStars', to: '/hall-de-estrelas' },
  { key: 'sponsors', to: '/patrocinadores' },
  { key: 'testimonials', to: '/depoimentos' },
];

const INSTAGRAM_URL = 'https://www.instagram.com/scoliosisday';

export default function PublicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="sd-footer">
      <div className="sd-container">
        <div className="sd-footer__top">
          <div className="sd-footer__brand">
            <Link to="/" className="sdp-wordmark">
              <img src={logoColor} alt={t.site.brand} className="sdp-wordmark__logo" />
            </Link>
            <p>{t.site.footerTagline}</p>
            <p>{t.site.footerAbteText}</p>
          </div>

          <div className="sd-footer__cols">
            <nav className="sd-footer__col" aria-label={t.site.footerNavLabel}>
              <b>{t.site.footerSiteMap}</b>
              {FOOTER_LINKS.map(({ key, to }) => (
                <Link key={key} to={to}>{t.site[key]}</Link>
              ))}
            </nav>

            <div className="sd-footer__col">
              <b>{t.site.footerContactTitle}</b>
              <a href={`mailto:${t.site.contactEmail}`}>{t.site.contactEmail}</a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                {t.site.contactInstagram}
              </a>
            </div>
          </div>
        </div>

        <div className="sd-footer__bottom">
          {t.site.footerCopyright.replace('{year}', String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}
