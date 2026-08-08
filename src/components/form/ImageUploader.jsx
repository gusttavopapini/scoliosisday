// src/components/form/ImageUploader.jsx
// Campo de upload de imagem: arrastar-e-soltar ou clique, com preview,
// barra de progresso e troca do arquivo anterior.
//
// Visual pelo .sda-upload / .sda-progress do design system; aqui só entram as
// partes que o kit não tem (preview e botão de remover), em sdaimg-* dentro
// de admin.css.
//
// Controlado: o dono do estado é quem passa `value`/`onChange`. O componente
// não guarda a URL — só o progresso e o erro do upload em andamento.

import { useRef, useState } from 'react';
import { UploadCloud, X, AlertCircle, Pencil } from 'lucide-react';
import { uploadFile, deleteFile, validateFile } from '../../services/storageService.js';

/**
 * @param {{
 *   value?: string,
 *   onChange: (url: string) => void,
 *   path: string,
 *   maxSizeMB: number,
 *   allowedTypes: string[],
 *   label?: string,
 *   disabled?: boolean,
 *   aspectRatio?: string,
 *   square?: boolean,
 * }} props
 */
export default function ImageUploader({
  value,
  onChange,
  path,
  maxSizeMB,
  allowedTypes,
  label,
  disabled = false,
  aspectRatio,
  square = false,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const isUploading = progress !== null;
  const isBusy = isUploading || disabled;

  const hint = `${allowedTypes
    .map((type) => type.replace('image/', '').replace('svg+xml', 'svg').toUpperCase())
    .join(', ')} · até ${maxSizeMB}MB`;

  async function handleFile(file) {
    setError('');

    try {
      validateFile(file, { maxSizeMB, allowedTypes });
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    // A URL anterior é guardada antes do upload porque `value` já terá mudado
    // quando a faxina rodar.
    const previousUrl = value;
    setProgress(0);

    try {
      const url = await uploadFile(path, file, setProgress);
      onChange(url);
      // Só depois de a nova imagem existir: se o upload falhar, o registro
      // continua com a imagem antiga intacta em vez de ficar sem nenhuma.
      if (previousUrl) await deleteFile(previousUrl);
    } catch (uploadError) {
      console.error('[ImageUploader] Falha no upload:', uploadError);
      setError('Falha no envio. Verifique a conexão e tente novamente.');
    } finally {
      setProgress(null);
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
    // O botão vive dentro da área clicável; sem isto, remover reabriria o
    // seletor de arquivos logo em seguida.
    event.stopPropagation();
    const previousUrl = value;
    onChange('');
    if (previousUrl) await deleteFile(previousUrl);
  }

  function openPicker() {
    if (!isBusy) inputRef.current?.click();
  }

  function handleKeyDown(event) {
    // A área é um <div> com role=button: Enter/Espaço precisam ativá-la à mão.
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  }

  const areaClassName = [
    'sda-upload',
    isDragging && 'sda-upload--dragging',
    error && 'sda-upload--error',
  ]
    .filter(Boolean)
    .join(' ');

  // Com imagem carregada, a caixa grande de dropzone dá lugar ao cluster de
  // botões pequenos no canto do preview (remover / trocar) — ela só volta a
  // aparecer vazia ou durante um novo envio (troca em andamento).
  const hasValue = Boolean(value) && !isUploading;

  return (
    <div className={`sdaimg-uploader${square ? ' sdaimg-uploader--square' : ''}`}>
      {hasValue && (
        <div
          className="sdaimg-uploader__preview"
          style={!square && aspectRatio ? { aspectRatio } : undefined}
        >
          <img src={value} alt={label ? `Pré-visualização — ${label}` : 'Pré-visualização'} />
          {!disabled && (
            <button
              type="button"
              className="sdaimg-uploader__remove"
              onClick={handleRemove}
              aria-label="Remover imagem"
              title="Remover imagem"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
          {!disabled && (
            <button
              type="button"
              className="sdaimg-uploader__edit"
              onClick={openPicker}
              aria-label="Trocar imagem"
              title="Trocar imagem"
            >
              <Pencil size={16} aria-hidden="true" />
              {/* Some sob :hover/:focus num ícone só; sempre visível em
                  telas de toque, que não têm hover (ver admin.css). */}
              <span className="sdaimg-uploader__edit-label">Trocar imagem</span>
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
            {isUploading
              ? `Enviando… ${progress}%`
              : square
                ? 'Arraste ou clique'
                : 'Arraste uma imagem ou clique para escolher'}
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

      {/* Fora dos dois blocos acima: tanto o dropzone quanto o botão de
          editar (estado com imagem) abrem o mesmo seletor via inputRef. */}
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
