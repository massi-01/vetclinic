import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { api } from '../../services/api';

export const ClinicFormModal = ({ isOpen, onClose, onClinicSaved, initialData = null }) => {
  const { refreshClinics } = useClinic();

  const [formData, setFormData] = useState({
    nome: '',
    indirizzo: '',
    citta: 'Milano',
    cap: '',
    telefono: '',
    email: '',
    partitaIva: '',
    codiceFiscale: '',
    orariApertura: 'Lun - Ven: 09:00 - 19:00 | Sab: 09:00 - 13:00',
    prontoSoccorso24h: false,
    coloreTema: '#0d9488'
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nome: initialData.nome || '',
          indirizzo: initialData.indirizzo || '',
          citta: initialData.citta || '',
          cap: initialData.cap || '',
          telefono: initialData.telefono || '',
          email: initialData.email || '',
          partitaIva: initialData.partitaIva || '',
          codiceFiscale: initialData.codiceFiscale || '',
          orariApertura: initialData.orariApertura || '',
          prontoSoccorso24h: !!initialData.prontoSoccorso24h,
          coloreTema: initialData.coloreTema || '#0d9488'
        });
      } else {
        setFormData({
          nome: '',
          indirizzo: '',
          citta: 'Milano',
          cap: '',
          telefono: '',
          email: '',
          partitaIva: '',
          codiceFiscale: '',
          orariApertura: 'Lun - Ven: 09:00 - 19:00 | Sab: 09:00 - 13:00',
          prontoSoccorso24h: false,
          coloreTema: '#0d9488'
        });
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.indirizzo.trim() || !formData.citta.trim() || !formData.telefono.trim()) {
      setError('Nome struttura, indirizzo, città e telefono sono obbligatori');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let result;
      if (initialData?._id) {
        result = await api.clinics.update(initialData._id, formData);
      } else {
        result = await api.clinics.create(formData);
      }

      if (result.success) {
        await refreshClinics();
        if (onClinicSaved) onClinicSaved(result.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Errore nel salvataggio dell'ambulatorio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} />
            </div>
            <h2 className="modal-title">{initialData ? 'Modifica Sede Ambulatorio' : 'Aggiungi Nuovo Ambulatorio'}</h2>
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
              <label className="form-label">Nome Struttura / Ambulatorio *</label>
              <input
                id="clinic-input-nome"
                type="text"
                className="form-input"
                placeholder="Es. Clinica Veterinaria Santa Rita"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Indirizzo Sede *</label>
                <input
                  id="clinic-input-indirizzo"
                  type="text"
                  className="form-input"
                  placeholder="Es. Corso Italia 100"
                  value={formData.indirizzo}
                  onChange={(e) => setFormData({ ...formData, indirizzo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Città & CAP *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                  <input
                    id="clinic-input-citta"
                    type="text"
                    className="form-input"
                    placeholder="Città"
                    value={formData.citta}
                    onChange={(e) => setFormData({ ...formData, citta: e.target.value })}
                    required
                  />
                  <input
                    id="clinic-input-cap"
                    type="text"
                    className="form-input"
                    placeholder="CAP"
                    value={formData.cap}
                    onChange={(e) => setFormData({ ...formData, cap: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Recapito Telefonico *</label>
                <input
                  id="clinic-input-telefono"
                  type="tel"
                  className="form-input"
                  placeholder="02 1234567"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Ufficiale</label>
                <input
                  id="clinic-input-email"
                  type="email"
                  className="form-input"
                  placeholder="contatto@ambulatorio.it"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Partita IVA</label>
                <input
                  id="clinic-input-piva"
                  type="text"
                  className="form-input"
                  placeholder="IT12345678901"
                  value={formData.partitaIva}
                  onChange={(e) => setFormData({ ...formData, partitaIva: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Colore Badge Struttura</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={formData.coloreTema}
                    onChange={(e) => setFormData({ ...formData, coloreTema: e.target.value })}
                    style={{ width: '42px', height: '38px', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0 }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>Identificativo cromatico</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Orari di Ricevimento</label>
              <input
                id="clinic-input-orari"
                type="text"
                className="form-input"
                placeholder="Lun - Ven: 09:00 - 19:00"
                value={formData.orariApertura}
                onChange={(e) => setFormData({ ...formData, orariApertura: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={formData.prontoSoccorso24h}
                  onChange={(e) => setFormData({ ...formData, prontoSoccorso24h: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontWeight: '600', color: 'var(--slate-800)' }}>Presidio di Pronto Soccorso 24h</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Annulla
            </button>
            <button id="btn-save-clinic" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvataggio...' : initialData ? 'Salva Modifiche' : 'Crea Ambulatorio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
