import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { api } from '../../services/api';

export const OwnerFormModal = ({
  isOpen,
  onClose,
  onOwnerSaved,
  initialData = null
}) => {
  const { activeClinic, clinics } = useClinic();

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    codiceFiscale: '',
    telefono: '',
    email: '',
    indirizzo: '',
    citta: 'Milano',
    note: '',
    ambulatorioId: activeClinic?._id || (clinics[0]?._id || '')
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nome: initialData.nome || '',
          cognome: initialData.cognome || '',
          codiceFiscale: initialData.codiceFiscale || '',
          telefono: initialData.telefono || '',
          email: initialData.email || '',
          indirizzo: initialData.indirizzo || '',
          citta: initialData.citta || '',
          note: initialData.note || '',
          ambulatorioId: initialData.ambulatorioId?._id || initialData.ambulatorioId || activeClinic?._id || clinics[0]?._id || ''
        });
      } else {
        setFormData({
          nome: '',
          cognome: '',
          codiceFiscale: '',
          telefono: '',
          email: '',
          indirizzo: '',
          citta: activeClinic?.citta || 'Milano',
          note: '',
          ambulatorioId: activeClinic?._id || (clinics[0]?._id || '')
        });
      }
      setError('');
    }
  }, [isOpen, initialData, activeClinic]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.cognome.trim() || !formData.telefono.trim()) {
      setError('Nome, cognome e recapito telefonico sono obbligatori');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let result;
      if (initialData?._id) {
        result = await api.owners.update(initialData._id, formData);
      } else {
        result = await api.owners.create(formData);
      }

      if (result.success) {
        onOwnerSaved(result.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Errore nel salvataggio del proprietario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--blue-50)', color: 'var(--blue-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <h2 className="modal-title">{initialData ? 'Modifica Anagrafica Cliente' : 'Nuovo Proprietario (Cliente)'}</h2>
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
                <label className="form-label">Nome *</label>
                <input
                  id="owner-input-nome"
                  type="text"
                  className="form-input"
                  placeholder="Es. Mario"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cognome *</label>
                <input
                  id="owner-input-cognome"
                  type="text"
                  className="form-input"
                  placeholder="Es. Bianchi"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Telefono (Cellulare) *</label>
                <input
                  id="owner-input-telefono"
                  type="tel"
                  className="form-input"
                  placeholder="+39 333 1234567"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  id="owner-input-email"
                  type="email"
                  className="form-input"
                  placeholder="mario.bianchi@email.it"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Codice Fiscale</label>
                <input
                  id="owner-input-cf"
                  type="text"
                  className="form-input"
                  placeholder="16 caratteri"
                  value={formData.codiceFiscale}
                  onChange={(e) => setFormData({ ...formData, codiceFiscale: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ambulatorio di Riferimento *</label>
                <select
                  id="owner-select-ambulatorio"
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

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Indirizzo di Residenza</label>
                <input
                  id="owner-input-indirizzo"
                  type="text"
                  className="form-input"
                  placeholder="Via Roma 12"
                  value={formData.indirizzo}
                  onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Città</label>
                <input
                  id="owner-input-citta"
                  type="text"
                  className="form-input"
                  value={formData.citta}
                  onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Note o Preferenze di Contatto</label>
              <textarea
                id="owner-input-note"
                rows="2"
                className="form-textarea"
                placeholder="Preferisce messaggi WhatsApp, reperibilità orari..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Annulla
            </button>
            <button id="btn-save-owner" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvataggio...' : initialData ? 'Salva Modifiche' : 'Registra Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
