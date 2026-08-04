// src/components/ui/LoadMore.jsx
// Botão de paginação das listagens: as telas carregam 20 itens por vez e
// pedem a página seguinte sob demanda. Some quando a lista acaba.

export default function LoadMore({ hasNextPage, isFetchingNextPage, onLoadMore, label = 'Carregar mais' }) {
  if (!hasNextPage) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
      <button
        className="sd-btn sd-btn--ghost"
        type="button"
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        aria-busy={isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Carregando…' : label}
      </button>
    </div>
  );
}
