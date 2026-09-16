import React, { useState, useEffect } from 'react';
import { Plus, Pill, Filter } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { api } from '../services/api';
import { TherapyCard } from '../components/therapies/TherapyCard';

export const TherapiesPage = ({ onSelectPet, onNewTherapy, onEditTherapy }) => {
  const { activeClinic } = useClinic();
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState('true'); // 'all', 'true', 'false'

  const loadTherapies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeClinic?._id) params.clinicId = activeClinic._id;
      if (filterActive !== 'all') params.attiva = filterActive;

      const res = await api.therapies.getAll(params);
      if (res.success) {
        setTherapies(res.data);
      }
    } catch (err) {
      console.error('Errore caricamento terapie:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTherapies();
  }, [activeClinic, filterActive]);

  const handleDelete = async (id) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa prescrizione?')) return;
    try {
      const res = await api.therapies.delete(id);
      if (res.success) {
        setTherapies((prev) => prev.filter((t) => t._id !== id));
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
            Terapie & Prescrizioni Farmacologiche
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Monitoraggio farmaci, dosaggi e scadenze trattamenti
          </p>
        </div>

        <button
          id="btn-add-therapy-page"
          className="btn btn-primary"
          onClick={() => onNewTherapy()}
        >
          <Plus size={16} /> Prescrivi Farmaco
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className={`btn btn-sm ${filterActive === 'true' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterActive('true')}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          Terapie in Corso (Attive)
        </button>
        <button
          className={`btn btn-sm ${filterActive === 'false' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterActive('false')}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          Trattamenti Conclusi
        </button>
        <button
          className={`btn btn-sm ${filterActive === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterActive('all')}
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          Tutte ({therapies.length})
        </button>
      </div>

      {/* Therapies Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}>
          Caricamento terapie in corso...
        </div>
      ) : therapies.length === 0 ? (
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
              backgroundColor: 'var(--emerald-50)',
              color: 'var(--emerald-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Pill size={30} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--slate-800)' }}>
              Nessuna terapia registrata
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px', maxWidth: '380px' }}>
              Non ci sono terapie che soddisfano i criteri attuali.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => onNewTherapy()}>
            <Plus size={16} /> Prescrivi Farmaco
          </button>
        </div>
      ) : (
        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {therapies.map((therapy) => (
            <TherapyCard
              key={therapy._id}
              therapy={therapy}
              onSelectPet={onSelectPet}
              onEdit={onEditTherapy}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
