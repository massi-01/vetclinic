import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Filter, ClipboardList } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { api } from '../services/api';
import { VisitCard } from '../components/visits/VisitCard';

export const VisitsPage = ({ onSelectPet, onNewVisit, onEditVisit }) => {
  const { activeClinic } = useClinic();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  const loadVisits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeClinic?._id) params.clinicId = activeClinic._id;
      if (selectedDate) params.data = selectedDate;

      const res = await api.visits.getAll(params);
      if (res.success) {
        setVisits(res.data);
      }
    } catch (err) {
      console.error('Errore caricamento visite:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, [activeClinic, selectedDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo referto di visita?')) return;
    try {
      const res = await api.visits.delete(id);
      if (res.success) {
        setVisits((prev) => prev.filter((v) => v._id !== id));
      }
    } catch (err) {
      alert('Errore durante l\'eliminazione: ' + err.message);
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Diario Visite Cliniche
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            {visits.length} visite registrate {activeClinic ? `per ${activeClinic.nome}` : ''}
          </p>
        </div>

        <button
          id="btn-add-visit-page"
          className="btn btn-primary"
          onClick={() => onNewVisit()}
        >
          <Plus size={16} /> Nuova Visita
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <Calendar size={16} color="var(--slate-400)" />
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--slate-700)' }}>Filtra per data:</span>
          <input
            id="filter-visit-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ border: 'none', fontSize: '0.85rem', color: 'var(--slate-800)', outline: 'none' }}
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              style={{ background: 'none', border: 'none', color: 'var(--slate-400)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '700' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Visits List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}>
          Caricamento visite in corso...
        </div>
      ) : visits.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--purple-50)',
              color: 'var(--purple-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ClipboardList size={30} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--slate-800)' }}>
              Nessuna visita clinica trovata
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px', maxWidth: '380px' }}>
              Non sono state registrate visite per la data selezionata o per questa sede.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => onNewVisit()}>
            <Plus size={16} /> Registra Visita Adesso
          </button>
        </div>
      ) : (
        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {visits.map((visit) => (
            <VisitCard
              key={visit._id}
              visit={visit}
              onSelectPet={onSelectPet}
              onEdit={onEditVisit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
