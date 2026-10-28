import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Conferma Operazione',
  message = 'Sei sicuro di voler procedere? L\'operazione non potrà essere annullata.',
  confirmText = 'Elimina',
  cancelText = 'Annulla',
  type = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false
}) => {
  const [internalLoading, setInternalLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
    }
  };

  const isBusy = isLoading || internalLoading;

  const typeConfig = {
    danger: {
      icon: <AlertTriangle size={24} />,
      iconBg: 'rgba(239, 68, 68, 0.12)',
      iconColor: '#ef4444',
      confirmClass: 'btn btn-danger',
      confirmStyle: { background: '#ef4444', borderColor: '#dc2626', color: '#fff' }
    },
    warning: {
      icon: <AlertTriangle size={24} />,
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconColor: '#f59e0b',
      confirmClass: 'btn btn-primary',
      confirmStyle: { background: '#f59e0b', borderColor: '#d97706', color: '#fff' }
    },
    info: {
      icon: <Info size={24} />,
      iconBg: 'rgba(59, 130, 246, 0.12)',
      iconColor: '#3b82f6',
      confirmClass: 'btn btn-primary',
      confirmStyle: {}
    }
  }[type] || typeConfig.danger;

  return (
    <div className="modal-overlay" onClick={isBusy ? undefined : onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '1.5rem', borderRadius: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: typeConfig.iconBg,
              color: typeConfig.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {typeConfig.icon}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
              {title}
            </h3>
            <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.92rem', lineHeight: '1.45' }}>
              {message}
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isBusy}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: isBusy ? 'not-allowed' : 'pointer',
              color: 'var(--text-muted, #94a3b8)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color, #e2e8f0)'
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isBusy}
            style={{ minWidth: '90px' }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={typeConfig.confirmClass}
            style={{ ...typeConfig.confirmStyle, minWidth: '100px' }}
            onClick={handleConfirm}
            disabled={isBusy}
          >
            {isBusy ? 'Attendi...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmModal;
