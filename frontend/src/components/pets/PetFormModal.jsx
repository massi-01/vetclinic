import React, { useState, useEffect } from 'react';
import { X, Dog, Cat, Plus } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { api } from '../../services/api';

export const PetFormModal = ({ isOpen, onClose, onPetSaved, initialData = null, defaultOwnerId = null }) => {
  const { activeClinic, clinics } = useClinic();
  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    specie: 'Cane',
    razza: '',
    sesso: 'Maschio',
    dataNascita: '',
    microchip: '',
    pesoAttuale: '',
    coloreMantello: '',
    segniParticolari: '',
    allergie: '',
    noteCliniche: '',
    proprietarioId: defaultOwnerId || '',
    ambulatorioId: activeClinic?._id || (clinics[0]?._id || '')
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOwners();
      if (initialData) {
        setFormData({
          nome: initialData.nome || '',
          specie: initialData.specie || 'Cane',
          razza: initialData.razza || '',
          sesso: initialData.sesso || 'Maschio',
          dataNascita: initialData.dataNascita ? initialData.dataNascita.split('T')[0] : '',
          microchip: initialData.microchip || '',
          pesoAttuale: initialData.pesoAttuale || '',
          coloreMantello: initialData.coloreMantello || '',
          segniParticolari: initialData.segniParticolari || '',
          allergie: Array.isArray(initialData.allergie) ? initialData.allergie.join(', ') : '',
          noteCliniche: initialData.noteCliniche || '',
          proprietarioId: initialData.proprietarioId?._id || initialData.proprietarioId || defaultOwnerId || '',
          ambulatorioId: initialData.ambulatorioId?._id || initialData.ambulatorioId || activeClinic?._id || clinics[0]?._id || ''
        });
      } else {
        setFormData({
          nome: '',
          specie: 'Cane',
          razza: '',
          sesso: 'Maschio',
          dataNascita: '',
          microchip: '',
          pesoAttuale: '',
          coloreMantello: '',
          segniParticolari: '',
          allergie: '',
          noteCliniche: '',
          proprietarioId: defaultOwnerId || '',
          ambulatorioId: activeClinic?._id || (clinics[0]?._id || '')
        });
      }
      setError('');
    }
  }, [isOpen, initialData, activeClinic, defaultOwnerId]);

  const loadOwners = async () => {
    try {
      setLoadingOwners(true);
      const res = await api.owners.getAll();
      if (res.success) {
        setOwners(res.data);
        if (!formData.proprietarioId && res.data.length > 0 && !defaultOwnerId) {
          setFormData((prev) => ({ ...prev, proprietarioId: res.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Errore nel caricamento proprietari:', err.message);
    } finally {
      setLoadingOwners(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setError("Il nome dell'animale è obbligatorio");
      return;
    }
    if (!formData.proprietarioId) {
      setError('Seleziona un proprietario di riferimento');
      return;
    }
    if (!formData.ambulatorioId) {
      setError('Seleziona un ambulatorio');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const payload = {
        ...formData,
        pesoAttuale: formData.pesoAttuale ? Number(formData.pesoAttuale) : 0,
        allergie: formData.allergie
          ? formData.allergie.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      };

      let result;
      if (initialData?._id) {
        result = await api.pets.update(initialData._id, payload);
      } else {
        result = await api.pets.create(payload);
      }

      if (result.success) {
        onPetSaved(result.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Errore durante il salvataggio dell'animale");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Dog size={18} />
            </div>
            <h2 className="modal-title">{initialData ? 'Modifica Cartella Paziente' : 'Nuovo Paziente (Animale)'}</h2>
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

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Nome Animale *</label>
                <input
                  id="pet-input-nome"
                  type="text"
                  className="form-input"
                  placeholder="Es. Thor, Luna..."
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specie *</label>
                <select
                  id="pet-select-specie"
                  className="form-select"
                  value={formData.specie}
                  onChange={(e) => setFormData({ ...formData, specie: e.target.value })}
                >
                  <option value="Cane">Cane 🐶</option>
                  <option value="Gatto">Gatto 🐱</option>
                  <option value="Coniglio">Coniglio 🐰</option>
                  <option value="Volatile">Volatile 🦜</option>
                  <option value="Rettile">Rettile 🦎</option>
                  <option value="Altro">Altro 🐾</option>
                </select>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Razza</label>
                <input
                  id="pet-input-razza"
                  type="text"
                  className="form-input"
                  placeholder="Es. Golden Retriever, Europeo..."
                  value={formData.razza}
                  onChange={(e) => setFormData({ ...formData, razza: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sesso</label>
                <select
                  id="pet-select-sesso"
                  className="form-select"
                  value={formData.sesso}
                  onChange={(e) => setFormData({ ...formData, sesso: e.target.value })}
                >
                  <option value="Maschio">Maschio</option>
                  <option value="Femmina">Femmina</option>
                  <option value="Maschio Castrato">Maschio Castrato</option>
                  <option value="Femmina Sterilizzata">Femmina Sterilizzata</option>
                </select>
              </div>
            </div>

            <div className="form-row form-row-3">
              <div className="form-group">
                <label className="form-label">Numero Microchip</label>
                <input
                  id="pet-input-microchip"
                  type="text"
                  className="form-input"
                  placeholder="15 cifre ISO"
                  value={formData.microchip}
                  onChange={(e) => setFormData({ ...formData, microchip: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data di Nascita</label>
                <input
                  id="pet-input-datanascita"
                  type="date"
                  className="form-input"
                  value={formData.dataNascita}
                  onChange={(e) => setFormData({ ...formData, dataNascita: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Peso Attuale (kg)</label>
                <input
                  id="pet-input-peso"
                  type="number"
                  step="0.05"
                  className="form-input"
                  placeholder="Es. 12.5"
                  value={formData.pesoAttuale}
                  onChange={(e) => setFormData({ ...formData, pesoAttuale: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Proprietario (Cliente) *</label>
                <select
                  id="pet-select-proprietario"
                  className="form-select"
                  value={formData.proprietarioId}
                  onChange={(e) => setFormData({ ...formData, proprietarioId: e.target.value })}
                  required
                >
                  <option value="">-- Seleziona Proprietario --</option>
                  {owners.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.cognome} {o.nome} ({o.telefono})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Ambulatorio di Riferimento *</label>
                <select
                  id="pet-select-ambulatorio"
                  className="form-select"
                  value={formData.ambulatorioId}
                  onChange={(e) => setFormData({ ...formData, ambulatorioId: e.target.value })}
                  required
                >
                  {clinics.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nome} - {c.citta}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Colore Mantello e Segni Particolari</label>
              <input
                id="pet-input-colore"
                type="text"
                className="form-input"
                placeholder="Es. Tigrato grigio, macchia bianca zampa destra..."
                value={formData.coloreMantello}
                onChange={(e) => setFormData({ ...formData, coloreMantello: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Allergie o Intolleranze Familiari (separate da virgola)</label>
              <input
                id="pet-input-allergie"
                type="text"
                className="form-input"
                placeholder="Es. Pollo, Cefalosporine, Penicillina"
                value={formData.allergie}
                onChange={(e) => setFormData({ ...formData, allergie: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Note Cliniche & Anamnesi Remota</label>
              <textarea
                id="pet-input-note"
                rows="3"
                className="form-textarea"
                placeholder="Patologie pregresse, interventi chirurgici passati, temperamento..."
                value={formData.noteCliniche}
                onChange={(e) => setFormData({ ...formData, noteCliniche: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Annulla
            </button>
            <button id="btn-save-pet" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvataggio in corso...' : initialData ? 'Salva Modifiche' : 'Registra Animale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
