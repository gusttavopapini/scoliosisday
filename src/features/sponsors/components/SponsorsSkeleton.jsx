// src/features/sponsors/components/SponsorsSkeleton.jsx
// Skeleton de carregamento para grid de patrocinadores.

export default function SponsorsSkeleton() {
  return (
    <div className="sd-grid sd-grid--4" style={{ gap: 'var(--space-5)' }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="sd-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div
            className="sda-skeleton"
            style={{ width: '100%', height: 120, borderRadius: 'var(--radius-md)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div
              className="sda-skeleton"
              style={{ height: 'var(--space-4)', width: '80%' }}
            />
            <div
              className="sda-skeleton"
              style={{ height: 'var(--space-3)', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'auto' }}>
            <div
              className="sda-skeleton"
              style={{ flex: 1, height: 'var(--space-8)' }}
            />
            <div
              className="sda-skeleton"
              style={{ flex: 1, height: 'var(--space-8)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
