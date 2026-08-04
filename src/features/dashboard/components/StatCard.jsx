// src/features/dashboard/components/StatCard.jsx
// Cartão de totalização do dashboard (seção 11.1).
// O cartão inteiro é um link para o módulo correspondente.

import { Link } from 'react-router-dom';

/**
 * @param {{
 *   icon: React.ComponentType<{ size?: number }>,
 *   value: number,
 *   label: string,
 *   to: string,
 *   isLoading?: boolean,
 *   breakdown?: { label: string, value: number }[],
 *   badge?: number,
 *   highlight?: boolean,
 * }} props
 */
export default function StatCard({
  icon: Icon,
  value,
  label,
  to,
  isLoading = false,
  breakdown,
  badge,
  highlight = false,
}) {
  return (
    <Link
      to={to}
      className="sd-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        textDecoration: 'none',
        color: 'inherit',
      }}
      aria-label={`${label}: ${isLoading ? 'carregando' : value}`}
    >
      {/* Ícone + badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          className={`sd-icon-badge sd-icon-badge--sm ${
            highlight ? 'sd-icon-badge--orange-soft' : 'sd-icon-badge--teal-soft'
          }`}
          aria-hidden="true"
        >
          <Icon size={18} />
        </span>

        {badge > 0 && <span className="sd-badge">{badge}</span>}
      </div>

      {/* Valor + rótulo */}
      <div className={`sd-stat${highlight ? ' sd-stat--orange' : ''}`}>
        {isLoading ? (
          <span
            className="sda-skeleton"
            style={{ height: 'var(--space-8)', width: 'var(--space-16)' }}
            aria-hidden="true"
          />
        ) : (
          <span className="sd-stat__value">{value}</span>
        )}
        <span className="sd-stat__label">{label}</span>
      </div>

      {/* Quebra por status / tipo */}
      {breakdown && !isLoading && (
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 'var(--space-3) 0 0',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          {breakdown.map((item) => (
            <li
              key={item.label}
              className="sd-small sd-muted"
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              <span>{item.label}</span>
              <span style={{ fontWeight: 'var(--fw-semibold)' }}>{item.value}</span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
