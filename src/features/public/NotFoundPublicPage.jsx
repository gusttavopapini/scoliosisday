// src/features/public/NotFoundPublicPage.jsx
// 404 do site público. Vive dentro do PublicLayout, então já vem com navbar,
// rodapé e idioma — o visitante continua no site em vez de cair numa tela
// solta com texto de painel.
//
// O 404 do painel (features/auth/NotFoundPage.jsx) segue intacto e atende
// /painel/*, atrás do ProtectedRoute.

import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function NotFoundPublicPage() {
  const { t } = useLanguage();

  return (
    <section className="sdp-notfound">
      <p className="sdp-notfound__code" aria-hidden="true">404</p>
      <h1 className="sd-display sd-display--md">{t.site.notFoundTitle}</h1>
      <p className="sd-lead sd-muted">{t.site.notFoundBody}</p>
      <Link to="/" className="sd-btn sd-btn--primary">
        {t.site.notFoundBack}
      </Link>
    </section>
  );
}
