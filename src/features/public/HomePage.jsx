// src/features/public/HomePage.jsx
// Home do site público: hero do evento atual, institucional e depoimentos.

import HomeHero from './components/HomeHero.jsx';
import HomeAbout from './components/HomeAbout.jsx';
import HomeTestimonials from './components/HomeTestimonials.jsx';

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeAbout />
      <HomeTestimonials />
    </>
  );
}
