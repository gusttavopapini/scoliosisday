// src/features/public/components/editions/EditionTextBlock.jsx
// Bloco de texto corrido opcional da página da edição: título + um
// parágrafo (event.textBlock). Vale para edição atual e passada — em ambos
// os fluxos do wizard os campos vivem dentro de um passo que já existia
// (Passo 3 na atual, Passo 2 na passada), nunca num passo próprio; ver
// TextBlockFields.jsx. Na página, sai logo abaixo da apresentação na
// edição atual e ao fim do arquivo na passada — ver EditionsPage.jsx.
//
// Sem o bloco (a maioria das edições, e todas as anteriores a este
// recurso), não renderiza nada: nem seção, nem espaçamento. Meio bloco é
// tratado como ausente — normalizeTextBlock devolve null (o schema já
// impede que meio bloco seja salvo; isto cobre dado antigo/manual).

import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { normalizeTextBlock } from '../../../../utils/contentBlocks.js';

/** @param {{ event: object }} props */
export default function EditionTextBlock({ event }) {
  const block = normalizeTextBlock(event?.textBlock);
  const translated = useStoredTranslation(block, ['title', 'body']);

  if (!block) return null;

  return (
    <section className="sd-section">
      <div className="sd-container">
        <header className="sd-section-header sd-section-header--center sdp-section-header">
          <h2 className="sd-display sd-display--md sd-display--upright sd-display--teal sdp-heading--regular">
            {translated.title}
          </h2>
          <div className="sd-rule" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </header>

        <p className="sd-lead sdp-text-block__body">{translated.body}</p>
      </div>
    </section>
  );
}
