import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { api } from '../../services/api';

export const AppointmentFormModal = ({
  isOpen,
  onClose,
  onAppointmentSaved,
  defaultDate = null,
  defaultTime = null,
  defaultPet = null,
  initialData = null
}) => {
  const { activeClinic, clinics } = useClinic();
  const [pets, setPets] = useState([]);
  const [owners, setOwners] = useState([]);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    animaleId: '',
    proprietarioId: '',
    ambulatorioId: activeClinic?._id || clinics[0]?._id || '',
    data: todayStr,
    oraInizio: '09:00',
    durataMinuti: 30,
    tipoPrestazione: 'Visita Generale',
    motivo: 'Visita Generale di controllo',
    stato: 'Prenotato',
    note: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();

      if (initialData) {
        setFormData({
          animaleId: initialData.animaleId?._id || initialData.animaleId || '',
          proprietarioId: initialData.proprietarioId?._id || initialData.proprietarioId || '',
          ambulatorioId: initialData.ambulatorioId?._id || initialData.ambulatorioId || activeClinic?._id || clinics[0]?._id || '',
          data: initialData.data || todayStr,
          oraInizio: initialData.oraInizio || '09:00',
          durataMinuti: initialData.durataMinuti || 30,
          tipoPrestazione: initialData.tipoPrestazione || 'Visita Generale',
          motivo: initialData.motivo || 'Visita Generale',
          stato: initialData.stato || 'Prenotato',
          note: initialData.note || ''
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          animaleId: defaultPet?._id || '',
          proprietarioId: defaultPet?.proprietarioId?._id || defaultPet?.proprietarioId || '',
          ambulatorioId: defaultPet?.ambulatorioId?._id || defaultPet?.ambulatorioId || activeClinic?._id || clinics[0]?._id || '',
          data: defaultDate || todayStr,
          oraInizio: defaultTime || '09:00',
          durataMinuti: 30,
          tipoPrestazione: 'Visita Generale',
          motivo: 'Visita Generale di controllo',
          stato: 'Prenotato',
          note: ''
        }));
      }
      setError('');
    }
  }, [isOpen, defaultDate, defaultTime, defaultPet, initialData, activeClinic]);

  const loadData = async () => {
    try {
      const [petsRes, ownersRes] = await Promise.all([
        api.pets.getAll(),
        api.owners.getAll()
      ]);
      if (petsRes.success) setPets(petsRes.data);
      if (ownersRes.success) setOwners(ownersRes.data);
    } catch (err) {
      console.error('Errore nel caricamento dati appuntamento:', err.message);
    }
  };

  const handlePetChange = (petId) => {
    const selected = pets.find((p) => p._id === petId);
    setFormData((prev) => ({
      ...prev,
      animaleId: petId,
      proprietarioId: selected?.proprietarioId?._id || selected?.proprietarioId || prev.proprietarioId
    }));
  };

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
        proprietarioId: formData.proprietarioId || undefined,
        ambulatorioId: formData.ambulatorioId,
        data: formData.data,
        oraInizio: formData.oraInizio,
        durataMinuti: Number(formData.durataMinuti) || 30,
        tipoPrestazione: formData.tipoPrestazione,
        motivo: formData.motivo,
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={18} />
            </div>
            <h2 className="modal-title">{initialData ? 'Modifica Appuntamento' : 'Nuovo Appuntamento in Agenda'}</h2>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {error && (
              <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--rose-50)', color: 'var(--rose-500)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Paziente (Animale) *</label>
              <select
                id="apt-select-pet"
                className="form-select"
                value={formData.animaleId}
                onChange={(e) => handlePetChange(e.target.value)}
                required
              >
                <option value="">-- Seleziona Paziente --</option>
                {pets.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nome} ({p.specie} - {p.razza}) - Prop: {p.proprietarioId?.cognome || 'N/D'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Proprietario Associato</label>
                <select
                  id="apt-select-owner"
                  className="form-select"
                  value={formData.proprietarioId}
                  onChange={(e) => setFormData({ ...formData, proprietarioId: e.target.value })}
                >
                  <option value="">-- Nessuno o Seleziona Proprietario --</option>
                  {owners.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.nome} {o.cognome} ({o.telefono || 'No tel'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ambulatorio</label>
                <select
                  id="apt-select-clinic"
                  className="form-select"
                  value={formData.ambulatorioId}
                  onChange={(e) => setFormData({ ...formData, ambulatorioId: e.target.value })}
                >
                  {clinics.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                <select
                  id="apt-select-duration"
                  className="form-select"
                  value={formData.durataMinuti}
                  onChange={(e) => setFormData({ ...formData, durataMinuti: Number(e.target.value) })}
                >
                  <option value={15}>15 minuti</option>
                  <option value={30}>30 minuti</option>
                  <option value={45}>45 minuti</option>
                  <option value={60}>1 ora</option>
                  <option value={90}>1 ora e 30</option>
                  <option value={120}>2 ore</option>
                </select>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Motivo / Prestazione *</label>
                <select
                  id="apt-select-motivo"
                  className="form-select"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                >
                  <option value="Visita Generale">Visita Generale</option>
                  <option value="Vaccinazione / Richiamo">Vaccinazione / Richiamo</option>
                  <option value="Controllo Post-Operatorio">Controllo Post-Operatorio</option>
                  <option value="Chirurgia programmata">Chirurgia programmata</option>
                  <option value="Esami Sangue / Diagnostica">Esami Sangue / Diagnostica</option>
                  <option value="Dermatologia / Orecchie">Dermatologia / Orecchie</option>
                  <option value="Emergenza / Urgenza">Emergenza / Urgenza</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stato Appuntamento</label>
                <select
                  id="apt-select-stato"
                  className="form-select"
                  value={formData.stato}
                  onChange={(e) => setFormData({ ...formData, stato: e.target.value })}
                >
                  <option value="Prenotato">📅 Prenotato</option>
                  <option value="Confermato">👍 Confermato</option>
                  <option value="In Attesa">⏳ In Attesa (In sala d'attesa)</option>
                  <option value="In Visita">🩺 In Visita</option>
                  <option value="Completato">✅ Completato</option>
                  <option value="Annullato">❌ Annullato</option>
                </select>
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
