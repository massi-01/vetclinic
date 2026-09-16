import React from 'react';
import {
  LayoutDashboard,
  Dog,
  ClipboardList,
  Pill,
  Users,
  Building2,
  PlusCircle,
  Stethoscope,
  MapPin,
  Phone
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const Sidebar = ({ currentTab, onTabChange, onNewVisit, onNewPet }) => {
  const { activeClinic, clinics } = useClinic();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pets', label: 'Pazienti (Animali)', icon: Dog },
    { id: 'visits', label: 'Visite Cliniche', icon: ClipboardList },
    { id: 'therapies', label: 'Terapie & Farmaci', icon: Pill },
    { id: 'owners', label: 'Anagrafica Clienti', icon: Users },
    { id: 'clinics', label: 'I Miei Ambulatori', icon: Building2 }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)'
          }}
        >
          <Stethoscope size={24} />
        </div>
        <div>
          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            VetClinic Pro
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Gestionale Veterinario
          </div>
        </div>
      </div>

      {/* Active Clinic Summary Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary-50) 0%, #ffffff 100%)',
          border: '1px solid rgba(13, 148, 136, 0.2)',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
          Sede Attiva
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--slate-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeClinic ? activeClinic.nome : 'Tutte le sedi (' + clinics.length + ')'}
        </div>
        {activeClinic && (
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> {activeClinic.indirizzo}, {activeClinic.citta}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> {activeClinic.telefono}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--slate-400)', textTransform: 'uppercase', paddingLeft: '0.5rem', marginBottom: '4px' }}>
          Menu Principale
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.7rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--slate-600)',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.875rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--slate-50)';
                  e.currentTarget.style.color = 'var(--slate-900)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--slate-600)';
                }
              }}
            >
              <Icon size={19} color={isActive ? '#ffffff' : 'var(--slate-400)'} strokeWidth={isActive ? 2.4 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button
          id="sidebar-btn-new-visit"
          className="btn btn-primary"
          onClick={onNewVisit}
          style={{ width: '100%' }}
        >
          <PlusCircle size={16} /> Registra Visita
        </button>
        <button
          id="sidebar-btn-new-pet"
          className="btn btn-secondary"
          onClick={onNewPet}
          style={{ width: '100%' }}
        >
          <Dog size={16} /> Nuovo Paziente
        </button>
      </div>
    </aside>
  );
};
