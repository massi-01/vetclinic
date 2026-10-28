import React, { useState, useEffect } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { OwnerCard } from '../components/owners/OwnerCard';
import { SkeletonGrid } from '../components/common/SkeletonLoaders';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const OwnersPage = ({ onAddPetForOwner, onNewOwner, onEditOwner, onFilterPetsByOwner, refreshTrigger }) => {
  const { activeClinic } = useClinic();
  const toast = useToast();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeClinic?._id) params.clinicId = activeClinic._id;
      if (search.trim()) params.search = search.trim();

      const res = await api.owners.getAll(params);
      if (res.success) {
        setOwners(res.data);
      }
    } catch (err) {
      console.error('Errore caricamento proprietari:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, [activeClinic, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOwners();
  };

  const handleDeleteClick = (id) => {
    const owner = owners.find((o) => o._id === id);
    setOwnerToDelete(owner || { _id: id });
  };

  const handleConfirmDelete = async () => {
    if (!ownerToDelete?._id) return;
    try {
      setIsDeleting(true);
      const res = await api.owners.delete(ownerToDelete._id);
      if (res.success) {
        setOwners((prev) => prev.filter((o) => o._id !== ownerToDelete._id));
        toast.success('Proprietario eliminato con successo');
        setOwnerToDelete(null);
      }
    } catch (err) {
      toast.error(err.message || 'Errore durante l\'eliminazione del proprietario');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            Anagrafica Clienti & Proprietari
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            {owners.length} clienti registrati {activeClinic ? `in ${activeClinic.nome}` : ''}
          </p>
        </div>

        <button
          id="btn-add-owner-page"
          className="btn btn-primary"
          onClick={() => onNewOwner()}
        >
          <Plus size={16} /> Nuovo Proprietario
        </button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit}>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            id="search-owners-input"
            type="text"
            className="search-input"
            placeholder="Cerca cliente per cognome, nome, recapito telefonico o codice fiscale..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </form>

      {/* Owners Grid */}
      {loading ? (
        <SkeletonGrid count={6} minWidth="300px" hasAvatar={false} lines={3} />
      ) : owners.length === 0 ? (
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
              backgroundColor: 'var(--blue-50)',
              color: 'var(--blue-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Users size={30} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--slate-800)' }}>
              Nessun proprietario trovato
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px', maxWidth: '380px' }}>
              Non sono presenti proprietari corrispondenti ai criteri di ricerca.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => onNewOwner()}>
            <Plus size={16} /> Registra Nuovo Proprietario
          </button>
        </div>
      ) : (
        <div className="grid-responsive">
          {owners.map((owner) => (
            <OwnerCard
              key={owner._id}
              owner={owner}
              onAddPet={onAddPetForOwner}
              onEdit={onEditOwner}
              onDelete={handleDeleteClick}
              onFilterPetsByOwner={onFilterPetsByOwner}
            />
          ))}
        </div>
      )}

      {/* Custom Confirm Modal for Owner Deletion */}
      <ConfirmModal
        isOpen={Boolean(ownerToDelete)}
        onClose={() => setOwnerToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Elimina Cliente"
        message={
          ownerToDelete ? (
            <span>
              Sei sicuro di voler eliminare l'anagrafica di{' '}
              <strong>{ownerToDelete.cognome} {ownerToDelete.nome}</strong>?
              <br />
              Se il cliente ha animali associati, l'eliminazione verrà bloccata per garantire l'integrità dei dati clinici.
            </span>
          ) : ''
        }
        confirmText="Elimina Cliente"
        cancelText="Annulla"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
