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
  HeartPulse
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
  onSelectPet
}) => {
  const { user } = useAuth();
  const { activeClinic, clinics } = useClinic();
  const [stats, setStats] = useState({
    totalePazienti: 0,
    totaleProprietari: 0,
    visiteOggi: 0,
    terapieAttive: 0,
    ultimeVisite: [],
    terapieInScadenza: []
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
                : `Vista globale su tutti gli ambulatori (${clinics.length} sedi collegate)`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center' }}>
            <button
              id="dashboard-btn-new-visit"
              className="btn"
              style={{ backgroundColor: '#ffffff', color: 'var(--primary)', fontWeight: '700', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              onClick={() => onNewVisit()}
            >
              <PlusCircle size={16} /> Nuova Visita
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
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
            <div className="stat-label">Pazienti (Animali)</div>
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
            <div className="stat-label">Clienti / Proprietari</div>
          </div>
        </div>

        <div
          className="stat-card card-hoverable"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('visits')}
        >
          <div className="stat-icon" style={{ backgroundColor: 'var(--purple-50)', color: 'var(--purple-500)' }}>
            <Calendar size={24} />
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
            <div className="stat-label">Terapie Farmacologiche</div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts (Particularly helpful on mobile) */}
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
          Azioni Rapide di Registrazione:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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

      {/* Two Column Layout for Recent Visits and Therapies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Visits */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HeartPulse size={18} color="var(--primary)" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--slate-900)' }}>
                Ultime Visite Cliniche
              </h2>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => onNavigate('visits')}
              style={{ fontSize: '0.75rem' }}
            >
              Tutte le visite <ArrowRight size={12} />
            </button>
          </div>

          {stats.ultimeVisite.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
              Nessuna visita registrata di recente
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {stats.ultimeVisite.map((v) => (
                <div
                  key={v._id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => v.animaleId && onSelectPet && onSelectPet(v.animaleId)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: '700', color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                        {v.animaleId?.nome || 'Paziente'}
                      </span>
                      <span className="badge badge-status-completed" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {v.tipoVisita}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                      {v.motivo}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                    <div>{new Date(v.data).toLocaleDateString('it-IT')}</div>
                    <div>Ore {v.ora}</div>
                  </div>
                </div>
              ))}
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
