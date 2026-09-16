import React, { useState } from 'react';
import { Building2, Plus, Phone, Mail, MapPin, Clock, ShieldCheck, Edit2, CheckCircle2 } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';

export const ClinicsPage = ({ onNewClinic, onEditClinic }) => {
  const { clinics, activeClinic, switchClinic } = useClinic();

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            I Miei Ambulatori & Cliniche
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Gestisci le sedi operative, gli orari di apertura e i presidi
          </p>
        </div>

        <button
          id="btn-add-clinic-page"
          className="btn btn-primary"
          onClick={() => onNewClinic()}
        >
          <Plus size={16} /> Nuova Sede / Ambulatorio
        </button>
      </div>

      {/* Clinics List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {clinics.map((clinic) => {
          const isActive = activeClinic?._id === clinic._id;
          return (
            <div
              key={clinic._id}
              className="card"
              style={{
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: clinic.coloreTema || 'var(--primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                        {clinic.nome}
                      </h2>
                      {isActive && (
                        <span className="badge badge-status-active" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} /> Sede Correntemente Attiva
                        </span>
                      )}
                      {clinic.prontoSoccorso24h && (
                        <span className="badge" style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-500)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          Pronto Soccorso 24h
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <MapPin size={14} /> {clinic.indirizzo}, {clinic.cap ? `${clinic.cap} ` : ''}{clinic.citta}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {onEditClinic && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => onEditClinic(clinic)}
                    >
                      <Edit2 size={14} /> Modifica
                    </button>
                  )}
                  {!isActive && (
                    <button
                      id={`btn-select-clinic-${clinic._id}`}
                      className="btn btn-sm btn-primary"
                      onClick={() => switchClinic(clinic._id)}
                    >
                      Seleziona Sede
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '0.85rem',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.85rem'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>
                    RECAPITI
                  </div>
                  <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--slate-700)' }}>
                      <Phone size={13} color="var(--primary)" /> <strong>{clinic.telefono}</strong>
                    </div>
                    {clinic.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--slate-600)' }}>
                        <Mail size={13} color="var(--slate-400)" /> {clinic.email}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>
                    ORARI DI RICEVIMENTO
                  </div>
                  <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--slate-700)' }}>
                    <Clock size={13} color="var(--primary)" /> {clinic.orariApertura || 'Orario continuato'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>
                    DATI FISCALI
                  </div>
                  <div style={{ marginTop: '4px', color: 'var(--slate-600)' }}>
                    {clinic.partitaIva && <div>P.IVA: <code>{clinic.partitaIva}</code></div>}
                    {clinic.codiceFiscale && <div>C.F.: <code>{clinic.codiceFiscale}</code></div>}
                    {!clinic.partitaIva && !clinic.codiceFiscale && <div>Non specificati</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
