// src/app/ScrollToTop.jsx
// Reseta o scroll pro topo a cada troca de rota — sem isto, o React Router
// preserva a posição de scroll da página anterior ao navegar (ex: abrir uma
// edição no meio do artigo e clicar numa aba do navbar mantinha o scroll no
// meio da tela nova).
//
// Reage só a `pathname`, não à location inteira: navegação por âncora dentro
// da mesma rota (ex: `/#depoimentos`, ver HomePage.jsx) muda location.hash
// sem mudar pathname, e não deve ser interrompida por um reset pro topo.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
