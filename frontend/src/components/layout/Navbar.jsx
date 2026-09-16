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
          <Stethoscope size={20} strokeWidth={2.4} />
        </div>
        <div className="brand-text">
          <h1>VetClinic<span className="brand-pro"> Pro</span></h1>
          <span className="brand-subtitle">Gestionale Medico</span>
        </div>
      </div>

      <div className="topbar-actions">
        <ClinicSwitcher onOpenNewClinic={onOpenNewClinic} />

        <div className="topbar-user">
          <div
            className="topbar-user-profile"
            title={`Dott. ${user?.nome} ${user?.cognome} (Albo: ${user?.codiceAlbo || 'N/D'})`}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.nome}
                className="topbar-avatar"
              />
            ) : (
              <div className="topbar-avatar-placeholder">
                <UserIcon size={16} />
              </div>
            )}
            <div className="topbar-user-details">
              <div className="topbar-user-name">
                Dott. {user?.nome} {user?.cognome}
              </div>
              <div className="topbar-user-role">
                {user?.codiceAlbo ? `Albo ${user.codiceAlbo}` : 'Veterinario'}
              </div>
            </div>
          </div>

          <button
            id="btn-logout"
            className="btn btn-icon btn-secondary topbar-logout-btn"
            title="Disconnetti"
            onClick={logout}
          >
            <LogOut size={16} color="var(--rose-500)" />
          </button>
        </div>
      </div>
    </header>
  );
};
