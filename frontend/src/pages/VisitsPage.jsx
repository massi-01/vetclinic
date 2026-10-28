import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Filter, ClipboardList, UserCheck } from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { VisitCard } from '../components/visits/VisitCard';
import { VisitReportModal } from '../components/visits/VisitReportModal';
import { SkeletonGrid } from '../components/common/SkeletonLoaders';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { CustomSelect } from '../components/common/CustomSelect';

export const VisitsPage = ({ onSelectPet, onNewVisit, onEditVisit, refreshTrigger }) => {
  const { activeClinic } = useClinic();
  const { user } = useAuth();
  const toast = useToast();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedVet, setSelectedVet] = useState('');
  const [reportVisit, setReportVisit] = useState(null);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeClinic?._id) params.clinicId = activeClinic._id;
      if (selectedDate) params.data = selectedDate;
      if (selectedVet) params.veterinarioId = selectedVet;

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
  }, [activeClinic, selectedDate, selectedVet, refreshTrigger]);

  const handleDeleteClick = (id) => {
    const target = visits.find((v) => v._id === id);
    setVisitToDelete(target || { _id: id });
  };

  const handleConfirmDelete = async () => {
    if (!visitToDelete?._id) return;
    try {
      setIsDeleting(true);
      const res = await api.visits.delete(visitToDelete._id);
      if (res.success) {
        setVisits((prev) => prev.filter((v) => v._id !== visitToDelete._id));
        toast.success('Referto di visita clinica eliminato');
        setVisitToDelete(null);
      }
    } catch (err) {
      toast.error(err.message || 'Errore durante l\'eliminazione della visita');
    } finally {
      setIsDeleting(false);
    }
  };

  // Elenco veterinari per filtro
  const clinicVets = activeClinic?.veterinari || [];
  const allVets = [...clinicVets];
  if (user && !allVets.some((v) => (v._id || v) === user._id)) {
    allVets.unshift(user);
  }
  const vetFilterOptions = [
    { value: '', label: 'Tutti i Veterinari' },
    ...allVets.map((v) => ({
      value: v._id || v,
      label: `Dr. ${v.nome || ''} ${v.cognome || ''}`.trim() || 'Veterinario',
      sublabel: v.codiceAlbo ? `Albo: ${v.codiceAlbo}` : ''
    }))
  ];

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
        {/* Filtro Data */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <Calendar size={16} color="var(--slate-400)" />
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--slate-700)' }}>Data:</span>
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

        {/* Filtro Veterinario Esecutore */}
        <div style={{ minWidth: '220px', maxWidth: '320px' }}>
          <CustomSelect
            id="filter-visit-vet"
            name="selectedVet"
            value={selectedVet}
            onChange={(e) => setSelectedVet(e.target.value)}
            options={vetFilterOptions}
            placeholder="Filtra per Medico..."
          />
        </div>
      </div>

      {/* Visits List */}
      {loading ? (
        <SkeletonGrid count={4} minWidth="320px" hasAvatar={false} lines={4} />
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
              Non sono state registrate visite per i filtri selezionati (data o veterinario).
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
              onDelete={handleDeleteClick}
              onPrint={(v) => setReportVisit(v)}
            />
          ))}
        </div>
      )}

      {/* Modale Referto Ufficiale & Stampa PDF */}
      <VisitReportModal
        isOpen={Boolean(reportVisit)}
        onClose={() => setReportVisit(null)}
        visit={reportVisit}
      />

      {/* Modale Conferma Eliminazione Visita */}
      <ConfirmModal
        isOpen={Boolean(visitToDelete)}
        onClose={() => setVisitToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Elimina Visita Clinica"
        message={
          visitToDelete ? (
            <span>
              Sei sicuro di voler eliminare la visita del{' '}
              <strong>{new Date(visitToDelete.data || Date.now()).toLocaleDateString('it-IT')}</strong>?
              <br />
              Questa operazione rimuoverà la visita dalla cartella clinica dell'animale.
            </span>
          ) : ''
        }
        confirmText="Elimina Visita"
        cancelText="Annulla"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default VisitsPage;
