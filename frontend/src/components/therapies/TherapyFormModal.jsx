import React, { useState, useEffect } from 'react';
import { X, Pill, Plus } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { api } from '../../services/api';

export const TherapyFormModal = ({
  isOpen,
  onClose,
  onTherapySaved,
  defaultPet = null,
  initialData = null
}) => {
  const { activeClinic, clinics } = useClinic();
  const [pets, setPets] = useState([]);

  const [formData, setFormData] = useState({
    animaleId: defaultPet?._id || '',
    ambulatorioId: defaultPet?.ambulatorioId?._id || defaultPet?.ambulatorioId || activeClinic?._id || (clinics[0]?._id || ''),
    nomeFarmaco: '',
    principioAttivo: '',
    dosaggio: '',
    viaSomministrazione: 'Orale',
    posologia: '',
    dataInizio: new Date().toISOString().split('T')[0],
    durataGiorni: 7,
    istruzioni: '',
    attiva: true
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
          nomeFarmaco: initialData.nomeFarmaco || '',
          principioAttivo: initialData.principioAttivo || '',
          dosaggio: initialData.dosaggio || '',
          viaSomministrazione: initialData.viaSomministrazione || 'Orale',
          posologia: initialData.posologia || '',
          dataInizio: initialData.dataInizio ? initialData.dataInizio.split('T')[0] : new Date().toISOString().split('T')[0],
          durataGiorni: initialData.durataGiorni || 7,
          istruzioni: initialData.istruzioni || '',
          attiva: initialData.attiva !== undefined ? initialData.attiva : true
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          animaleId: defaultPet?._id || prev.animaleId || '',
          ambulatorioId: defaultPet?.ambulatorioId?._id || defaultPet?.ambulatorioId || activeClinic?._id || clinics[0]?._id || '',
          nomeFarmaco: '',
          principioAttivo: '',
          dosaggio: '',
          posologia: '',
          istruzioni: '',
          attiva: true
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animaleId) {
      setError('Seleziona il paziente per la terapia');
      return;
    }
    if (!formData.nomeFarmaco.trim()) {
      setError('Inserisci il nome del farmaco');
      return;
    }
    if (!formData.posologia.trim()) {
      setError('Specifica la posologia/frequenza');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let result;
      if (initialData?._id) {
        result = await api.therapies.update(initialData._id, formData);
      } else {
        result = await api.therapies.create(formData);
      }

      if (result.success) {
        onTherapySaved(result.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio della terapia');
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
              <Pill size={18} />
            </div>
            <h2 className="modal-title">{initialData ? 'Modifica Terapia' : 'Prescrivi Terapia Farmacologica'}</h2>
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
                id="therapy-select-pet"
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
                <label className="form-label">Nome Commerciale Farmaco *</label>
                <input
                  id="therapy-input-nome"
                  type="text"
                  className="form-input"
                  placeholder="Es. Synulox, Kesium, Onsior..."
                  value={formData.nomeFarmaco}
                  onChange={(e) => setFormData({ ...formData, nomeFarmaco: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Principio Attivo</label>
                <input
                  id="therapy-input-principio"
                  type="text"
                  className="form-input"
                  placeholder="Es. Amoxicillina + Acido clavulanico"
                  value={formData.principioAttivo}
                  onChange={(e) => setFormData({ ...formData, principioAttivo: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Dosaggio *</label>
                <input
                  id="therapy-input-dosaggio"
                  type="text"
                  className="form-input"
                  placeholder="Es. 250 mg, 1 ml..."
                  value={formData.dosaggio}
                  onChange={(e) => setFormData({ ...formData, dosaggio: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Via di Somministrazione</label>
                <select
                  id="therapy-select-via"
                  className="form-select"
                  value={formData.viaSomministrazione}
                  onChange={(e) => setFormData({ ...formData, viaSomministrazione: e.target.value })}
                >
                  <option value="Orale">Orale</option>
                  <option value="Sottocutanea">Sottocutanea</option>
                  <option value="Intramuscolare">Intramuscolare</option>
                  <option value="Topica">Topica (cutanea)</option>
                  <option value="Oftalmica">Oftalmica (collirio/pomata)</option>
                  <option value="Endovenosa">Endovenosa</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Posologia & Frequenza *</label>
              <input
                id="therapy-input-posologia"
                type="text"
                className="form-input"
                placeholder="Es. 1 compressa ogni 12 ore dopo i pasti"
                value={formData.posologia}
                onChange={(e) => setFormData({ ...formData, posologia: e.target.value })}
                required
              />
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Data Inizio Terapia</label>
                <input
                  id="therapy-input-datainizio"
                  type="date"
                  className="form-input"
                  value={formData.dataInizio}
                  onChange={(e) => setFormData({ ...formData, dataInizio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Durata Trattamento (Giorni)</label>
                <input
                  id="therapy-input-durata"
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.durataGiorni}
                  onChange={(e) => setFormData({ ...formData, durataGiorni: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Istruzioni Aggiuntive per il Proprietario</label>
              <textarea
                id="therapy-input-istruzioni"
                rows="2"
                className="form-textarea"
                placeholder="Es. Conservare in frigorifero, non interrompere prima del termine..."
                value={formData.istruzioni}
                onChange={(e) => setFormData({ ...formData, istruzioni: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={formData.attiva}
                  onChange={(e) => setFormData({ ...formData, attiva: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontWeight: '600', color: 'var(--slate-700)' }}>Terapia attualmente in corso (Attiva)</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Annulla
            </button>
            <button id="btn-save-therapy" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvataggio in corso...' : initialData ? 'Salva Modifiche' : 'Prescrivi Terapia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
