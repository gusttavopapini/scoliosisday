// src/features/public/HomePage.jsx
// Home do site público: hero do evento atual, institucional e depoimentos.

import HomeHero from './components/HomeHero.jsx';
import HomeAbout from './components/HomeAbout.jsx';
import HomeTestimonials from './components/HomeTestimonials.jsx';

export default function HomePage() {
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
      <HomeTestimonials />
    </>
  );
}
