// src/features/events/components/EventsSkeleton.jsx

export default function EventsSkeleton() {
  return (
    <div className="sd-grid sd-grid--3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="sd-card" style={{ animation: 'pulse var(--duration-normal) infinite' }}>
          <div
            style={{
              width: '100%',
              height: '180px',
              backgroundColor: 'var(--gray-200)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-3)',
            }}
          />
          <div
            style={{
              width: '80%',
              height: '20px',
              backgroundColor: 'var(--gray-200)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-2)',
            }}
          />
          <div
            style={{
              width: '100%',
              height: '16px',
              backgroundColor: 'var(--gray-200)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-3)',
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {Array.from({ length: 3 }).map((_, j) => (
              <div
                key={j}
                style={{
                  width: '60px',
                  height: '24px',
                  backgroundColor: 'var(--gray-200)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
