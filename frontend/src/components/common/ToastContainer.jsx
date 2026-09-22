import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastContext } from '../../context/ToastContext';

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    accentColor: '#10b981',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    titleColor: '#065f46',
    defaultTitle: 'Operazione Riuscita'
  },
  error: {
    icon: AlertCircle,
    accentColor: '#ef4444',
    bgLight: '#fef2f2',
    borderColor: '#fecaca',
    titleColor: '#991b1b',
    defaultTitle: 'Errore'
  },
  warning: {
    icon: AlertTriangle,
    accentColor: '#f59e0b',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    titleColor: '#92400e',
    defaultTitle: 'Attenzione'
  },
  info: {
    icon: Info,
    accentColor: '#0ea5e9',
    bgLight: '#f0f9ff',
    borderColor: '#bae6fd',
    titleColor: '#075985',
    defaultTitle: 'Notifica'
  }
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      role="region"
      aria-live="polite"
      aria-label="Notifiche di sistema"
    >
      {toasts.map((toast) => {
        const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
        const IconComponent = config.icon;
        const title = toast.title || config.defaultTitle;

        return (
          <div
            key={toast.id}
            className={`toast-item toast-item-${toast.type}`}
            style={{
              '--toast-accent': config.accentColor,
              '--toast-bg': config.bgLight,
              '--toast-border': config.borderColor,
              '--toast-title': config.titleColor,
              '--toast-duration': `${toast.duration}ms`
            }}
          >
            <div className="toast-icon-wrapper">
              <IconComponent size={20} color={config.accentColor} strokeWidth={2.5} />
            </div>

            <div className="toast-content">
              {title && <div className="toast-title">{title}</div>}
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>

            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Chiudi notifica"
            >
              <X size={16} />
            </button>

            {toast.duration > 0 && (
              <div
                className="toast-progress-bar"
                style={{
                  animationDuration: `${toast.duration}ms`
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
