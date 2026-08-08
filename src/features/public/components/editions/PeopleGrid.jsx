// src/features/public/components/editions/PeopleGrid.jsx
// Grade de PersonCard, compartilhada por Presenças Confirmadas, Comissão
// Organizadora, Curadoria Científica (Sobre e Edições) e Hall de Estrelas
// (Destaque e Todos) — via PeopleSection.jsx/FeaturedSpeakers.jsx/
// AllSpeakers.jsx, que só decidem QUEM aparece; este componente decide COMO
// (grade centralizada no desktop, carrossel com autoplay no mobile). Uma
// mudança aqui cobre as quatro seções de uma vez.
//
// Mobile (<=640px): scroll-snap horizontal nativo + setInterval chamando
// track.scrollTo() — sem lib de carrossel (Swiper/Embla). Com 2 cards ou
// menos não há "próximo" de verdade pra autoplay ciclar, então cai na
// mesma grade centralizada do desktop mesmo em mobile.
//
// scrollTo() no elemento do track, NUNCA scrollIntoView(): scrollIntoView
// decide sozinho qual é o "ancestral rolável mais próximo" subindo a
// árvore do DOM, e em mobile (Safari/Chrome Android) isso pode acabar
// rolando o WINDOW verticalmente como efeito colateral do avanço
// horizontal do carrossel — foi exatamente o bug relatado (página inteira
// pulando a cada autoplay). scrollTo()/scrollLeft chamado direto na ref do
// track afeta só aquele elemento, sem subir a árvore.

import { useEffect, useRef, useState } from 'react';
import PersonCard from './PersonCard.jsx';

const AUTOPLAY_MS = 3000;
const RESUME_DELAY_MS = 1500;
const MOBILE_QUERY = '(max-width: 640px)';
const MIN_CARDS_FOR_CAROUSEL = 3;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** @param {{ people: object[] }} props */
export default function PeopleGrid({ people }) {
  const trackRef = useRef(null);
  const resumeTimerRef = useRef(null);
  // Lazy initializer: lê o viewport real já no primeiro render, pra não
  // montar como grade e trocar pra carrossel um instante depois (flash).
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isCarousel = isMobile && people.length >= MIN_CARDS_FOR_CAROUSEL;

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (event) => setIsMobile(event.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  /** Centraliza o card `index` dentro do track — só scrollLeft daquele
   *  elemento, calculado à mão (não scrollIntoView, ver nota no topo). */
  function scrollToIndex(index) {
    const track = trackRef.current;
    const card = track?.children[index];
    if (!track || !card) return;
    const target = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
    track.scrollTo({ left: target, behavior: 'smooth' });
  }

  // Autoplay: avança o índice e centraliza o próximo card.
  useEffect(() => {
    if (!isCarousel || isPaused || prefersReducedMotion()) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % people.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, [isCarousel, isPaused, people.length]);

  useEffect(() => () => clearTimeout(resumeTimerRef.current), []);

  if (people.length === 0) return null;

  if (!isCarousel) {
    return (
      <div className="sdp-people-grid">
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>
    );
  }

  /** Índice mais próximo do centro do track, pra sincronizar os dots com um swipe manual. */
  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const center = track.scrollLeft + track.clientWidth / 2;

    let closest = 0;
    let closestDistance = Infinity;
    Array.from(track.children).forEach((child, index) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(childCenter - center);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });
    setActiveIndex(closest);
  }

  function pause() {
    clearTimeout(resumeTimerRef.current);
    setIsPaused(true);
  }

  function resumeAfterDelay() {
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), RESUME_DELAY_MS);
  }

  function goTo(index) {
    pause();
    setActiveIndex(index);
    scrollToIndex(index);
    resumeAfterDelay();
  }

  return (
    <div>
      <div
        ref={trackRef}
        className="sdp-people-grid sdp-people-grid--carousel"
        role="region"
        aria-label="Carrossel de colaboradores"
        onScroll={handleScroll}
        onTouchStart={pause}
        onTouchEnd={resumeAfterDelay}
      >
        {people.map((person) => (
          <PersonCard key={person.id} person={person} />
        ))}
      </div>

      <div className="sdp-carousel__dots" role="tablist" aria-label="Posição no carrossel">
        {people.map((person, index) => (
          <button
            key={person.id}
            type="button"
            role="tab"
            aria-selected={index === activeIndex}
            aria-label={`${index + 1}`}
            className={`sdp-carousel__dot${index === activeIndex ? ' sdp-carousel__dot--active' : ''}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
