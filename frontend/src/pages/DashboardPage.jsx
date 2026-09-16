import React, { useState, useEffect } from 'react';
import {
  Dog,
  Users,
  Calendar,
  Pill,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Building2,
  Stethoscope,
  HeartPulse,
  Syringe,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useClinic } from '../context/ClinicContext';
import { api } from '../services/api';

export const DashboardPage = ({
  onNavigate,
  onNewVisit,
  onNewPet,
  onNewOwner,
  onNewTherapy,
  onNewAppointment,
  onNewVaccination,
  onSelectPet
}) => {
  const { user } = useAuth();
  const { activeClinic, clinics } = useClinic();
  const [stats, setStats] = useState({
    totalePazienti: 0,
    totaleProprietari: 0,
    visiteOggi: 0,
    terapieAttive: 0,
    appuntamentiOggiCount: 0,
    vacciniWarningCount: 0,
    ultimeVisite: [],
    terapieInScadenza: [],
    vacciniInScadenza: [],
    appuntamentiOggi: []
  });
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await api.stats.getDashboard(activeClinic?._id);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Errore caricamento statistiche dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [activeClinic]);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d9488 0%, #0284c7 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 1.75rem',
          color: '#ffffff',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              Area Clinica Veterinaria
            </span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
              Bentornato, Dott. {user?.nome} {user?.cognome}
            </h1>
            <p style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '2px' }}>
              {activeClinic
                ? `Stai gestendo: ${activeClinic.nome} (${activeClinic.citta})`
                : clinics.length > 0
                ? `Vista globale su tutti gli ambulatori (${clinics.length} sedi collegate)`
                : 'Nessun ambulatorio attualmente collegato al tuo profilo'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center', flexWrap: 'wrap' }}>
            {clinics.length > 0 ? (
              <>
                <button
                  id="dashboard-btn-new-appointment"
                  className="btn"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', fontWeight: '700', border: '1px solid rgba(255, 255, 255, 0.4)' }}
                  onClick={() => onNewAppointment ? onNewAppointment() : onNavigate('agenda')}
                >
                  <Calendar size={16} /> Fissa Appuntamento
                </button>
                <button
                  id="dashboard-btn-new-visit"
                  className="btn"
                  style={{ backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: '700', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  onClick={() => onNewVisit()}
                >
                  <PlusCircle size={16} /> Nuova Visita
                </button>
              </>
            ) : (
              <button
                id="dashboard-btn-add-clinic"
                className="btn"
                style={{ backgroundColor: '#ffffff', color: '#0d9488', fontWeight: '800', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                onClick={() => onNavigate('clinics')}
              >
                <Building2 size={16} /> Collega Ambulatorio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Warning se nessun ambulatorio è collegato */}
      {clinics.length === 0 && (
        <div
          id="warning-no-clinic-banner"
          style={{
            backgroundColor: '#fffbeb',
            border: '1.5px solid #f59e0b',
            borderLeft: '6px solid #d97706',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={26} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#92400e', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Non hai ancora collegato un ambulatorio
              </div>
              <div style={{ fontSize: '0.875rem', color: '#b45309', marginTop: '3px', lineHeight: 1.45 }}>
                Per poter inserire pazienti, cartelle cliniche, registrare visite ed appuntamenti, configura o collega il tuo primo ambulatorio veterinario.
              </div>
            </div>
          </div>
          <button
            id="btn-link-clinic-warning"
            className="btn btn-primary"
            style={{
              backgroundColor: '#d97706',
              borderColor: '#b45309',
              color: '#ffffff',
              fontWeight: '800',
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 3px 10px rgba(217, 119, 6, 0.3)'
            }}
            onClick={() => onNavigate('clinics')}
          >
            <Building2 size={18} /> Configura Ambulatorio
          </button>
        </div>
      )}

      {/* Urgent Vaccine Recall Alert Banner if needed */}
      {stats.vacciniInScadenza && stats.vacciniInScadenza.length > 0 && (
        <div
          style={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderLeft: '5px solid #f59e0b',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fde68a', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#92400e', fontSize: '0.95rem' }}>
                {stats.vacciniWarningCount} Richiami Vaccinali Scaduti o In Scadenza Imminente
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '2px' }}>
                Alcuni pazienti hanno il ciclo vaccinale da rinnovare o da programmare nei prossimi giorni.
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-secondary"
            style={{ backgroundColor: '#ffffff', borderColor: '#fde68a', color: '#92400e', fontWeight: '700' }}
            onClick={() => onNewVaccination && onNewVaccination()}
          >
            <Syringe size={14} /> + Registra Vaccino
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div
          className="stat-card card-hoverable"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('pets')}
        >
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Dog size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totalePazienti}</div>
            <div className="stat-label">Pazienti Registrati</div>
          </div>
        </div>

        <div
          className="stat-card card-hoverable"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('agenda')}
        >
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.appuntamentiOggiCount || stats.appuntamentiOggi?.length || 0}</div>
            <div className="stat-label">Appuntamenti Oggi</div>
          </div>
        </div>

        <div
          className="stat-card card-hoverable"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('owners')}
        >
          <div className="stat-icon" style={{ backgroundColor: 'var(--blue-50)', color: 'var(--blue-500)' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.totaleProprietari}</div>
            <div className="stat-label">Proprietari / Clienti</div>
          </div>
        </div>

        <div
          className="stat-card card-hoverable"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('visits')}
        >
          <div className="stat-icon" style={{ backgroundColor: 'var(--purple-50)', color: 'var(--purple-500)' }}>
            <Stethoscope size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.visiteOggi}</div>
            <div className="stat-label">Visite Eseguite Oggi</div>
          </div>
        </div>

        <div
          className="stat-card card-hoverable"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('therapies')}
        >
          <div className="stat-icon" style={{ backgroundColor: 'var(--emerald-50)', color: 'var(--emerald-500)' }}>
            <Pill size={24} />
          </div>
          <div>
            <div className="stat-value">{stats.terapieAttive}</div>
            <div className="stat-label">Terapie Attive</div>
          </div>
        </div>

        <div
          className="stat-card card-hoverable"
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon" style={{ backgroundColor: stats.vacciniWarningCount > 0 ? 'var(--rose-50)' : 'var(--emerald-50)', color: stats.vacciniWarningCount > 0 ? 'var(--rose-500)' : 'var(--emerald-500)' }}>
            <Syringe size={24} />
          </div>
          <div>
            <div className="stat-value" style={{ color: stats.vacciniWarningCount > 0 ? 'var(--rose-600)' : 'var(--emerald-600)' }}>
              {stats.vacciniWarningCount}
            </div>
            <div className="stat-label">Avvisi Vaccinali</div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--slate-800)' }}>
          Azioni Rapide di Gestione:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button id="btn-quick-appointment" className="btn btn-sm btn-secondary" onClick={() => onNewAppointment ? onNewAppointment() : onNavigate('agenda')}>
            <Calendar size={14} /> + Appuntamento
          </button>
          <button id="btn-quick-vaccine" className="btn btn-sm btn-secondary" onClick={() => onNewVaccination && onNewVaccination()}>
            <Syringe size={14} /> + Vaccino
          </button>
          <button id="btn-quick-pet" className="btn btn-sm btn-secondary" onClick={() => onNewPet()}>
            <Dog size={14} /> + Paziente
          </button>
          <button id="btn-quick-owner" className="btn btn-sm btn-secondary" onClick={() => onNewOwner()}>
            <Users size={14} /> + Proprietario
          </button>
          <button id="btn-quick-therapy" className="btn btn-sm btn-secondary" onClick={() => onNewTherapy()}>
            <Pill size={14} /> + Farmaco
          </button>
        </div>
      </div>

      {/* Multi-Section Dashboard Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Today's Appointments Agenda Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                Agenda di Oggi
              </h2>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => onNavigate('agenda')}
              style={{ fontSize: '0.75rem' }}
            >
              Apri Agenda Completa <ArrowRight size={12} />
            </button>
          </div>

          {(!stats.appuntamentiOggi || stats.appuntamentiOggi.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
              Nessun appuntamento fissato per la giornata odierna
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {stats.appuntamentiOggi.map((apt) => {
                const pet = apt.animaleId;
                return (
                  <div
                    key={apt._id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--slate-50)',
                      borderLeft: '4px solid var(--primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => onNavigate('agenda')}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: '700', color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                          {pet?.nome || 'Paziente'}
                        </span>
                        <span className="badge badge-status-completed" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {apt.stato}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                        {apt.motivo}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary)' }}>
                      Ore {apt.oraInizio || (apt.dataOra ? new Date(apt.dataOra).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expiring / Expired Vaccines Widget */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Syringe size={18} color="var(--rose-500)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                Richiami Vaccinali da Effettuare
              </h2>
            </div>
          </div>

          {(!stats.vacciniInScadenza || stats.vacciniInScadenza.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
              Tutti i richiami vaccinali sono regolari
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {stats.vacciniInScadenza.map((vac) => {
                const isScaduto = vac.statoWarning === 'SCADUTO';
                const pet = vac.animaleId;
                return (
                  <div
                    key={vac._id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isScaduto ? 'var(--rose-50)' : 'var(--amber-50)',
                      borderLeft: `4px solid ${isScaduto ? 'var(--rose-500)' : 'var(--amber-500)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: pet ? 'pointer' : 'default'
                    }}
                    onClick={() => pet && onSelectPet && onSelectPet(pet)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                          {pet?.nome || 'Paziente'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          ({pet?.specie})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: isScaduto ? 'var(--rose-700)' : 'var(--amber-800)', fontWeight: '600', marginTop: '2px' }}>
                        {vac.nomeVaccino}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          color: isScaduto ? 'var(--rose-600)' : 'var(--amber-700)',
                          border: `1px solid ${isScaduto ? 'var(--rose-200)' : 'var(--amber-200)'}`
                        }}
                      >
                        {isScaduto ? `⚠️ Scaduto da ${vac.scadutoDaGiorni || Math.abs(vac.giorniAlRichiamo)} gg` : `⏳ Tra ${vac.giorniAlRichiamo} gg`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Therapies */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Pill size={18} color="var(--emerald-500)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                Terapie Farmacologiche Attive
              </h2>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => onNavigate('therapies')}
              style={{ fontSize: '0.75rem' }}
            >
              Tutte le terapie <ArrowRight size={12} />
            </button>
          </div>

          {stats.terapieInScadenza.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
              Nessuna terapia attiva registrata
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {stats.terapieInScadenza.map((t) => (
                <div
                  key={t._id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    borderLeft: '3px solid var(--emerald-500)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => t.animaleId && onSelectPet && onSelectPet(t.animaleId)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                        {t.nomeFarmaco}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        ({t.dosaggio})
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                      Per: <strong>{t.animaleId?.nome || 'Paziente'}</strong> • {t.posologia}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-status-active" style={{ fontSize: '0.7rem' }}>
                      In corso
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
