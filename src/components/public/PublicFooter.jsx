// src/components/public/PublicFooter.jsx
// Rodapé do site público.
//
// Usa o .sd-footer do design system. A coluna de navegação repete os destinos
// do navbar de propósito: é o padrão de rodapé do kit e dá um segundo caminho
// de navegação a quem chegou ao fim da página.

import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage.js';
import { useSocialLinks } from '../../hooks/useSettings.js';
import { getSocialPlatform } from '../../utils/socialPlatforms.js';
import logoColor from '../../assets/logo-color.svg';

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

export default function PublicFooter() {
  const { t } = useLanguage();
  const { data: socialLinks = [] } = useSocialLinks();

  // Só ativos, na ordem cadastrada no painel (/painel/configuracoes) —
  // mesmo padrão de "seções sem dado se ocultam" usado no resto do site:
  // sem nenhuma rede ativa, a coluna inteira some (sem espaço vazio).
  const activeSocialLinks = socialLinks
    .filter((link) => link.active && link.url?.trim())
    .sort((a, b) => a.order - b.order);

  return (
    <footer className="sd-footer">
      <div className="sd-container">
        <div className="sd-footer__top">
          <div className="sd-footer__brand">
            <Link to="/" className="sdp-wordmark">
              <img width="699" height="264" src={logoColor} alt={t.site.brand} className="sdp-wordmark__logo" />
            </Link>
            <p>{t.site.footerTagline}</p>
          </div>

          <div className="sd-footer__cols">
            <nav className="sd-footer__col" aria-label={t.site.footerNavLabel}>
              <b>{t.site.footerSiteMap}</b>
              {FOOTER_LINKS.map(({ key, to }) => (
                <Link key={key} to={to}>{t.site[key]}</Link>
              ))}
            </nav>

            {activeSocialLinks.length > 0 && (
              <div className="sd-footer__col">
                <b>{t.site.footerFollowTitle}</b>
                <div className="sdp-footer__social">
                  {activeSocialLinks.map((link) => {
                    const platform = getSocialPlatform(link.platform);
                    if (!platform) return null;
                    const { Icon } = platform;

                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={platform.label}
                        className="sdp-footer__social-link"
                      >
                        <Icon size={25} aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sd-footer__bottom">
          {t.site.footerCopyright.replace('{year}', String(new Date().getFullYear()))}
        </div>
      </div>
    </footer>
  );
}
