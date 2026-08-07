// src/features/events/components/GalleryUploader.jsx
// Galeria de fotos da "página de arquivo" (Passo 5 do wizard) — até 20
// fotos, até 3 marcadas como "Destacar" (as que aparecem no leque de
// EditionArchive.jsx no site público; o resto só entra no lightbox da
// galeria completa).
//
// fieldArray pelo controle de slots (adicionar/remover), watch('gallery')
// pelos valores ao vivo (contagem de destacadas) — mesmo motivo de
// EventStep4.jsx usar watch() junto de Controller: fields do fieldArray
// não refletem edição de valor, só mudança de estrutura.

import { useFieldArray, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import ImageUploader from '../../../components/form/ImageUploader.jsx';
import { UPLOAD_PRESETS, deleteFile } from '../../../services/storageService.js';

const MAX_PHOTOS = 20;
const MAX_FEATURED = 3;

/** @param {{ control: object, watch: (name: string) => any, eventId: string, errors: object }} props */
export default function GalleryUploader({ control, watch, eventId, errors }) {
  const { fields, append, remove } = useFieldArray({ control, name: 'gallery' });
  const galleryValue = watch('gallery') || [];
  const featuredCount = galleryValue.filter((item) => item?.featured).length;

  async function handleRemove(index) {
    const url = galleryValue[index]?.url;
    remove(index);
    if (url) await deleteFile(url);
  }

  return (
    <div className="sd-field">
      <span className="sd-label">Galeria de fotos (opcional)</span>
      <span className="sd-note">
        Até {MAX_PHOTOS} fotos. Marque até {MAX_FEATURED} como "Destacar" — são as que aparecem
        no leque da página de arquivo; o restante só aparece na galeria completa.
      </span>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-3)',
        }}
      >
        {fields.map((field, index) => {
          const item = galleryValue[index] || {};
          const featuredDisabled = !item.featured && featuredCount >= MAX_FEATURED;

          return (
            <div key={field.id} className="sd-card" style={{ padding: 'var(--space-3)' }}>
              <Controller
                name={`gallery.${index}.url`}
                control={control}
                render={({ field: urlField }) => (
                  <ImageUploader
                    value={urlField.value || ''}
                    onChange={urlField.onChange}
                    path={`events/${eventId}/gallery/${field.id}`}
                    square
                    {...UPLOAD_PRESETS.eventGallery}
                  />
                )}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'var(--space-2)',
                }}
              >
                <label className="sd-checkbox" style={{ fontSize: 'var(--text-sm)' }}>
                  <Controller
                    name={`gallery.${index}.featured`}
                    control={control}
                    render={({ field: featuredField }) => (
                      <input
                        type="checkbox"
                        checked={!!featuredField.value}
                        disabled={featuredDisabled}
                        onChange={(event) => featuredField.onChange(event.target.checked)}
                      />
                    )}
                  />
                  <span className="sd-checkbox__box" aria-hidden="true" />
                  <span>Destacar</span>
                </label>

                <button
                  type="button"
                  className="sd-btn sd-btn--ghost sd-btn--sm"
                  onClick={() => handleRemove(index)}
                  aria-label="Remover foto"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {errors.gallery?.message && <span className="sd-error">{errors.gallery.message}</span>}

      {fields.length < MAX_PHOTOS && (
        <button
          type="button"
          className="sd-btn sd-btn--secondary"
          style={{ marginTop: 'var(--space-4)' }}
          onClick={() => append({ url: '', featured: false })}
        >
          + Adicionar foto
        </button>
      )}
    </div>
  );
}
