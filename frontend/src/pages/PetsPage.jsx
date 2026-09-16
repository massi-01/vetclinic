import React, { useState, useEffect } from 'react';
import { Search, Plus, Dog, Filter, AlertCircle } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { api } from '../services/api';
import { PetCard } from '../components/pets/PetCard';

export const PetsPage = ({ onSelectPet, onNewVisit, onNewPet, filterByOwnerId = null }) => {
  const { activeClinic } = useClinic();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecie, setSelectedSpecie] = useState('');

  const loadPets = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeClinic?._id) params.clinicId = activeClinic._id;
      if (filterByOwnerId) params.proprietarioId = filterByOwnerId;
      if (search.trim()) params.search = search.trim();
      if (selectedSpecie) params.specie = selectedSpecie;

      const res = await api.pets.getAll(params);
      if (res.success) {
        setPets(res.data);
      }
    } catch (err) {
      console.error('Errore caricamento pazienti:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [activeClinic, selectedSpecie, filterByOwnerId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPets();
  };

  const speciesOptions = [
    { label: 'Tutti', value: '' },
    { label: 'Cani 🐶', value: 'Cane' },
    { label: 'Gatti 🐱', value: 'Gatto' },
    { label: 'Conigli 🐰', value: 'Coniglio' },
    { label: 'Volatili 🦜', value: 'Volatile' },
    { label: 'Rettili 🦎', value: 'Rettile' }
  ];

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Pazienti & Cartelle Cliniche
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            {pets.length} animali registrati {activeClinic ? `in ${activeClinic.nome}` : 'nelle sedi attive'}
          </p>
        </div>

        <button
          id="btn-add-pet-page"
          className="btn btn-primary"
          onClick={() => onNewPet()}
        >
          <Plus size={16} /> Nuovo Paziente
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ width: '100%' }}>
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              id="search-pets-input"
              type="text"
              className="search-input"
              placeholder="Cerca per nome animale, razza o numero di microchip (premi Invio)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>

        {/* Species Filter Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {speciesOptions.map((opt) => {
            const isActive = selectedSpecie === opt.value;
            return (
              <button
                key={opt.value}
                id={`filter-specie-${opt.value || 'all'}`}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedSpecie(opt.value)}
                style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap' }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Patients Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}>
          Ricerca pazienti in corso...
        </div>
      ) : pets.length === 0 ? (
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
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--slate-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}
          >
            🐾
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--slate-800)' }}>
              Nessun paziente trovato
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px', maxWidth: '380px' }}>
              Non ci sono schede animali corrispondenti ai filtri attuali. Prova a modificare la ricerca o registra un nuovo paziente.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => onNewPet()}>
            <Plus size={16} /> Registra Primo Paziente
          </button>
        </div>
      ) : (
        <div className="grid-responsive">
          {pets.map((pet) => (
            <PetCard
              key={pet._id}
              pet={pet}
              onSelect={onSelectPet}
              onNewVisit={onNewVisit}
            />
          ))}
        </div>
      )}
    </div>
  );
};
