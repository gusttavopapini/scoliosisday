// src/features/auth/ForbiddenPage.jsx
// Página 403 — acesso restrito.
// Exibida quando um usuário tenta acessar uma rota sem permissão.

import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import t from '../../i18n/pt-BR.js';

export default function ForbiddenPage() {
  return (
    <div className="sda-empty" style={{ minHeight: '60vh' }}>
      <span className="sda-empty__icon" aria-hidden="true">
        <ShieldOff size={48} />
      </span>
      <h1 className="sda-empty__title">{t.forbidden.title}</h1>
      <p className="sda-empty__body">{t.forbidden.body}</p>
      <Link to="/painel" className="sd-btn sd-btn--secondary">
        {t.forbidden.backToDashboard}
      </Link>
    </div>
  );
}
