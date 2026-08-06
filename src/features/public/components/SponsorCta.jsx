// src/features/public/components/SponsorCta.jsx
// Botão de captação de patrocínio — reaproveitado por /sobre, /edicoes e
// /patrocinadores, logo após a seção de patrocinadores de cada página.
// Sempre visível, mesmo quando a edição ainda não tem nenhum patrocinador
// cadastrado. Email próprio (t.site.sponsorCtaEmail), não o de contato do
// rodapé — os dois podem divergir.

import { useLanguage } from '../../../hooks/useLanguage.js';

export default function SponsorCta() {
  const { t } = useLanguage();

  return (
    <div className="sdp-sponsor-cta">
      <a className="sd-btn sd-btn--primary sd-btn--lg" href={`mailto:${t.site.sponsorCtaEmail}`}>
        {t.site.sponsorCta}
      </a>
    </div>
  );
}
