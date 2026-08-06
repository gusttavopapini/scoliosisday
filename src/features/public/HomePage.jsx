// src/features/public/HomePage.jsx
// Home do site público: hero do evento atual, institucional, apoiadores e
// depoimentos (texto + vídeo — a antiga /depoimentos foi removida, os dois
// vivem só aqui agora).

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HomeHero from './components/HomeHero.jsx';
import HomeAbout from './components/HomeAbout.jsx';
import HomeSupporters from './components/HomeSupporters.jsx';
import HomeTestimonials from './components/HomeTestimonials.jsx';
import VideoTestimonials from './components/testimonials/VideoTestimonials.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';

export default function HomePage() {
  const { t } = useLanguage();
  const location = useLocation();

  // Primeira âncora do site (ver #depoimentos no navbar/rodapé) — o
  // history.pushState do react-router não rola a página sozinho como um
  // link <a href="#id"> tradicional faria. scroll-behavior:smooth já é
  // global (design-system.css), só falta disparar o scrollIntoView. O
  // atraso pequeno dá tempo do conteúdo acima (hero, cards) assentar
  // depois do carregamento assíncrono, senão o alvo pode estar mais
  // acima do que deveria.
  useEffect(() => {
    if (location.hash !== '#depoimentos') return;
    const id = location.hash.slice(1);
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    return () => clearTimeout(timer);
  }, [location.hash]);

  return (
    <>
      {/* Mesma textura pontilhada com fade de /edicoes (utilitário
          compartilhado, ver .sdp-dotted-fade em public.css), dissipando
          antes de "O que é o Scoliosis Day". O navbar fica fora daqui —
          é renderizado por PublicLayout.jsx, fora do <Outlet/> desta
          página — mas é opaco (sem brecha visível), então não haveria
          textura visível atrás dele de qualquer forma; o efeito real
          aparece na moldura/respiro ao redor do hero, igual em Edições. */}
      <div className="sdp-dotted-fade">
        <HomeHero />
      </div>
      <HomeAbout />
      <HomeSupporters />

      {/* Âncora do link "Depoimentos" do navbar/rodapé (/#depoimentos) —
          na própria div, não num dos dois componentes abaixo, porque
          cada um se oculta sozinho sem dado (nenhum dos dois é garantido
          presente), e o alvo do scroll precisa existir de qualquer jeito. */}
      <div id="depoimentos">
        <HomeTestimonials />
        <VideoTestimonials title={t.site.testimonialsPageVideoTitle} />
      </div>
    </>
  );
}
