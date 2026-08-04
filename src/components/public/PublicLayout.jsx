// src/components/public/PublicLayout.jsx
// Casca do site público: provider de idioma + navbar fixo + área de conteúdo.
//
// O LanguageProvider entra aqui, e não no App, porque só o site público troca
// de idioma — o painel importa pt-BR.js direto e não deve carregar o en.js.

import { Outlet } from 'react-router-dom';
import { LanguageProvider } from '../../contexts/LanguageContext.jsx';
import PublicNavbar from './PublicNavbar.jsx';
import PublicFooter from './PublicFooter.jsx';

export default function PublicLayout() {
  return (
    <LanguageProvider>
      <div className="sdp-page">
        <PublicNavbar />
        <main className="sdp-main" id="site-content">
          <Outlet />
        </main>
        <PublicFooter />
      </div>
    </LanguageProvider>
  );
}
