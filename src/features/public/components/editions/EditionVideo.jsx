// src/features/public/components/editions/EditionVideo.jsx
// Seção de vídeo opcional da página da edição (event.videoBlock): título,
// separador decorativo e player. Editada no passo próprio de vídeo do
// wizard — Passo 5 na edição atual, Passo 3 na passada (EventStepVideo.jsx).
//
// Posição na página (ver EditionsPage.jsx):
//   • edição atual   → imediatamente ACIMA do bloco de Localização (mapa)
//   • edição passada → ÚLTIMA seção (não há mapa nessas)
//
// Sem o bloco (a maioria das edições, e todas as anteriores a este
// recurso), não renderiza nada: nem seção, nem espaçamento. Bloco pela
// metade é tratado como ausente — normalizeVideoBlock devolve null (o
// schema já impede que meio bloco seja salvo; isto cobre dado antigo ou
// escrito manualmente pelo console).
//
// Dois players, conforme videoBlock.videoType (ver EventStepVideo.jsx):
//
//   · 'url'    → <iframe> de embed, pelo mesmo getVideoEmbedInfo que os
//                depoimentos em vídeo usam. URL que não for de plataforma
//                reconhecida não renderiza a seção (dado antigo/manual).
//   · 'upload' → <video controls> nativo servido do Storage, com
//                preload="metadata": no carregamento da página só descem
//                cabeçalho e duração, não o arquivo inteiro — que pode ter
//                até 100MB e é banda paga do Blaze a cada visita.
//
// Os dois compartilham .sdp-video-embed, o enquadramento 16:9 responsivo.
//
// Nada do controle de autoplay dos depoimentos (useEmbedPlaybackState) é
// necessário: aquilo existe para pausar o carrossel enquanto um vídeo toca,
// e esta seção tem um único vídeo, sem carrossel.

import { useStoredTranslation } from '../../../../hooks/useStoredTranslation.js';
import { normalizeVideoBlock, VIDEO_TYPES } from '../../../../utils/contentBlocks.js';
import { getVideoEmbedInfo, isPlatformVideoUrl } from '../../../../utils/videoEmbed.js';

/** @param {{ event: object }} props */
export default function EditionVideo({ event }) {
  const block = normalizeVideoBlock(event?.videoBlock);
  const translated = useStoredTranslation(block, ['title', 'subtitle']);

  if (!block) return null;

  const isUpload = block.videoType === VIDEO_TYPES.UPLOAD;
  // No modo link, uma URL que não é de plataforma reconhecida não vira
  // player nenhum. No modo upload a URL é do Storage e não passa (nem
  // deve passar) por esse teste.
  if (!isUpload && !isPlatformVideoUrl(block.videoUrl)) return null;

  const embed = isUpload ? null : getVideoEmbedInfo(block.videoUrl);

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
          {translated.subtitle && <p className="sd-lead">{translated.subtitle}</p>}
        </header>

        <div className="sdp-edition-video">
          <div className="sdp-video-embed">
            {isUpload ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption -- vídeo enviado pelo admin, sem legendas geradas.
              <video src={block.videoUrl} controls preload="metadata" title={translated.title} />
            ) : (
              <iframe
                src={embed.embedUrl}
                title={translated.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
