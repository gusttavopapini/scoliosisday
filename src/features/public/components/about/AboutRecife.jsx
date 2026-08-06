// src/features/public/components/about/AboutRecife.jsx
// Seção 3 de /sobre: duas colunas em --surface-brand — texto à esquerda,
// foto da cidade à direita. Empilha no mobile.

import { useLanguage } from '../../../../hooks/useLanguage.js';
import AccentWord from '../../../../components/public/AccentWord.jsx';

const RECIFE_IMAGE_URL =
  'https://www2.recife.pe.gov.br/sites/default/files/styles/imagem_slide_home/public/sol.jpg?itok=idpCkSTN';

export default function AboutRecife() {
  const { t } = useLanguage();

  return (
    <section className="sdp-about-recife">
      <div className="sd-container sdp-about-recife__grid">
        <div className="sdp-about-recife__text">
          <h2 className="sd-display sd-display--md sd-display--on-dark sdp-heading--regular">
            <AccentWord>{t.site.aboutPageRecifeTitleAccent}</AccentWord>{t.site.aboutPageRecifeTitleRest}
          </h2>
          <p className="sd-lead sd-on-dark">{t.site.aboutPageRecifeText}</p>
        </div>
        <div className="sdp-about-recife__media">
          <img src={RECIFE_IMAGE_URL} alt={t.site.aboutPageRecifeImageAlt} />
        </div>
      </div>
    </section>
  );
}
