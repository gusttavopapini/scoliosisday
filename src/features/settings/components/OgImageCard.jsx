// src/features/settings/components/OgImageCard.jsx
// Imagem de preview de link (og:image) — a miniatura que aparece ao
// compartilhar o site no WhatsApp, no Google, no Facebook e no LinkedIn.
//
// Mora na página de Redes Sociais porque ela já é, na prática, a tela de
// configurações globais do site, e já edita inline sem modal. Mesmo padrão
// visual (sd-card solto, sem wrapper externo).
//
// A prévia recorta em 1,91:1 de propósito, com object-fit: cover — é
// exatamente o que o card do WhatsApp faz. Mostrar a imagem inteira aqui
// esconderia justamente o problema que o administrador precisa enxergar
// antes de publicar: uma foto quadrada perde as bordas de cima e de baixo.
//
// O que esta tela NÃO faz: publicar. Salvar aqui grava no Firestore e a
// Cloud Function dispara o rebuild da Vercel (ver functions/index.js) —
// a troca só aparece nos previews quando o deploy termina, alguns minutos
// depois. O aviso na tela existe para essa expectativa não pegar ninguém
// de surpresa.

import { useRef, useState } from 'react';
import { Upload, Trash2, ImageOff } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  UPLOAD_PRESETS,
  validateFile,
  uploadFileWithPath,
  deleteFile,
} from '../../../services/storageService.js';
import {
  OG_IMAGE_RECOMMENDED,
  OG_IMAGE_ASPECT_RATIO,
  getOgImageWarnings,
  newOgImageVersion,
} from '../../../utils/ogImage.js';
import { useSeoSettings, useSaveOgImage, useClearOgImage } from '../../../hooks/useSeoSettings.js';

/** Caminho base no Storage — o sufixo único por upload vem do serviço. */
const STORAGE_BASE_PATH = 'settings/og/preview';

/**
 * Largura e altura reais do arquivo, lidas antes de subir.
 *
 * Só o navegador sabe isso: o File carrega bytes e tipo, não dimensão. Sem
 * ler aqui, o aviso de proporção não teria como existir, e width/height
 * gravados no Firestore (que viram og:image:width/height no HTML) seriam
 * chute. Nunca rejeita: se a imagem não decodificar, devolve zeros e o
 * aviso de proporção simplesmente não é avaliado.
 *
 * @param {File} file
 * @returns {Promise<{ width: number, height: number }>}
 */
function readImageSize(file) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: 0, height: 0 });
    };
    img.src = objectUrl;
  });
}

export default function OgImageCard() {
  const { data, isLoading } = useSeoSettings();
  const saveMutation = useSaveOgImage();
  const clearMutation = useClearOgImage();

  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const ogImage = data?.ogImage;
  const hasImage = Boolean(ogImage?.url);
  const isBusy = progress !== null || saveMutation.isPending || clearMutation.isPending;

  async function handleFile(file) {
    if (!file) return;

    // Limite duro primeiro: formato e 2MB. Lança com mensagem pronta.
    try {
      validateFile(file, UPLOAD_PRESETS.ogImage);
    } catch (error) {
      toast.error(error.message);
      return;
    }

    const { width, height } = await readImageSize(file);

    // Avisos NÃO bloqueiam — são orientação, e a decisão continua sendo do
    // administrador. Ficam visíveis no card depois do upload, não num
    // toast que some antes de dar tempo de ler.
    const nextWarnings = getOgImageWarnings({ width, height, sizeBytes: file.size });

    // Guardado antes de sobrescrever o estado: é o arquivo que precisa sair
    // do Storage depois que o novo entrar. Apagar ANTES do upload deixaria
    // o site sem imagem se o envio falhasse no meio.
    const previousUrl = ogImage?.url ?? null;

    setProgress(0);
    try {
      const { url, path } = await uploadFileWithPath(STORAGE_BASE_PATH, file, setProgress);

      await saveMutation.mutateAsync({
        url,
        storagePath: path,
        // Versão nova a cada troca: é o que muda o endereço no HTML e
        // vence o cache agressivo de preview do WhatsApp.
        version: newOgImageVersion(),
        width: width || null,
        height: height || null,
        sizeBytes: file.size,
      });

      if (previousUrl) await deleteFile(previousUrl);

      setWarnings(nextWarnings);
      toast.success('Imagem de compartilhamento atualizada!');
    } catch (error) {
      console.error('[OgImageCard] Falha ao enviar imagem:', error);
      toast.error(error.message || 'Erro ao enviar a imagem.');
    } finally {
      setProgress(null);
      // Sem isto, escolher o MESMO arquivo de novo não dispara change.
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove() {
    const previousUrl = ogImage?.url ?? null;
    try {
      await clearMutation.mutateAsync();
      if (previousUrl) await deleteFile(previousUrl);
      setWarnings([]);
      toast.success('Imagem removida. O site volta à imagem padrão.');
    } catch (error) {
      console.error('[OgImageCard] Falha ao remover imagem:', error);
      toast.error(error.message || 'Erro ao remover a imagem.');
    }
  }

  return (
    <section className="sd-card sda-ogimage">
      <header className="sda-ogimage__head">
        <h2 className="sd-subtitle">Imagem de compartilhamento</h2>
        <p className="sd-muted sd-small">
          Miniatura exibida ao compartilhar o site no WhatsApp, no Google e nas redes.
          Recomendado: {OG_IMAGE_RECOMMENDED.width}×{OG_IMAGE_RECOMMENDED.height}px
          (proporção 1,91:1), até 600KB.
        </p>
      </header>

      {isLoading ? (
        <p className="sd-muted sd-small">Carregando...</p>
      ) : (
        <>
          {/* Prévia no enquadramento real do card de compartilhamento. */}
          <div
            className="sda-ogimage__preview"
            style={{ aspectRatio: String(OG_IMAGE_ASPECT_RATIO) }}
          >
            {hasImage ? (
              <img src={ogImage.url} alt="Prévia da imagem de compartilhamento" />
            ) : (
              <div className="sda-ogimage__empty">
                <ImageOff size={28} aria-hidden="true" />
                <span className="sd-small">Usando a imagem padrão do site</span>
              </div>
            )}
          </div>

          {hasImage && ogImage.width && ogImage.height && (
            <p className="sd-note">
              {ogImage.width}×{ogImage.height}px
              {ogImage.sizeBytes ? ` · ${Math.round(ogImage.sizeBytes / 1024)}KB` : ''}
            </p>
          )}

          {warnings.map((warning) => (
            <p key={warning} className="sda-ogimage__warning">
              ⚠️ {warning}
            </p>
          ))}

          {progress !== null && (
            <p className="sd-note">Enviando... {progress}%</p>
          )}

          <div className="sda-ogimage__actions">
            <input
              ref={inputRef}
              type="file"
              accept={UPLOAD_PRESETS.ogImage.allowedTypes.join(',')}
              onChange={(event) => handleFile(event.target.files?.[0])}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="sd-btn sd-btn--primary"
              onClick={() => inputRef.current?.click()}
              disabled={isBusy}
            >
              <Upload size={16} aria-hidden="true" />
              {hasImage ? 'Trocar imagem' : 'Enviar imagem'}
            </button>

            {hasImage && (
              <button
                type="button"
                className="sd-btn sd-btn--outline"
                onClick={handleRemove}
                disabled={isBusy}
              >
                <Trash2 size={16} aria-hidden="true" />
                Remover
              </button>
            )}
          </div>

          <p className="sd-note">
            A troca não é instantânea: salvar aqui dispara uma nova publicação do
            site, e a miniatura nova aparece nos compartilhamentos alguns minutos
            depois. WhatsApp e Facebook também guardam previews antigos por conta
            própria — para forçar a atualização de um link já compartilhado, use o
            Sharing Debugger do Facebook.
          </p>
        </>
      )}
    </section>
  );
}
