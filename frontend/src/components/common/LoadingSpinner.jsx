import React from 'react';

export const LoadingSpinner = ({
  size = 'md',
  message = '',
  fullHeight = false,
  color = 'var(--primary)'
}) => {
  const pixelSizes = {
    sm: 20,
    md: 36,
    lg: 52
  };

  const px = pixelSizes[size] || pixelSizes.md;

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '1.5rem',
        textAlign: 'center'
      }}
    >
      <svg
        className="spinner"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ color }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          opacity="0.25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          strokeDashoffset="15.7"
        />
      </svg>
      {message && (
        <span
          style={{
            fontSize: size === 'sm' ? '0.78rem' : '0.88rem',
            fontWeight: '600',
            color: 'var(--slate-500)',
            letterSpacing: '0.01em'
          }}
        >
          {message}
        </span>
      )}
    </div>
  );

  if (fullHeight) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};
