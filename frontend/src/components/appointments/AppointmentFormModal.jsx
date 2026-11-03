import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Heart, CheckCircle2, AlertCircle, Stethoscope, Building2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CustomSelect } from '../common/CustomSelect';

const unwrapVal = (e) => {
  if (e === null || e === undefined) return '';
  if (typeof e === 'object') {
    if ('value' in e && typeof e.value !== 'object') return e.value;
    if (e.target && 'value' in e.target) return e.target.value;
  }
  return e;
};

export const AppointmentFormModal = ({
  isOpen,
  onClose,
  onAppointmentSaved,
  defaultDate = null,
  defaultTime = null,
  defaultPet = null,
  initialData = null
}) => {
  const { activeClinic } = useClinic();
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    animaleId: '',
    proprietarioId: '',
    ambulatorioId: activeClinic?._id || '',
    veterinarioId: user?._id || '',
    data: todayStr,
    oraInizio: '09:00',
    durataMinuti: 30,
    tipoPrestazione: 'Visita Generale',
    motivo: 'Visita Generale',
    stato: 'Prenotato',
    note: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    if (!activeClinic?._id) return;
    try {
      setLoading(true);
      const params = { clinicId: activeClinic._id };
      const [petsRes, ownersRes] = await Promise.all([
        api.pets.getAll(params),
        api.owners.getAll(params)
      ]);
      const loadedPets = petsRes.success ? petsRes.data : [];
      const loadedOwners = ownersRes.success ? ownersRes.data : [];
      setPets(loadedPets);
      setOwners(loadedOwners);

      if (initialData) {
        const petId = initialData.animaleId?._id || initialData.animaleId;
        const matchingPet = loadedPets.find((p) => p._id === petId);
        const ownerId = matchingPet?.proprietarioId?._id || matchingPet?.proprietarioId || initialData.proprietarioId?._id || initialData.proprietarioId;
        if (ownerId) setSelectedOwnerId(ownerId);
      } else if (defaultPet) {
        const ownerId = defaultPet.proprietarioId?._id || defaultPet.proprietarioId;
        if (ownerId) setSelectedOwnerId(ownerId);
      } else if (loadedOwners.length > 0) {
        setSelectedOwnerId((prev) => {
          if (prev && loadedOwners.some((o) => o._id === prev)) return prev;
          const firstOwnerId = loadedOwners[0]._id;
          const firstOwnerPets = loadedPets.filter((p) => (p.proprietarioId?._id || p.proprietarioId)?.toString() === firstOwnerId.toString());
          if (firstOwnerPets.length > 0) {
            setFormData((f) => ({ ...f, animaleId: firstOwnerPets[0]._id, proprietarioId: firstOwnerId }));
          }
          return firstOwnerId;
        });
      }
    } catch (err) {
      console.error('Errore nel caricamento dati appuntamento:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();

      if (initialData) {
        setFormData({
          animaleId: initialData.animaleId?._id || initialData.animaleId || '',
          proprietarioId: initialData.proprietarioId?._id || initialData.proprietarioId || '',
          ambulatorioId: activeClinic?._id || initialData.ambulatorioId?._id || initialData.ambulatorioId || '',
          veterinarioId: initialData.veterinarioId?._id || initialData.veterinarioId || user?._id || '',
          data: initialData.data || todayStr,
          oraInizio: initialData.oraInizio || '09:00',
          durataMinuti: initialData.durataMinuti || 30,
          tipoPrestazione: initialData.tipoPrestazione || 'Visita Generale',
          motivo: initialData.motivo || 'Visita Generale',
          stato: initialData.stato || 'Prenotato',
          note: initialData.note || ''
        });
      } else {
        setFormData({
          animaleId: defaultPet?._id || '',
          proprietarioId: defaultPet?.proprietarioId?._id || defaultPet?.proprietarioId || '',
          ambulatorioId: activeClinic?._id || '',
          veterinarioId: user?._id || '',
          data: defaultDate || todayStr,
          oraInizio: defaultTime || '09:00',
          durataMinuti: 30,
          tipoPrestazione: 'Visita Generale',
          motivo: 'Visita Generale',
          stato: 'Prenotato',
          note: ''
        });
      }
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animaleId) {
      setError('Seleziona il paziente per l\'appuntamento');
      return;
    }
    if (!formData.data || !formData.oraInizio) {
      setError('Specifica la data e l\'orario di inizio');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        animaleId: formData.animaleId,
        proprietarioId: formData.proprietarioId || selectedOwnerId || undefined,
        ambulatorioId: activeClinic?._id || formData.ambulatorioId,
        veterinarioId: formData.veterinarioId || user?._id || undefined,
        data: formData.data,
        oraInizio: formData.oraInizio,
        durataMinuti: Number(formData.durataMinuti) || 30,
        tipoPrestazione: formData.tipoPrestazione || formData.motivo || 'Visita Generale',
        motivo: formData.motivo || formData.tipoPrestazione || 'Visita Generale',
        stato: formData.stato,
        note: formData.note
      };

      let result;
      if (initialData?._id) {
        result = await api.appointments.update(initialData._id, payload);
      } else {
        result = await api.appointments.create(payload);
      }

      if (result.success) {
        if (onAppointmentSaved) onAppointmentSaved(result.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio dell\'appuntamento');
    } finally {
      setSaving(false);
    }
  };

  // Preparazione opzioni proprietari
  const ownerOptions = owners.map((o) => ({
    value: o._id,
    label: `${o.cognome} ${o.nome}`,
    sublabel: `${o.telefono || 'No tel'}${o.codiceFiscale ? ` • CF: ${o.codiceFiscale}` : ''}`
  }));

  // Pazienti filtrati per il proprietario selezionato
  const visiblePets = selectedOwnerId
    ? pets.filter((p) => (p.proprietarioId?._id || p.proprietarioId)?.toString() === selectedOwnerId.toString())
    : pets;

  const petOptions = visiblePets.map((p) => ({
    value: p._id,
    label: p.nome,
    sublabel: `${p.specie} • ${p.razza || 'Meticcio'}${p.microchip ? ` • Microchip: ${p.microchip}` : ''}`
  }));

  // Opzioni veterinari per l'ambulatorio attivo
  const allClinicVets = [...(activeClinic?.veterinari || [])];
  if (user && !allClinicVets.some((v) => (v._id || v) === user._id)) {
    allClinicVets.unshift(user);
  }
  const vetOptions = allClinicVets.map((v) => ({
    value: v._id || v,
    label: `Dr. ${v.nome || ''} ${v.cognome || ''}`.trim() + ((v._id || v) === user?._id ? ' (Tu)' : ''),
    sublabel: v.codiceAlbo ? `Albo: ${v.codiceAlbo}` : (v.email || '')
  }));

  const durationOptions = [
    { value: 15, label: '15 minuti' },
    { value: 30, label: '30 minuti (Standard)' },
    { value: 45, label: '45 minuti' },
    { value: 60, label: '1 ora' },
    { value: 90, label: '1 ora e 30' },
    { value: 120, label: '2 ore' }
  ];

  const prestazioneOptions = [
    { value: 'Visita Generale', label: 'Visita Generale', sublabel: 'Controllo generale e visita clinica' },
    { value: 'Vaccinazione / Richiamo', label: 'Vaccinazione / Richiamo', sublabel: 'Somministrazione vaccino o richiamo' },
    { value: 'Controllo Post-Operatorio', label: 'Controllo Post-Operatorio', sublabel: 'Follow-up e controllo ferite chirurgia' },
    { value: 'Chirurgia programmata', label: 'Chirurgia programmata', sublabel: 'Intervento chirurgico programmato' },
    { value: 'Esami Sangue / Diagnostica', label: 'Esami Sangue / Diagnostica', sublabel: 'Prelievo ematico o esami diagnostici' },
    { value: 'Dermatologia / Orecchie', label: 'Dermatologia / Orecchie', sublabel: 'Problemi cutanei, otiti e allergie' },
    { value: 'Emergenza / Urgenza', label: 'Emergenza / Urgenza', sublabel: 'Prestazione con priorità' },
    { value: 'Altro', label: 'Altro', sublabel: 'Altra prestazione specialistica' }
  ];

  const statoOptions = [
    { value: 'Prenotato', label: '📅 Prenotato' },
    { value: 'Confermato', label: '👍 Confermato' },
    { value: 'In Attesa', label: '⏳ In Attesa (In sala d\'attesa)' },
    { value: 'In Visita', label: '🩺 In Visita' },
    { value: 'Completato', label: '✅ Completato' },
    { value: 'Annullato', label: '❌ Annullato' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1250 }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '100%', overflow: 'hidden' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Calendar size={18} />
            </div>
            <h2 className="modal-title">{initialData ? 'Modifica Appuntamento' : 'Nuovo Appuntamento in Agenda'}</h2>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minWidth: 0 }}>
          <div className="modal-body" style={{ overflowX: 'hidden' }}>
            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--rose-50)',
                  color: 'var(--rose-500)',
                  fontSize: '0.85rem'
                }}
              >
                {error}
              </div>
            )}

            {/* Selezione Proprietario e Paziente Filtrati per Ambulatorio Attivo */}
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Proprietario (Cliente) *</label>
                <CustomSelect
                  id="apt-select-owner"
                  value={selectedOwnerId}
                  onChange={(e) => {
                    const val = unwrapVal(e);
                    setSelectedOwnerId(val);
                    const ownerPets = pets.filter((p) => (p.proprietarioId?._id || p.proprietarioId)?.toString() === val?.toString());
                    const firstPet = ownerPets[0];
                    setFormData((prev) => ({
                      ...prev,
                      proprietarioId: val,
                      animaleId: firstPet ? firstPet._id : ''
                    }));
                  }}
                  options={ownerOptions}
                  placeholder="1. Seleziona proprietario..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Paziente (Animale) *</label>
                <CustomSelect
                  id="apt-select-pet"
                  value={formData.animaleId}
                  onChange={(e) => {
                    const val = unwrapVal(e);
                    const chosen = pets.find((p) => p._id === val);
                    setFormData((prev) => ({
                      ...prev,
                      animaleId: val,
                      proprietarioId: chosen?.proprietarioId?._id || chosen?.proprietarioId || prev.proprietarioId
                    }));
                  }}
                  options={petOptions}
                  placeholder={selectedOwnerId ? (petOptions.length > 0 ? '2. Seleziona paziente...' : 'Nessun paziente associato') : 'Seleziona prima il proprietario...'}
                  disabled={!selectedOwnerId || petOptions.length === 0}
                />
              </div>
            </div>

            {selectedOwnerId && visiblePets.length === 0 && (
              <div
                style={{
                  padding: '0.6rem 0.85rem',
                  marginBottom: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} />
                <span>Nessun paziente associato a questo cliente nell'ambulatorio attivo. Registra prima l'animale.</span>
              </div>
            )}

            {/* Ambulatorio Attivo Fisso & Veterinario Incaricato */}
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} color="var(--primary)" />
                  <span>Ambulatorio Attivo</span>
                </label>
                <div
                  style={{
                    padding: '0.6rem 0.85rem',
                    background: 'var(--surface-color, #f8fafc)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: 'var(--radius-md, 8px)',
                    fontSize: '0.88rem',
                    color: 'var(--text-color, #334155)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '42px',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeClinic?.nome || 'Ambulatorio Attivo'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      background: 'rgba(13, 148, 136, 0.12)',
                      color: 'var(--primary)',
                      fontWeight: 600,
                      flexShrink: 0,
                      marginLeft: '0.5rem'
                    }}
                  >
                    Attivo
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Stethoscope size={14} color="var(--primary)" />
                  <span>Veterinario Incaricato *</span>
                </label>
                <CustomSelect
                  id="apt-select-vet"
                  value={formData.veterinarioId}
                  onChange={(e) => {
                    const val = unwrapVal(e);
                    setFormData((prev) => ({ ...prev, veterinarioId: val }));
                  }}
                  options={vetOptions}
                  placeholder="Seleziona medico veterinario..."
                />
              </div>
            </div>

            {/* Data, Ora Inizio e Durata */}
            <div className="form-row form-row-3">
              <div className="form-group">
                <label className="form-label">Data Appuntamento *</label>
                <input
                  id="apt-input-date"
                  type="date"
                  className="form-input"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ora Inizio *</label>
                <input
                  id="apt-input-time"
                  type="time"
                  className="form-input"
                  value={formData.oraInizio}
                  onChange={(e) => setFormData({ ...formData, oraInizio: e.target.value })}
                  step="900"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Durata</label>
                <CustomSelect
                  id="apt-select-duration"
                  value={formData.durataMinuti}
                  onChange={(e) => {
                    const val = unwrapVal(e);
                    setFormData((prev) => ({ ...prev, durataMinuti: Number(val) }));
                  }}
                  options={durationOptions}
                  searchable={false}
                />
              </div>
            </div>

            {/* Motivo / Prestazione e Stato Appuntamento */}
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Motivo / Prestazione *</label>
                <CustomSelect
                  id="apt-select-motivo"
                  value={formData.motivo}
                  onChange={(e) => {
                    const val = unwrapVal(e);
                    setFormData((prev) => ({
                      ...prev,
                      motivo: val,
                      tipoPrestazione: val
                    }));
                  }}
                  options={prestazioneOptions}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stato Appuntamento</label>
                <CustomSelect
                  id="apt-select-stato"
                  value={formData.stato}
                  onChange={(e) => {
                    const val = unwrapVal(e);
                    setFormData((prev) => ({ ...prev, stato: val }));
                  }}
                  options={statoOptions}
                  searchable={false}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Note Aggiuntive / Sintomi Segnalati</label>
              <textarea
                id="apt-input-note"
                rows="2"
                className="form-textarea"
                placeholder="Es. Il cane zoppica dalla zampa posteriore sinistra da ieri..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Annulla
            </button>
            <button id="btn-save-appointment" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvataggio...' : initialData ? 'Salva Modifiche' : 'Conferma Appuntamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
