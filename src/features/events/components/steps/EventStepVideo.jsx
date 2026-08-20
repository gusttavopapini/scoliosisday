// src/features/events/components/steps/EventStepVideo.jsx
// Passo de VÍDEO — a seção opcional de vídeo da página da edição
// (videoBlock: título + subtítulo opcional + vídeo).
//
// Existe nos DOIS fluxos do wizard, sempre como último passo:
//
//   • edição atual   (isCurrent: true)  → Passo 5
//   • edição passada (isCurrent: false) → Passo 3
//
// Por isso o nome do arquivo é semântico e não numerado: o número muda
// entre os fluxos, o papel não. (EventStep5.jsx é outra coisa — o
// "Conteúdo de arquivo", que só existe no fluxo reduzido.)
//
// Duas origens de vídeo, escolhidas pelo admin em videoType:
//
//   · 'url'    → link do YouTube/Vimeo. Nada é hospedado aqui; o player
//                público é um <iframe> de embed. É o padrão, e o mais
//                barato: a banda é da plataforma.
//   · 'upload' → arquivo MP4/WEBM no Firebase Storage, pelo mesmo
//                VideoUploader/UPLOAD_PRESETS do resto do projeto. O
//                player público é um <video> nativo. Custa banda do
//                Blaze a cada exibição, daí o teto de 100MB e o aviso na
//                própria UI.
//
// Trocar de origem limpa o valor anterior (handleTypeChange) para o
// documento nunca guardar uma URL de plataforma junto de um caminho do
// Storage — e, quando o que sai é um arquivo já enviado, o arquivo é
// apagado do Storage no mesmo movimento, sem deixar órfão pago.
//
// O bloco é all-or-nothing entre título e vídeo; o subtítulo é opcional
// mesmo com o bloco preenchido. A regra vive no eventSchema (superRefine)
// — aqui só se exibem as mensagens que ela produz.

import { Link2, UploadCloud } from 'lucide-react';
import { getVideoEmbedInfo, isPlatformVideoUrl } from '../../../../utils/videoEmbed.js';
import { VIDEO_TYPES } from '../../../../utils/contentBlocks.js';
import { UPLOAD_PRESETS, deleteFile } from '../../../../services/storageService.js';
import VideoUploader from '../../../../components/form/VideoUploader.jsx';

const SOURCE_TABS = [
  { value: VIDEO_TYPES.URL, label: 'Link do YouTube/Vimeo', icon: Link2 },
  { value: VIDEO_TYPES.UPLOAD, label: 'Enviar arquivo de vídeo', icon: UploadCloud },
];

/**
 * @param {{
 *   register: Function, errors: object, watch: Function, setValue: Function,
 *   eventId: string, onUploadingChange?: (isUploading: boolean) => void,
 * }} props
 */
export default function EventStepVideo({
  register,
  errors,
  watch,
  setValue,
  eventId,
  onUploadingChange,
}) {
  const videoErrors = errors.videoBlock ?? {};
  const videoUrl = watch('videoBlock.videoUrl') ?? '';
  // Bloco salvo antes de videoType existir só podia ser link — mesmo
  // fallback de normalizeVideoBlock, para o formulário abrir na aba certa.
  const videoType = watch('videoBlock.videoType') ?? VIDEO_TYPES.URL;
  const isUpload = videoType === VIDEO_TYPES.UPLOAD;

  const { maxSizeMB, allowedTypes } = UPLOAD_PRESETS.eventVideo;

  // Prévia só com URL já reconhecida — enquanto o admin digita, um link
  // pela metade não vira iframe (e não dispara requisição a cada tecla).
  const trimmedUrl = videoUrl.trim();
  const embed = !isUpload && isPlatformVideoUrl(trimmedUrl) ? getVideoEmbedInfo(trimmedUrl) : null;

  async function handleTypeChange(nextType) {
    if (nextType === videoType) return;

    // O que estava preenchido na origem anterior não serve para a nova:
    // uma URL do YouTube não é arquivo, e a URL de download do Storage não
    // é link de plataforma. Deixar o valor antigo faria a validação
    // reprovar um campo que o admin nem vê mais.
    const previousUrl = trimmedUrl;
    const previousWasUpload = isUpload;

    setValue('videoBlock.videoType', nextType, { shouldDirty: true });
    setValue('videoBlock.videoUrl', '', { shouldDirty: true });
    setValue('videoBlock.videoStoragePath', null, { shouldDirty: true });

    // Saindo do upload com arquivo já enviado: apaga do Storage agora. Se
    // ficasse para o salvamento, um admin que trocasse de aba e fechasse o
    // wizard deixaria um arquivo de até 100MB pago e sem referência.
    if (previousWasUpload && previousUrl) await deleteFile(previousUrl);
  }

  function handleUploadChange({ url, path }) {
    setValue('videoBlock.videoUrl', url, { shouldDirty: true, shouldValidate: true });
    setValue('videoBlock.videoStoragePath', path, { shouldDirty: true });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div>
        <h2 className="sd-subtitle">Vídeo</h2>
        <p className="sd-muted">
          Uma seção de vídeo na página desta edição. Deixe em branco para não exibir esta seção
          na página da edição.
        </p>
      </div>

      <div className="sd-card" style={{ padding: 'var(--space-6)' }}>
        <label className="sd-field">
          <span className="sd-label">Título</span>
          <input
            {...register('videoBlock.title')}
            className="sd-input"
            type="text"
            placeholder="Ex: Reviva os melhores momentos"
            maxLength={120}
          />
          {videoErrors.title && <span className="sd-error">{videoErrors.title.message}</span>}
          <span className="sd-note">Até 120 caracteres</span>
        </label>

        <label className="sd-field">
          <span className="sd-label">
            Subtítulo <span className="sd-muted">(opcional)</span>
          </span>
          <input
            {...register('videoBlock.subtitle')}
            className="sd-input"
            type="text"
            placeholder="Linha de apoio exibida abaixo do título."
            maxLength={200}
          />
          {videoErrors.subtitle && <span className="sd-error">{videoErrors.subtitle.message}</span>}
          <span className="sd-note">
            Pode ficar em branco mesmo com o resto do bloco preenchido.
          </span>
        </label>

        {/* ── Origem do vídeo ── */}
        <div className="sd-field">
          <span className="sd-label">Origem do vídeo</span>
          <div className="sd-tabs" style={{ marginBottom: 'var(--space-3)' }}>
            {SOURCE_TABS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={`sd-tabs__tab sda-tabs__tab--icon${videoType === value ? ' sd-tabs__tab--active' : ''}`}
                onClick={() => handleTypeChange(value)}
                aria-pressed={videoType === value}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>

          {isUpload ? (
            <>
              <VideoUploader
                value={videoUrl}
                onChange={handleUploadChange}
                path={`events/${eventId}/video/main`}
                maxSizeMB={maxSizeMB}
                allowedTypes={allowedTypes}
                onUploadingChange={onUploadingChange}
              />
              {videoErrors.videoUrl && (
                <span className="sd-error">{videoErrors.videoUrl.message}</span>
              )}
              <span className="sd-note" style={{ display: 'block', marginTop: 'var(--space-2)' }}>
                MP4 ou WEBM, até {maxSizeMB}MB. O arquivo fica hospedado no projeto — para vídeos
                longos, um link do YouTube/Vimeo carrega mais rápido para o visitante.
              </span>
            </>
          ) : (
            <>
              <input
                {...register('videoBlock.videoUrl')}
                className="sd-input"
                type="text"
                placeholder="https://youtube.com/watch?v=… ou https://vimeo.com/…"
              />
              {videoErrors.videoUrl && (
                <span className="sd-error">{videoErrors.videoUrl.message}</span>
              )}
              <span className="sd-note">
                YouTube ou Vimeo, incluindo links curtos (youtu.be). O vídeo continua hospedado na
                plataforma — não é enviado para cá.
              </span>

              {/* Prévia do player, no mesmo wrapper 16:9 do site público. */}
              {embed && (
                <div style={{ marginTop: 'var(--space-4)' }}>
                  <span className="sd-label">Prévia</span>
                  <div className="sdp-video-embed" style={{ marginTop: 'var(--space-2)' }}>
                    <iframe
                      src={embed.embedUrl}
                      title="Prévia do vídeo da edição"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
