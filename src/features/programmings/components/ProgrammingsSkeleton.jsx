// src/features/programmings/components/ProgrammingsSkeleton.jsx
// Skeleton de carregamento para programações.

export default function ProgrammingsSkeleton() {
  return (
    <table className="sda-table">
      <thead>
        <tr>
          <th scope="col">Nome</th>
          <th scope="col">Nº de sessões</th>
          <th scope="col">
            <span className="sr-only">Ações</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {[0, 1, 2].map((i) => (
          <tr key={i} className="sda-table__row">
            <td>
              <div
                className="sda-skeleton"
                style={{ height: 'var(--space-4)', width: '60%' }}
              />
            </td>
            <td>
              <div
                className="sda-skeleton"
                style={{ height: 'var(--space-4)', width: '40px' }}
              />
            </td>
            <td className="sda-table__actions">
              <div
                className="sda-skeleton"
                style={{ height: 'var(--space-6)', width: '100px' }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
