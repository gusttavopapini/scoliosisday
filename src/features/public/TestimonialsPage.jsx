// src/features/public/TestimonialsPage.jsx
// Página institucional /depoimentos: carrossel de depoimentos textuais
// (sempre visível, com fallback) e em vídeo (só existe com dado real).

import { useLanguage } from '../../hooks/useLanguage.js';
import SimpleHero from '../../components/public/SimpleHero.jsx';
import TextTestimonials from './components/testimonials/TextTestimonials.jsx';
import VideoTestimonials from './components/testimonials/VideoTestimonials.jsx';

export default function TestimonialsPage() {
  const { t } = useLanguage();

  return (
    <div className="sdp-testimonials-page">
      <SimpleHero
        title={t.site.testimonialsPageHeroTitle}
        subtitle={t.site.testimonialsPageHeroSubtitle}
      />

      <TextTestimonials title={t.site.testimonialsPageTextTitle} />
      <VideoTestimonials title={t.site.testimonialsPageVideoTitle} />
    </div>
  );
}
