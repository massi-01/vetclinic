import React, { useState } from 'react';
import { Building2, ChevronDown, Check, Plus, Phone, MapPin, Clock } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const ClinicSwitcher = ({ onOpenNewClinic }) => {
  const { clinics, activeClinic, switchClinic } = useClinic();
  const [open, setOpen] = useState(false);

  if (!clinics || clinics.length === 0) {
    return (
      <button
        id="btn-add-first-clinic"
        className="btn btn-sm btn-secondary"
        onClick={onOpenNewClinic}
        style={{
          whiteSpace: 'nowrap',
          fontSize: '0.78rem',
          padding: '0.35rem 0.55rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          flexShrink: 1
        }}
      >
        <Plus size={15} style={{ flexShrink: 0 }} />
        <span>Sede</span>
      </button>
    );
  }

  return (
    <div className="clinic-switcher-wrapper">
      <button
        id="clinic-switcher-button"
        className="clinic-switcher-btn"
        onClick={() => setOpen(!open)}
      >
        <div
          className="clinic-switcher-icon"
          style={{ backgroundColor: activeClinic?.coloreTema || 'var(--primary)' }}
        >
          <Building2 size={15} />
        </div>
        <div className="clinic-switcher-info">
          <div className="clinic-switcher-name">
            {activeClinic ? activeClinic.nome : 'Tutti gli Ambulatori'}
          </div>
          <div className="clinic-switcher-city">
            {activeClinic ? `${activeClinic.citta}` : `${clinics.length} sedi`}
          </div>
        </div>
        <ChevronDown size={14} color="var(--slate-400)" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              right: 0,
              width: '280px',
              maxWidth: 'min(280px, calc(100vw - 20px))',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem',
              zIndex: 50,
              animation: 'scaleUp 0.15s ease-out'
            }}
          >
            <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', color: 'var(--slate-400)', textTransform: 'uppercase' }}>
              I tuoi Ambulatori
            </div>

            {clinics.map((clinic) => {
              const isSelected = activeClinic?._id === clinic._id;
              return (
                <div
                  key={clinic._id}
                  id={`clinic-item-${clinic._id}`}
                  onClick={() => {
                    switchClinic(clinic._id);
                    setOpen(false);
                  }}
                  style={{
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'transparent',
                    marginBottom: '2px',
                    transition: 'background var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--slate-50)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: clinic.coloreTema || 'var(--primary)'
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-800)' }}>
                        {clinic.nome}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={11} /> {clinic.citta} ({clinic.indirizzo})
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={16} color="var(--primary)" />}
                </div>
              );
            })}

            <div
              onClick={() => {
                switchClinic(null);
                setOpen(false);
              }}
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: !activeClinic ? 'var(--primary-subtle)' : 'transparent',
                borderTop: '1px solid var(--slate-100)',
                marginTop: '4px'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-700)' }}>
                Visualizza tutte le sedi
              </div>
              {!activeClinic && <Check size={16} color="var(--primary)" />}
            </div>

            {onOpenNewClinic && (
              <button
                id="btn-add-clinic-dropdown"
                className="btn btn-sm btn-secondary"
                style={{ width: '100%', marginTop: '6px' }}
                onClick={() => {
                  setOpen(false);
                  onOpenNewClinic();
                }}
              >
                <Plus size={14} /> Nuova Sede / Ambulatorio
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
