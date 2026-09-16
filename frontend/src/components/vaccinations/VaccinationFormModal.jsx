import React, { useState, useEffect } from 'react';
import { X, Syringe, Calendar, Plus, ShieldCheck } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { api } from '../../services/api';

export const VaccinationFormModal = ({
  isOpen,
  onClose,
  onVaccinationSaved,
  defaultPet = null,
  initialData = null
}) => {
  const { activeClinic, clinics } = useClinic();
  const [pets, setPets] = useState([]);

  const getNextYearDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    animaleId: defaultPet?._id || '',
    ambulatorioId: defaultPet?.ambulatorioId?._id || defaultPet?.ambulatorioId || activeClinic?._id || (clinics[0]?._id || ''),
    nomeVaccino: '',
    categoria: 'Richiamo Annuale',
    numeroLotto: '',
    dataSomministrazione: new Date().toISOString().split('T')[0],
    dataRichiamo: getNextYearDate(),
    note: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadPets();
      if (initialData) {
        setFormData({
          animaleId: initialData.animaleId?._id || initialData.animaleId || '',
          ambulatorioId: initialData.ambulatorioId?._id || initialData.ambulatorioId || activeClinic?._id || clinics[0]?._id || '',
          nomeVaccino: initialData.nomeVaccino || '',
          categoria: initialData.categoria || 'Richiamo Annuale',
          numeroLotto: initialData.numeroLotto || '',
          dataSomministrazione: initialData.dataSomministrazione ? initialData.dataSomministrazione.split('T')[0] : new Date().toISOString().split('T')[0],
          dataRichiamo: initialData.dataRichiamo ? initialData.dataRichiamo.split('T')[0] : getNextYearDate(),
          note: initialData.note || ''
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          animaleId: defaultPet?._id || prev.animaleId || '',
          ambulatorioId: defaultPet?.ambulatorioId?._id || defaultPet?.ambulatorioId || activeClinic?._id || clinics[0]?._id || '',
          nomeVaccino: '',
          numeroLotto: '',
          dataSomministrazione: new Date().toISOString().split('T')[0],
          dataRichiamo: getNextYearDate(),
          note: ''
        }));
      }
      setError('');
    }
  }, [isOpen, defaultPet, initialData, activeClinic]);

  const loadPets = async () => {
    try {
      const res = await api.pets.getAll();
      if (res.success) {
        setPets(res.data);
        if (!formData.animaleId && !defaultPet && res.data.length > 0) {
          setFormData((prev) => ({ ...prev, animaleId: res.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Errore caricamento animali:', err.message);
    }
  };

  const setPresetRecall = (months) => {
    const base = formData.dataSomministrazione ? new Date(formData.dataSomministrazione) : new Date();
    base.setMonth(base.getMonth() + months);
    setFormData({ ...formData, dataRichiamo: base.toISOString().split('T')[0] });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animaleId) {
      setError('Seleziona il paziente per la vaccinazione');
      return;
    }
    if (!formData.nomeVaccino.trim()) {
      setError('Inserisci il nome del vaccino');
      return;
    }
    if (!formData.dataRichiamo) {
      setError('Imposta la data del prossimo richiamo periodico');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let result;
      if (initialData?._id) {
        result = await api.vaccinations.update(initialData._id, formData);
      } else {
        result = await api.vaccinations.create(formData);
      }

      if (result.success) {
        if (onVaccinationSaved) onVaccinationSaved(result.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio della vaccinazione');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--emerald-50)', color: 'var(--emerald-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Syringe size={18} />
            </div>
            <h2 className="modal-title">{initialData ? 'Modifica Registrazione Vaccino' : 'Registra Vaccinazione & Richiamo'}</h2>
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
                id="vac-select-pet"
                className="form-select"
                value={formData.animaleId}
                onChange={(e) => setFormData({ ...formData, animaleId: e.target.value })}
                required
              >
                <option value="">-- Seleziona Paziente --</option>
                {pets.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nome} ({p.specie} - {p.razza})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Nome Commerciale Vaccino *</label>
                <input
                  id="vac-input-nome"
                  type="text"
                  className="form-input"
                  placeholder="Es. Nobivac DHPPi, Versican Plus..."
                  value={formData.nomeVaccino}
                  onChange={(e) => setFormData({ ...formData, nomeVaccino: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipologia Vaccino</label>
                <select
                  id="vac-select-categoria"
                  className="form-select"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="Richiamo Annuale">Richiamo Annuale</option>
                  <option value="Core / Polivalente">Core / Polivalente</option>
                  <option value="Antirabbica">Antirabbica</option>
                  <option value="Leishmaniosi">Leishmaniosi</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Numero di Lotto (Tracciabilità)</label>
                <input
                  id="vac-input-lotto"
                  type="text"
                  className="form-input"
                  placeholder="Es. B84920A"
                  value={formData.numeroLotto}
                  onChange={(e) => setFormData({ ...formData, numeroLotto: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data Somministrazione *</label>
                <input
                  id="vac-input-somministrazione"
                  type="date"
                  className="form-input"
                  value={formData.dataSomministrazione}
                  onChange={(e) => setFormData({ ...formData, dataSomministrazione: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Scadenza Richiamo con calcolo automatico */}
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0, fontWeight: '700', color: 'var(--primary)' }}>
                  Data Prossimo Richiamo (Scadenza) *
                </label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setPresetRecall(12)}
                  >
                    +1 Anno
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem' }}
                    onClick={() => setPresetRecall(36)}
                  >
                    +3 Anni
                  </button>
                </div>
              </div>
              <input
                id="vac-input-richiamo"
                type="date"
                className="form-input"
                value={formData.dataRichiamo}
                onChange={(e) => setFormData({ ...formData, dataRichiamo: e.target.value })}
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                Il sistema calcolerà automaticamente i giorni mancanti e genererà un warning visivo in caso di richiamo imminente o superato.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Note Cliniche / Reazioni</label>
              <textarea
                id="vac-input-note"
                rows="2"
                className="form-textarea"
                placeholder="Buona tolleranza, sito di iniezione..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Annulla
            </button>
            <button id="btn-save-vaccination" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvataggio...' : initialData ? 'Salva Modifiche' : 'Registra Vaccino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
