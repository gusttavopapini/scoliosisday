// src/features/collaborators/components/CollaboratorsSkeleton.jsx
// Estado de carregamento: 6 linhas de shimmer dentro de uma sda-table.

export default function CollaboratorsSkeleton() {
  return (
    <table className="sda-table" aria-label="Carregando colaboradores" aria-busy="true">
      <thead>
        <tr>
          <th scope="col" style={{ width: '40%' }}>Nome</th>
          <th scope="col" style={{ width: '20%' }}>Tipo</th>
          <th scope="col" style={{ width: '20%' }}>Instituição</th>
          <th scope="col" style={{ width: '15%' }}>Adicionado em</th>
          <th scope="col" style={{ width: '5%' }}><span className="sr-only">Ações</span></th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, i) => (
          <tr key={i} className="sda-table__row" aria-hidden="true">
            {/* Nome + avatar */}
            <td>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div
                  className="sda-skeleton"
                  style={{
                    width: 'var(--space-10)',
                    height: 'var(--space-10)',
                    borderRadius: 'var(--radius-pill)',
                    flexShrink: '0',
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: '1' }}>
                  <div
                    className="sda-skeleton"
                    style={{ height: 'var(--space-4)', width: `${55 + (i % 3) * 15}%` }}
                  />
                  <div
                    className="sda-skeleton"
                    style={{ height: 'var(--space-3)', width: `${30 + (i % 4) * 10}%` }}
                  />
                </div>
              </div>
            </td>
            {/* Tipo */}
            <td>
              <div
                className="sda-skeleton"
                style={{ height: 'var(--space-6)', width: 'var(--space-20)', borderRadius: 'var(--radius-pill)' }}
              />
            </td>
            {/* Instituição */}
            <td>
              <div
                className="sda-skeleton"
                style={{ height: 'var(--space-4)', width: `${50 + (i % 3) * 15}%` }}
              />
            </td>
            {/* Data */}
            <td>
              <div
                className="sda-skeleton"
                style={{ height: 'var(--space-4)', width: 'var(--space-20)' }}
              />
            </td>
            {/* Ações */}
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
