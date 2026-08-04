// src/features/auth/NotFoundPage.jsx
// Página 404 — rota inexistente.

import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import t from '../../i18n/pt-BR.js';

export default function NotFoundPage() {
  return (
    <div className="sda-empty" style={{ minHeight: '60vh' }}>
      <span className="sda-empty__icon" aria-hidden="true">
        <FileQuestion size={48} />
      </span>
      <h1 className="sda-empty__title">{t.notFound.title}</h1>
      <p className="sda-empty__body">{t.notFound.body}</p>
      <Link to="/painel" className="sd-btn sd-btn--secondary">
        {t.notFound.backToDashboard}
      </Link>
    </div>
  );
}
