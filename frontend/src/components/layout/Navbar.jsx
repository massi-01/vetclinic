import React from 'react';
import { Stethoscope, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ClinicSwitcher } from './ClinicSwitcher';

export const Navbar = ({ onOpenNewClinic }) => {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">
          <Stethoscope size={22} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <h1>VetClinic Pro</h1>
          <span>Gestionale Medico</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ClinicSwitcher onOpenNewClinic={onOpenNewClinic} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '0.75rem' }}>
          <div
            title={`Dott. ${user?.nome} ${user?.cognome} (Albo: ${user?.codiceAlbo || 'N/D'})`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'default'
            }}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.nome}
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-light)' }}
              />
            ) : (
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--slate-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--slate-600)'
                }}
              >
                <UserIcon size={18} />
              </div>
            )}
            <div style={{ display: 'none' }} className="d-md-block">
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--slate-800)', lineHeight: 1.1 }}>
                Dott. {user?.nome} {user?.cognome}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>
                {user?.codiceAlbo ? `Albo ${user.codiceAlbo}` : 'Veterinario'}
              </div>
            </div>
          </div>

          <button
            id="btn-logout"
            className="btn btn-icon btn-secondary"
            title="Disconnetti"
            onClick={logout}
            style={{ padding: '0.45rem', borderRadius: 'var(--radius-md)' }}
          >
            <LogOut size={16} color="var(--rose-500)" />
          </button>
        </div>
      </div>
    </header>
  );
};
