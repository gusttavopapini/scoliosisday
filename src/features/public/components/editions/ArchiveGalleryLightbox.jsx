// src/features/public/components/editions/ArchiveGalleryLightbox.jsx
// Lightbox da galeria completa de uma edição — aberto ao clicar numa das
// fotos em destaque do leque (ArchiveFanGallery.jsx). Reaproveita o
// primitivo Modal.jsx (mesmo padrão do PersonModal: X, clique fora, Esc já
// resolvidos ali); a navegação entre fotos é local a este componente.

import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Modal from '../../../../components/ui/Modal.jsx';
import { useLanguage } from '../../../../hooks/useLanguage.js';

/**
 * @param {{
 *   images: { url: string }[],
 *   initialIndex: number,
 *   title: string,
 *   onClose: () => void,
 * }} props
 */
export default function ArchiveGalleryLightbox({ images, initialIndex, title, onClose }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(initialIndex);
  const count = images.length;

  function step(delta) {
    setIndex((prev) => (prev + delta + count) % count);
  }

  return (
    <Modal
      labelledBy="archive-gallery-title"
      onClose={onClose}
      closeOnOverlay
      panelClassName="sdp-archive-lightbox__panel"
    >
      <div className="sda-modal__head">
        <h2 id="archive-gallery-title" className="sr-only">{title}</h2>
        <button
          className="sd-btn sd-btn--ghost sd-btn--sm"
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="sdp-archive-lightbox__body">
        {count > 1 && (
          <button
            type="button"
            className="sdp-carousel__btn sdp-archive-lightbox__nav sdp-archive-lightbox__nav--prev"
            onClick={() => step(-1)}
            aria-label={t.common.back}
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
        )}

        <img className="sdp-archive-lightbox__image" src={images[index].url} alt="" />

        {count > 1 && (
          <button
            type="button"
            className="sdp-carousel__btn sdp-archive-lightbox__nav sdp-archive-lightbox__nav--next"
            onClick={() => step(1)}
            aria-label={t.common.next}
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      {count > 1 && (
        <p className="sdp-archive-lightbox__counter">
          {t.site.archiveGalleryCounter.replace('{current}', index + 1).replace('{total}', count)}
        </p>
      )}
    </Modal>
  );
}
