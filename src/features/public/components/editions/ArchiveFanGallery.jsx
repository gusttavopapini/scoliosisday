// src/features/public/components/editions/ArchiveFanGallery.jsx
// Leque de até 3 fotos em destaque da página de arquivo — foto principal
// central e maior, com até 2 fotos atrás levemente rotacionadas para os
// lados (geometria em .sdp-archive-fan, public.css). Padrão DIFERENTE da
// pilha de depoimentos (TestimonialStack): aqui as 3 fotos ficam visíveis
// ao mesmo tempo, paradas — não há troca/autoplay, só o clique abrindo o
// lightbox da galeria completa.
//
// A ordem de cadastro decide a posição: a 1ª foto marcada "Destacar" vira
// a central, a 2ª a da esquerda, a 3ª a da direita. Com menos de 3
// destacadas, o leque se adapta (só central, ou central + esquerda).

import { useState } from 'react';
import { useLanguage } from '../../../../hooks/useLanguage.js';
import ArchiveGalleryLightbox from './ArchiveGalleryLightbox.jsx';

/** @param {{ gallery: { url: string }[], featured: { url: string }[], title: string }} props */
export default function ArchiveFanGallery({ gallery, featured, title }) {
  const { t } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (featured.length === 0) return null;

  function openAt(item) {
    const index = gallery.findIndex((photo) => photo.url === item.url);
    setLightboxIndex(index >= 0 ? index : 0);
  }

  return (
    <>
      <div className="sdp-archive-fan">
        {featured.map((item, index) => (
          <button
            key={item.url}
            type="button"
            className={`sdp-archive-fan__photo sdp-archive-fan__photo--${index}`}
            onClick={() => openAt(item)}
            aria-label={t.site.archiveGalleryOpenLabel}
          >
            <img src={item.url} alt="" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ArchiveGalleryLightbox
          images={gallery}
          initialIndex={lightboxIndex}
          title={title}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
