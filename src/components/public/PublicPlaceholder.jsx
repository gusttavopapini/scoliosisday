// src/components/public/PublicPlaceholder.jsx
// Miolo provisório das páginas públicas.
//
// A estrutura (rota + layout + navbar) já está de pé, mas o conteúdo ainda
// não consome o Firestore. Cada página rende este bloco até ganhar o seu.
// Quando todas tiverem layout próprio, este arquivo e o .sdp-placeholder saem.

import { useLanguage } from '../../hooks/useLanguage.js';

/** @param {{ titleKey: keyof typeof import('../../i18n/pt-BR.js').default.site }} props */
export default function PublicPlaceholder({ titleKey }) {
  const { t } = useLanguage();

  return (
    <section className="sdp-placeholder">
      <h1 className="sd-display sd-display--md">{t.site[titleKey]}</h1>
      <p className="sd-lead sd-muted">{t.site.comingSoonBody}</p>
    </section>
  );
}
