import React, { useState } from 'react';
import {
  FileQuestion,
  ShieldAlert,
  ServerCrash,
  WifiOff,
  Home,
  RefreshCw,
  Building2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Dog
} from 'lucide-react';

const ERROR_CONFIGS = {
  '404': {
    badge: '404 • Risorsa Non Trovata',
    badgeClass: 'status-404',
    icon: FileQuestion,
    iconColor: '#3b82f6',
    iconBg: '#eff6ff',
    title: 'Pagina o Cartella Non Trovata',
    description:
      'La sezione, il paziente o il documento clinico richiesto non è presente a sistema, oppure l\'indirizzo specificato non è corretto.',
    primaryAction: { label: 'Torna alla Dashboard', icon: Home, actionType: 'home' },
    secondaryAction: { label: 'Vai ai Pazienti', icon: Dog, actionType: 'pets' }
  },
  '403': {
    badge: '403 • Accesso Negato',
    badgeClass: 'status-403',
    icon: ShieldAlert,
    iconColor: '#ef4444',
    iconBg: '#fef2f2',
    title: 'Permessi Insufficienti',
    description:
      'Non hai i privilegi per accedere a questa risorsa. In base ai protocolli di sicurezza e all\'isolamento clinico (BOLA/IDOR), questa cartella o azione è riservata ad altri ambulatori o al Direttore Sanitario.',
    primaryAction: { label: 'Cambia Ambulatorio', icon: Building2, actionType: 'clinics' },
    secondaryAction: { label: 'Torna alla Dashboard', icon: Home, actionType: 'home' }
  },
  '500': {
    badge: '500 • Errore del Server',
    badgeClass: 'status-500',
    icon: ServerCrash,
    iconColor: '#f59e0b',
    iconBg: '#fffbeb',
    title: 'Anomalia di Sistema',
    description:
      'Si è verificato un errore imprevisto durante l\'elaborazione della richiesta. Il database e i servizi sono protetti e nessun dato clinico è andato perduto.',
    primaryAction: { label: 'Ricarica e Riprova', icon: RefreshCw, actionType: 'reload' },
    secondaryAction: { label: 'Torna alla Dashboard', icon: Home, actionType: 'home' }
  },
  '503': {
    badge: '503 • Servizio Non Raggiungibile',
    badgeClass: 'status-offline',
    icon: WifiOff,
    iconColor: '#8b5cf6',
    iconBg: '#f5f3ff',
    title: 'Connessione Assente o Server Offline',
    description:
      'Il client non riesce a comunicare con il server VetClinic. Verifica la connessione a Internet della tua clinica o riprova tra qualche istante.',
    primaryAction: { label: 'Riprova Connessione', icon: RefreshCw, actionType: 'reload' },
    secondaryAction: { label: 'Torna alla Dashboard', icon: Home, actionType: 'home' }
  },
  'offline': {
    badge: 'Offline • Nessuna Rete',
    badgeClass: 'status-offline',
    icon: WifiOff,
    iconColor: '#8b5cf6',
    iconBg: '#f5f3ff',
    title: 'Connessione Internet Assente',
    description:
      'Sembra che la rete sia disconnessa. Le funzionalità del gestionale riprenderanno automaticamente appena la connessione tornerà attiva.',
    primaryAction: { label: 'Verifica Connessione', icon: RefreshCw, actionType: 'reload' },
    secondaryAction: { label: 'Torna alla Dashboard', icon: Home, actionType: 'home' }
  }
};

export const ErrorPage = ({
  code = '404',
  title = null,
  description = null,
  technicalDetails = null,
  onNavigateTab = null,
  onRetry = null,
  showSwitcher = false
}) => {
  const [currentCode, setCurrentCode] = useState(String(code));
  const [showDebug, setShowDebug] = useState(false);

  const config = ERROR_CONFIGS[currentCode] || ERROR_CONFIGS['404'];
  const IconComponent = config.icon;

  const handleAction = (actionType) => {
    if (actionType === 'reload') {
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    } else if (actionType === 'home') {
      if (onNavigateTab) {
        onNavigateTab('dashboard');
      } else {
        window.location.href = '/';
      }
    } else if (actionType === 'clinics') {
      if (onNavigateTab) {
        onNavigateTab('clinics');
      } else {
        window.location.href = '/';
      }
    } else if (actionType === 'pets') {
      if (onNavigateTab) {
        onNavigateTab('pets');
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="error-page-wrapper">
      <div className="error-card">
        {/* Error Badge */}
        <div className={`error-badge-pill ${config.badgeClass}`}>
          <span>{config.badge}</span>
        </div>

        {/* Big Icon */}
        <div
          className="error-icon-circle"
          style={{ backgroundColor: config.iconBg }}
        >
          <IconComponent size={42} color={config.iconColor} strokeWidth={2.2} />
        </div>

        {/* Title & Description */}
        <h1 className="error-title">{title || config.title}</h1>
        <p className="error-description">{description || config.description}</p>

        {/* Actions */}
        <div className="error-actions">
          {config.primaryAction && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleAction(config.primaryAction.actionType)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem' }}
            >
              <config.primaryAction.icon size={18} />
              <span>{config.primaryAction.label}</span>
            </button>
          )}

          {config.secondaryAction && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleAction(config.secondaryAction.actionType)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.4rem' }}
            >
              <config.secondaryAction.icon size={18} />
              <span>{config.secondaryAction.label}</span>
            </button>
          )}
        </div>

        {/* Dettagli Tecnici / Stack Trace (se presenti) */}
        {technicalDetails && (
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate-500)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <span>{showDebug ? 'Nascondi dettagli tecnici' : 'Mostra dettagli diagnostici'}</span>
              {showDebug ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDebug && (
              <div className="error-debug-box">
                {typeof technicalDetails === 'string'
                  ? technicalDetails
                  : JSON.stringify(technicalDetails, null, 2)}
              </div>
            )}
          </div>
        )}

        {/* Barra di anteprima selettore codici errore (in DEV o se abilitato) */}
        {(showSwitcher || import.meta.env.DEV) && (
          <div
            style={{
              marginTop: '2.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px dashed var(--slate-200)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🔧 Anteprima Codici di Errore (Dev Tools)
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['404', '403', '500', '503', 'offline'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrentCode(c)}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    borderRadius: '6px',
                    border: '1px solid',
                    cursor: 'pointer',
                    borderColor: currentCode === c ? 'var(--primary)' : 'var(--slate-200)',
                    background: currentCode === c ? 'var(--primary-50)' : '#ffffff',
                    color: currentCode === c ? 'var(--primary)' : 'var(--slate-600)'
                  }}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
