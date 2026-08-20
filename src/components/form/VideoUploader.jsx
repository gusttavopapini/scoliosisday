// src/components/form/VideoUploader.jsx
// Campo de upload de vídeo: arrastar-e-soltar ou clique, com preview,
// barra de progresso e troca do arquivo anterior.
//
// Irmão de ImageUploader.jsx e deliberadamente igual a ele em estrutura,
// classes (.sda-upload / .sda-progress / .sdaimg-uploader) e contrato
// controlado — o dono do estado é quem passa value/onChange. Não virou um
// componente só com um `accept` diferente por três motivos que mudam o
// comportamento, não só a aparência:
//
//   · o preview é <video controls>, não <img>;
//   · o upload devolve TAMBÉM o caminho no Storage (videoStoragePath do
//     documento), então onChange recebe { url, path } em vez de string;
//   · o envio é longo (arquivos de até 100MB), então o progresso precisa
//     ficar visível durante a troca, e não só no primeiro envio.
//
// `onUploadingChange` reporta ao formulário que há envio em andamento —
// é o que impede publicar a edição no meio de um upload.

import { useRef, useState } from 'react';
import { UploadCloud, X, AlertCircle, Pencil } from 'lucide-react';
import { uploadFileWithPath, deleteFile, validateFile } from '../../services/storageService.js';

/**
 * @param {{
 *   value?: string,
 *   onChange: (result: { url: string, path: string|null }) => void,
 *   path: string,
 *   maxSizeMB: number,
 *   allowedTypes: string[],
 *   disabled?: boolean,
 *   onUploadingChange?: (isUploading: boolean) => void,
 * }} props
 */
export default function VideoUploader({
  value,
  onChange,
  path,
  maxSizeMB,
  allowedTypes,
  disabled = false,
  onUploadingChange,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const isUploading = progress !== null;
  const isBusy = isUploading || disabled;

  const hint = `${allowedTypes
    .map((type) => type.replace('video/', '').toUpperCase())
    .join(', ')} · até ${maxSizeMB}MB`;

  function setUploading(next) {
    setProgress(next);
    onUploadingChange?.(next !== null);
  }

  async function handleFile(file) {
    setError('');

    try {
      validateFile(file, { maxSizeMB, allowedTypes });
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    // Guardado antes do upload porque `value` já terá mudado quando a
    // faxina rodar — mesmo cuidado do ImageUploader.
    const previousUrl = value;
    setUploading(0);

    try {
      const { url, path: storagePath } = await uploadFileWithPath(path, file, setProgress);
      onChange({ url, path: storagePath });
      // Só depois de o novo vídeo existir: se o upload falhar, a edição
      // continua com o vídeo antigo em vez de ficar sem nenhum.
      if (previousUrl) await deleteFile(previousUrl);
    } catch (uploadError) {
      console.error('[VideoUploader] Falha no upload:', uploadError);
      setError('Falha no envio. Verifique a conexão e tente novamente.');
    } finally {
      setUploading(null);
    }
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    // Zera para que escolher o MESMO arquivo de novo dispare change outra vez.
    event.target.value = '';
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (isBusy) return;
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleRemove(event) {
    event.stopPropagation();
    const previousUrl = value;
    onChange({ url: '', path: null });
    if (previousUrl) await deleteFile(previousUrl);
  }

  function openPicker() {
    if (!isBusy) inputRef.current?.click();
  }

  function handleKeyDown(event) {
    // A área é um <div> com role=button: Enter/Espaço precisam ativá-la à
    // mão. preventDefault também evita que o Enter chegue ao <form>.
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  }

  const areaClassName = ['sda-upload', isDragging && 'sda-upload--dragging', error && 'sda-upload--error']
    .filter(Boolean)
    .join(' ');

  const hasValue = Boolean(value) && !isUploading;

  return (
    <div className="sdaimg-uploader">
      {hasValue && (
        <div className="sdaimg-uploader__preview" style={{ aspectRatio: '16 / 9' }}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- vídeo enviado pelo admin, sem legendas geradas. */}
          <video src={value} controls preload="metadata" style={{ width: '100%', height: '100%' }} />
          {!disabled && (
            <button
              type="button"
              className="sdaimg-uploader__remove"
              onClick={handleRemove}
              aria-label="Remover vídeo"
              title="Remover vídeo"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
          {!disabled && (
            <button
              type="button"
              className="sdaimg-uploader__edit"
              onClick={openPicker}
              aria-label="Trocar vídeo"
              title="Trocar vídeo"
            >
              <Pencil size={16} aria-hidden="true" />
              <span className="sdaimg-uploader__edit-label">Trocar vídeo</span>
            </button>
          )}
        </div>
      )}

      {!hasValue && (
        <div
          className={areaClassName}
          role="button"
          tabIndex={isBusy ? -1 : 0}
          aria-disabled={isBusy}
          onClick={openPicker}
          onKeyDown={handleKeyDown}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isBusy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <span className={`sda-upload__icon${error ? ' sda-upload__icon--error' : ''}`} aria-hidden="true">
            {error ? <AlertCircle size={28} /> : <UploadCloud size={28} />}
          </span>

          <span className={`sda-upload__label${error ? ' sda-upload__label--error' : ''}`}>
            {isUploading ? `Enviando… ${progress}%` : 'Arraste um vídeo ou clique para escolher'}
          </span>

          <span className="sda-upload__hint">{error || hint}</span>

          {isUploading && (
            <div
              className="sda-progress"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="sda-progress__fill" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={allowedTypes.join(',')}
        onChange={handleInputChange}
        disabled={isBusy}
        tabIndex={-1}
      />
    </div>
  );
}
