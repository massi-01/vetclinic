import React from 'react';

/**
 * Skeleton placeholder for Top KPI / Stat cards
 */
export const SkeletonStatCard = () => (
  <div
    className="card"
    style={{
      padding: '0.85rem 1.1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem'
    }}
  >
    <div
      className="skeleton skeleton-avatar"
      style={{ width: '42px', height: '42px', flexShrink: 0 }}
    />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div className="skeleton" style={{ height: '0.75rem', width: '65%' }} />
      <div className="skeleton" style={{ height: '1.4rem', width: '40%' }} />
    </div>
  </div>
);

/**
 * General Entity Card Skeleton (e.g. PetCard, VisitCard, TherapyCard, OwnerCard)
 */
export const SkeletonCard = ({ hasAvatar = true, lines = 3 }) => (
  <div className="skeleton-card">
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {hasAvatar && (
        <div
          className="skeleton skeleton-avatar"
          style={{ width: '46px', height: '46px', flexShrink: 0 }}
        />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div className="skeleton" style={{ height: '1.1rem', width: '60%' }} />
        <div className="skeleton" style={{ height: '0.75rem', width: '40%' }} />
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton skeleton-text"
          style={{ width: i === lines - 1 ? '55%' : '100%' }}
        />
      ))}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
      <div className="skeleton" style={{ height: '0.8rem', width: '30%', borderRadius: 'var(--radius-full)' }} />
      <div className="skeleton" style={{ height: '1.5rem', width: '25%', borderRadius: 'var(--radius-sm)' }} />
    </div>
  </div>
);

/**
 * Responsive Grid of Skeleton Cards
 */
export const SkeletonGrid = ({ count = 6, minWidth = '280px', hasAvatar = true, lines = 3 }) => (
  <div
    className="grid-responsive"
    style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`, gap: '1rem' }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} hasAvatar={hasAvatar} lines={lines} />
    ))}
  </div>
);

/**
 * Skeleton for Agenda Time Slots
 */
export const SkeletonAgendaSlots = ({ count = 7 }) => {
  const sampleSlots = ['08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            minHeight: '48px',
            backgroundColor: '#ffffff'
          }}
        >
          <div
            style={{
              width: '75px',
              padding: '0.5rem',
              backgroundColor: 'var(--slate-50)',
              borderRight: '1px solid var(--border-color)',
              textAlign: 'center',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: 'var(--slate-400)'
            }}
          >
            {sampleSlots[i] || '12:00'}
          </div>
          <div style={{ flex: 1, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="skeleton" style={{ height: '1rem', width: i % 2 === 0 ? '30%' : '50%' }} />
            <div className="skeleton" style={{ height: '0.8rem', width: '20%' }} />
          </div>
        </div>
      ))}
    </div>
  );
};
