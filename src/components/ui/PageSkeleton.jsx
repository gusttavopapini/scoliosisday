// src/components/ui/PageSkeleton.jsx
// Fallback do <Suspense> das rotas: a página ainda não chegou pela rede.
// Espelha o esqueleto de qualquer tela do painel — cabeçalho e blocos de
// conteúdo — para que a troca de rota não pisque um vazio.

const BLOCK_COUNT = 4;

export default function PageSkeleton() {
  return (
    <div className="sda-content" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando…</span>

      {/* ── Cabeçalho ── */}
      <header className="sda-pagehead">
        <div className="sda-pagehead__meta" style={{ width: '100%' }}>
          <div
            className="sda-skeleton"
            style={{
              width: 'min(18rem, 60%)',
              height: 'var(--space-8)',
              marginBottom: 'var(--space-3)',
            }}
          />
          <div
            className="sda-skeleton"
            style={{ width: 'min(28rem, 85%)', height: 'var(--space-4)' }}
          />
        </div>
      </header>

      {/* ── Blocos de conteúdo ── */}
      <div className="sd-grid sd-grid--3" style={{ marginTop: 'var(--space-6)' }}>
        {Array.from({ length: BLOCK_COUNT }).map((_, i) => (
          <div
            key={i}
            className="sda-skeleton"
            style={{ width: '100%', height: 'var(--space-32)' }}
          />
        ))}
      </div>
    </div>
  );
}
