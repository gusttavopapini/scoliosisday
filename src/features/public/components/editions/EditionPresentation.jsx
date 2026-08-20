// src/features/public/components/editions/EditionPresentation.jsx
// Seção de cards de /edicoes: os 3 cards gravados no próprio evento
// (event.presentation, Passo 3 do wizard) e, agora, também o TÍTULO e o
// SUBTÍTULO da seção, editáveis por edição no mesmo passo.
//
// Os dois textos são OPCIONAIS e caem no institucional padrão quando
// vazios — fallback, não substituição. O motivo é concreto: nenhuma
// edição já cadastrada tem esses campos, e sem fallback a seção
// apareceria sem título em produção no instante do deploy. Fallback
// também é o que faz "opcional" ser verdade: preencher vira escolha, não
// obrigação retroativa.
//
// O texto padrão é o mesmo par de chaves que HomeAbout.jsx usa na Home
// (aboutTitleMain/aboutSubtitle). A partir daqui os dois só andam juntos
// enquanto a edição não sobrescrever — que é o desejado: a Home é
// institucional, a seção da edição fala daquela edição.
//
// A marca "Scoliosis Day" ganha o tratamento tipográfico em qualquer um
// dos dois caminhos: no padrão ela é <BrandWordmark /> concatenado (o
// dicionário guarda só o "O que é o"); no texto do admin, splitOnBrand
// acha a menção onde ela estiver na frase e troca só esse trecho.

import { useLanguage } from '../../../../hooks/useLanguage.js';
import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { hasValidPresentation } from '../../../../utils/presentationIcons.js';
import { splitOnBrand } from '../../../../utils/splitLastWord.js';
import BrandWordmark from '../../../../components/BrandWordmark.jsx';
import PresentationCard from './PresentationCard.jsx';

/** Frase do admin com "Scoliosis Day" (onde estiver) em <BrandWordmark />. */
function withBrand(text) {
  const parts = splitOnBrand(text);
  if (!parts) return text;
  return (
    <>
      {parts.before}
      <BrandWordmark />
      {parts.after}
    </>
  );
}

/** @param {{ event: object }} props */
export default function EditionPresentation({ event }) {
  const { t } = useLanguage();
  const translated = useStoredTranslation(event, ['presentationTitle', 'presentationSubtitle']);
  const cards = event.presentation ?? [];

  if (!hasValidPresentation(cards)) return null;

  const customTitle = translated?.presentationTitle?.trim();
  const customSubtitle = translated?.presentationSubtitle?.trim();

  return (
    <section className="sd-section">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-heading--regular">
            {customTitle ? withBrand(customTitle) : <>{t.site.aboutTitleMain} <BrandWordmark /></>}
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
          <p className="sd-lead">{customSubtitle || t.site.aboutSubtitle}</p>
        </header>

        <div className="sd-grid sd-grid--3 sdp-about__grid">
          {cards.map((card, index) => (
            <PresentationCard key={index} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
