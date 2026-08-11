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

// Fora do componente — roda uma vez só, na primeira vez que este módulo é
// avaliado (ScrollToTop é montado uma única vez, na raiz do router).
// history.scrollRestoration por padrão é 'auto': o navegador tenta
// restaurar sozinho a posição de scroll salva por ele em cada navegação
// (mais agressivo em mobile), competindo com o window.scrollTo(0,0) do
// efeito abaixo — corrida que explica o reset "às vezes funcionar, às
// vezes não". 'manual' desliga essa restauração nativa, deixando o reset
// só por nossa conta.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
