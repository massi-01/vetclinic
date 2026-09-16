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
      >
        <Plus size={16} /> Aggiungi Ambulatorio
      </button>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="clinic-switcher-button"
        className="btn btn-secondary"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.85rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          maxWidth: '240px',
          textAlign: 'left'
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: activeClinic?.coloreTema || 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}
        >
          <Building2 size={16} />
        </div>
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--slate-800)', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeClinic ? activeClinic.nome : 'Tutti gli Ambulatori'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
            {activeClinic ? `${activeClinic.citta}` : `${clinics.length} sedi gestite`}
          </div>
        </div>
        <ChevronDown size={14} color="var(--slate-400)" />
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
