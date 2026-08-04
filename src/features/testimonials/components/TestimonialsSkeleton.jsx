// src/features/testimonials/components/TestimonialsSkeleton.jsx
// Estado de carregamento da tabela de depoimentos — mesmas 3 colunas
// (nome, cargo, data) nas duas abas.

const COLUMNS = 3;

export default function TestimonialsSkeleton({ rows = 5 }) {
  return (
    <table className="sda-table" aria-label="Carregando depoimentos" aria-busy="true">
      <thead>
        <tr>
          {Array.from({ length: COLUMNS }, (_, i) => (
            <th key={i} scope="col" />
          ))}
          <th scope="col"><span className="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <tr key={rowIndex} className="sda-table__row" aria-hidden="true">
            {Array.from({ length: COLUMNS }, (_, colIndex) => (
              <td key={colIndex}>
                <div
                  className="sda-skeleton"
                  style={{
                    height: 'var(--space-4)',
                    width: `${45 + ((rowIndex + colIndex) % 4) * 12}%`,
                  }}
                />
              </td>
            ))}
            <td>
              <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                <div
                  className="sda-skeleton"
                  style={{ width: 'var(--space-8)', height: 'var(--space-8)', borderRadius: 'var(--radius-sm)' }}
                />
                <div
                  className="sda-skeleton"
                  style={{ width: 'var(--space-8)', height: 'var(--space-8)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
