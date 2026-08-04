// src/features/staff/components/StaffSkeleton.jsx
// Estado de carregamento das abas da equipe.
// columns permite reaproveitar o mesmo shimmer nas duas abas,
// que têm número de colunas diferente.

/**
 * @param {{ columns: string[], rows?: number }} props
 */
export default function StaffSkeleton({ columns, rows = 5 }) {
  return (
    <table className="sda-table" aria-label="Carregando equipe" aria-busy="true">
      <thead>
        <tr>
          {columns.map((label) => (
            <th key={label} scope="col">{label}</th>
          ))}
          <th scope="col"><span className="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <tr key={rowIndex} className="sda-table__row" aria-hidden="true">
            {columns.map((label, colIndex) => (
              <td key={label}>
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
