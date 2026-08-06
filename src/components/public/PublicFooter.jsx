// src/components/public/PublicFooter.jsx
// Rodapé do site público.
//
// Usa o .sd-footer do design system. A coluna de navegação repete os destinos
// do navbar de propósito: é o padrão de rodapé do kit e dá um segundo caminho
// de navegação a quem chegou ao fim da página.

import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage.js';
import logoColor from '../../assets/logo-color.svg';

// lucide-react (a biblioteca de ícones já usada no projeto) não tem ícones
// de marca/rede social — confirmado antes de importar qualquer coisa nova.
// SVG inline no mesmo estilo dos ícones lucide (stroke 2px, cantos
// arredondados, currentColor), sem adicionar dependência nova ao projeto.
function InstagramIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

// Mesma ordem do navbar (ver NAV_LINKS em PublicNavbar.jsx) — Depoimentos
// também não entra aqui pelo mesmo motivo: /depoimentos foi removida, sem
// link próprio no menu (nem no header, nem no rodapé).
const FOOTER_LINKS = [
  { key: 'home', to: '/' },
  { key: 'about', to: '/sobre' },
  { key: 'editions', to: '/edicoes' },
  { key: 'hallOfStars', to: '/hall-de-estrelas' },
  { key: 'sponsors', to: '/patrocinadores' },
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
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.site.contactInstagram}
                className="sdp-footer__instagram"
              >
                <InstagramIcon />
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
