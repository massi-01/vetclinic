import React, { useState, useEffect } from 'react';
import { X, ClipboardList, Stethoscope, Pill, HeartPulse } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { api } from '../../services/api';

export const VisitFormModal = ({
  isOpen,
  onClose,
  onVisitSaved,
  defaultPet = null,
  initialData = null
}) => {
  const { activeClinic, clinics } = useClinic();
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [includeTherapy, setIncludeTherapy] = useState(false);

  const [formData, setFormData] = useState({
    animaleId: defaultPet?._id || '',
    ambulatorioId: defaultPet?.ambulatorioId?._id || defaultPet?.ambulatorioId || activeClinic?._id || (clinics[0]?._id || ''),
    data: new Date().toISOString().split('T')[0],
    ora: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    tipoVisita: 'Controllo Generale',
    motivo: '',
    anamnesi: '',
    esameObiettivo: '',
    diagnosi: '',
    temperatura: '',
    frequenzaCardiaca: '',
    frequenzaRespiratoria: '',
    pesoRilevato: defaultPet?.pesoAttuale || '',
    note: '',
    stato: 'Completata',
    // Dati per terapia contestuale opzionale
    farmacoNome: '',
    farmacoPrincipio: '',
    farmacoDosaggio: '',
    farmacoVia: 'Orale',
    farmacoPosologia: '',
    farmacoDurata: 7,
    farmacoIstruzioni: ''
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
          data: initialData.data ? initialData.data.split('T')[0] : new Date().toISOString().split('T')[0],
          ora: initialData.ora || '10:00',
          tipoVisita: initialData.tipoVisita || 'Controllo Generale',
          motivo: initialData.motivo || '',
          anamnesi: initialData.anamnesi || '',
          esameObiettivo: initialData.esameObiettivo || '',
          diagnosi: initialData.diagnosi || '',
          temperatura: initialData.parametriVitali?.temperatura || '',
          frequenzaCardiaca: initialData.parametriVitali?.frequenzaCardiaca || '',
          frequenzaRespiratoria: initialData.parametriVitali?.frequenzaRespiratoria || '',
          pesoRilevato: initialData.parametriVitali?.pesoRilevato || '',
          note: initialData.note || '',
          stato: initialData.stato || 'Completata',
          farmacoNome: '',
          farmacoPrincipio: '',
          farmacoDosaggio: '',
          farmacoVia: 'Orale',
          farmacoPosologia: '',
          farmacoDurata: 7,
          farmacoIstruzioni: ''
        });
        setIncludeTherapy(false);
      } else {
        setFormData((prev) => ({
          ...prev,
          animaleId: defaultPet?._id || prev.animaleId || '',
          ambulatorioId: defaultPet?.ambulatorioId?._id || defaultPet?.ambulatorioId || activeClinic?._id || clinics[0]?._id || '',
          pesoRilevato: defaultPet?.pesoAttuale || '',
          motivo: '',
          anamnesi: '',
          esameObiettivo: '',
          diagnosi: '',
          note: ''
        }));
        setIncludeTherapy(false);
      }
      setError('');
    }
  }, [isOpen, defaultPet, initialData, activeClinic]);

  const loadPets = async () => {
    try {
      setLoadingPets(true);
      const res = await api.pets.getAll();
      if (res.success) {
        setPets(res.data);
        if (!formData.animaleId && !defaultPet && res.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            animaleId: res.data[0]._id,
            ambulatorioId: res.data[0].ambulatorioId?._id || res.data[0].ambulatorioId || prev.ambulatorioId
          }));
        }
      }
    } catch (err) {
      console.error('Errore caricamento animali:', err.message);
    } finally {
      setLoadingPets(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animaleId) {
      setError('Seleziona il paziente per la visita');
      return;
    }
    if (!formData.motivo.trim()) {
      setError('Specifica il motivo della visita clinica');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        animaleId: formData.animaleId,
        ambulatorioId: formData.ambulatorioId,
        data: formData.data,
        ora: formData.ora,
        tipoVisita: formData.tipoVisita,
        motivo: formData.motivo,
        anamnesi: formData.anamnesi,
        esameObiettivo: formData.esameObiettivo,
        diagnosi: formData.diagnosi,
        parametriVitali: {
          temperatura: formData.temperatura ? Number(formData.temperatura) : undefined,
          frequenzaCardiaca: formData.frequenzaCardiaca ? Number(formData.frequenzaCardiaca) : undefined,
          frequenzaRespiratoria: formData.frequenzaRespiratoria ? Number(formData.frequenzaRespiratoria) : undefined,
          pesoRilevato: formData.pesoRilevato ? Number(formData.pesoRilevato) : undefined
        },
        note: formData.note,
        stato: formData.stato
      };

      if (includeTherapy && formData.farmacoNome.trim()) {
        payload.terapia = {
          nomeFarmaco: formData.farmacoNome,
          principioAttivo: formData.farmacoPrincipio,
          dosaggio: formData.farmacoDosaggio,
          viaSomministrazione: formData.farmacoVia,
          posologia: formData.farmacoPosologia,
          durataGiorni: formData.farmacoDurata,
          istruzioni: formData.farmacoIstruzioni
        };
      }

      let result;
      if (initialData?._id) {
        result = await api.visits.update(initialData._id, payload);
      } else {
        result = await api.visits.create(payload);
      }

      if (result.success) {
        onVisitSaved(result.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Errore durante il salvataggio della visita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={18} />
            </div>
            <h2 className="modal-title">{initialData ? 'Modifica Visita Clinica' : 'Registra Nuova Visita'}</h2>
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

            {/* Paziente e Clinica */}
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Paziente (Animale) *</label>
                <select
                  id="visit-select-pet"
                  className="form-select"
                  value={formData.animaleId}
                  onChange={(e) => {
                    const sel = pets.find((p) => p._id === e.target.value);
                    setFormData({
                      ...formData,
                      animaleId: e.target.value,
                      pesoRilevato: sel?.pesoAttuale || formData.pesoRilevato
                    });
                  }}
                  required
                >
                  <option value="">-- Seleziona Paziente --</option>
                  {pets.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nome} ({p.specie} - {p.razza}) - Prop: {p.proprietarioId?.cognome || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo Visita *</label>
                <select
                  id="visit-select-tipo"
                  className="form-select"
                  value={formData.tipoVisita}
                  onChange={(e) => setFormData({ ...formData, tipoVisita: e.target.value })}
                >
                  <option value="Controllo Generale">Controllo Generale</option>
                  <option value="Vaccinazione">Vaccinazione</option>
                  <option value="Pronto Soccorso">Pronto Soccorso / Urgenza</option>
                  <option value="Chirurgia">Chirurgia</option>
                  <option value="Visita Specialistica">Visita Specialistica</option>
                  <option value="Altro">Altro</option>
                </select>
              </div>
            </div>

            {/* Data e Ora */}
            <div className="form-row form-row-3">
              <div className="form-group">
                <label className="form-label">Data Visita</label>
                <input
                  id="visit-input-data"
                  type="date"
                  className="form-input"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Orario</label>
                <input
                  id="visit-input-ora"
                  type="time"
                  className="form-input"
                  value={formData.ora}
                  onChange={(e) => setFormData({ ...formData, ora: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stato Visita</label>
                <select
                  id="visit-select-stato"
                  className="form-select"
                  value={formData.stato}
                  onChange={(e) => setFormData({ ...formData, stato: e.target.value })}
                >
                  <option value="Completata">Completata</option>
                  <option value="In corso">In corso</option>
                  <option value="Prenotata">Prenotata</option>
                </select>
              </div>
            </div>

            {/* Motivo Visita */}
            <div className="form-group">
              <label className="form-label">Motivo Principale della Visita *</label>
              <input
                id="visit-input-motivo"
                type="text"
                className="form-input"
                placeholder="Es. Richiamo vaccino, zoppia arto posteriore, tosse..."
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                required
              />
            </div>

            {/* Parametri Vitali Box */}
            <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                <HeartPulse size={15} /> PARAMETRI VITALI AL MOMENTO DELLA VISITA
              </div>
              <div className="form-row form-row-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Temp. (°C)</label>
                  <input
                    id="visit-input-temp"
                    type="number"
                    step="0.1"
                    className="form-input"
                    placeholder="Es. 38.5"
                    value={formData.temperatura}
                    onChange={(e) => setFormData({ ...formData, temperatura: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>FC (bpm)</label>
                  <input
                    id="visit-input-fc"
                    type="number"
                    className="form-input"
                    placeholder="Es. 90"
                    value={formData.frequenzaCardiaca}
                    onChange={(e) => setFormData({ ...formData, frequenzaCardiaca: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>FR (atti/m)</label>
                  <input
                    id="visit-input-fr"
                    type="number"
                    className="form-input"
                    placeholder="Es. 20"
                    value={formData.frequenzaRespiratoria}
                    onChange={(e) => setFormData({ ...formData, frequenzaRespiratoria: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Peso (kg)</label>
                  <input
                    id="visit-input-peso"
                    type="number"
                    step="0.05"
                    className="form-input"
                    placeholder="Es. 32.5"
                    value={formData.pesoRilevato}
                    onChange={(e) => setFormData({ ...formData, pesoRilevato: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Esame Obiettivo e Diagnosi */}
            <div className="form-group">
              <label className="form-label">Esame Obiettivo Particolare (EOP) & Sintomi</label>
              <textarea
                id="visit-input-esame"
                rows="2"
                className="form-textarea"
                placeholder="Rilievi clinici all'ispezione, palpazione, auscultazione..."
                value={formData.esameObiettivo}
                onChange={(e) => setFormData({ ...formData, esameObiettivo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Diagnosi o Sospetto Diagnostico</label>
              <input
                id="visit-input-diagnosi"
                type="text"
                className="form-input"
                placeholder="Es. Otite batterica bilaterale, gastroenterite..."
                value={formData.diagnosi}
                onChange={(e) => setFormData({ ...formData, diagnosi: e.target.value })}
              />
            </div>

            {/* Toggle Terapia Contestuale */}
            {!initialData && (
              <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>
                  <input
                    type="checkbox"
                    checked={includeTherapy}
                    onChange={(e) => setIncludeTherapy(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  <span>+ Prescrivi contestualmente una terapia farmacologica</span>
                </label>

                {includeTherapy && (
                  <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(13, 148, 136, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                      <Pill size={15} /> PRESCRIZIONE FARMACO
                    </div>

                    <div className="form-row form-row-2">
                      <div className="form-group">
                        <label className="form-label">Nome Farmaco *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Es. Synulox, Bravecto..."
                          value={formData.farmacoNome}
                          onChange={(e) => setFormData({ ...formData, farmacoNome: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Dosaggio</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Es. 250 mg, 1 cpr..."
                          value={formData.farmacoDosaggio}
                          onChange={(e) => setFormData({ ...formData, farmacoDosaggio: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row form-row-2">
                      <div className="form-group">
                        <label className="form-label">Posologia & Frequenza</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Es. 1 cpr ogni 12h ai pasti"
                          value={formData.farmacoPosologia}
                          onChange={(e) => setFormData({ ...formData, farmacoPosologia: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Durata (giorni)</label>
                        <input
                          type="number"
                          className="form-input"
                          value={formData.farmacoDurata}
                          onChange={(e) => setFormData({ ...formData, farmacoDurata: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Annulla
            </button>
            <button id="btn-save-visit" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Salvataggio in corso...' : initialData ? 'Salva Modifiche' : 'Registra Visita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
