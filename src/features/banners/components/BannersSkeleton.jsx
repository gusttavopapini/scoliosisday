// src/features/banners/components/BannersSkeleton.jsx
// Estado de carregamento da tabela de banners — mesmas colunas
// (miniatura, título, ordem, status).

const COLUMNS = 3;

export default function BannersSkeleton({ rows = 5 }) {
  return (
    <table className="sda-table" aria-label="Carregando banners" aria-busy="true">
      <thead>
        <tr>
          <th scope="col" />
          {Array.from({ length: COLUMNS }, (_, i) => (
            <th key={i} scope="col" />
          ))}
          <th scope="col"><span className="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <tr key={rowIndex} className="sda-table__row" aria-hidden="true">
            <td>
              <div
                className="sda-skeleton"
                style={{ width: 56, height: 36, borderRadius: 'var(--radius-sm)' }}
              />
            </td>
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
