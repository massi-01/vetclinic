import React, { useState, useEffect } from 'react';
import {
  X,
  ClipboardList,
  Stethoscope,
  Pill,
  HeartPulse,
  Calendar,
  Printer,
  FlaskConical,
  Paperclip,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Download,
  Eye
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { CustomSelect } from '../common/CustomSelect';
import { VisitReportModal } from './VisitReportModal';

// Arrotonda l'orario alla mezz'ora più vicina (:00 o :30)
const roundTimeToHalfHour = (timeStrOrDate) => {
  let h, m;
  if (!timeStrOrDate) {
    const now = new Date();
    h = now.getHours();
    m = now.getMinutes();
  } else if (timeStrOrDate instanceof Date) {
    h = timeStrOrDate.getHours();
    m = timeStrOrDate.getMinutes();
  } else if (typeof timeStrOrDate === 'string' && timeStrOrDate.includes(':')) {
    const parts = timeStrOrDate.split(':');
    h = parseInt(parts[0], 10) || 0;
    m = parseInt(parts[1], 10) || 0;
  } else {
    const now = new Date();
    h = now.getHours();
    m = now.getMinutes();
  }

  let roundedH = h;
  let roundedM;
  if (m < 15) {
    roundedM = 0;
  } else if (m < 45) {
    roundedM = 30;
  } else {
    roundedM = 0;
    roundedH = (h + 1) % 24;
  }

  return `${String(roundedH).padStart(2, '0')}:${String(roundedM).padStart(2, '0')}`;
};

export const VisitFormModal = ({
  isOpen,
  onClose,
  onVisitSaved,
  defaultPet = null,
  initialData = null
}) => {
  const { activeClinic, clinics } = useClinic();
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [includeTherapy, setIncludeTherapy] = useState(false);
  const [showReportPreview, setShowReportPreview] = useState(false);

  const [formData, setFormData] = useState({
    animaleId: defaultPet?._id || '',
    ambulatorioId: defaultPet?.ambulatorioId?._id || defaultPet?.ambulatorioId || activeClinic?._id || (clinics[0]?._id || ''),
    veterinarioId: user?._id || '',
    data: new Date().toISOString().split('T')[0],
    ora: roundTimeToHalfHour(),
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
    esami: [],
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
          veterinarioId: initialData.veterinarioId?._id || initialData.veterinarioId || user?._id || '',
          data: initialData.data ? initialData.data.split('T')[0] : new Date().toISOString().split('T')[0],
          ora: roundTimeToHalfHour(initialData.ora || '10:00'),
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
          esami: Array.isArray(initialData.esami) ? initialData.esami : [],
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
          veterinarioId: user?._id || prev.veterinarioId || '',
          data: new Date().toISOString().split('T')[0],
          ora: roundTimeToHalfHour(),
          pesoRilevato: defaultPet?.pesoAttuale || '',
          motivo: '',
          anamnesi: '',
          esameObiettivo: '',
          diagnosi: '',
          note: '',
          esami: []
        }));
        setIncludeTherapy(false);
      }
      setError('');
    }
  }, [isOpen, defaultPet, initialData, activeClinic, user]);

  const handleAddExam = () => {
    setFormData((prev) => ({
      ...prev,
      esami: [
        ...(prev.esami || []),
        {
          nome: '',
          tipologia: 'Interno',
          laboratorio: '',
          stato: 'In lavorazione',
          dataRichiesta: new Date().toISOString().split('T')[0],
          dataReferto: '',
          esito: '',
          fileAllegato: '',
          nomeFile: '',
          tipoFile: '',
          dimensioneFile: 0
        }
      ]
    }));
  };

  const handleUpdateExam = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.esami];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, esami: next };
    });
  };

  const handleRemoveExam = (index) => {
    setFormData((prev) => {
      const next = prev.esami.filter((_, i) => i !== index);
      return { ...prev, esami: next };
    });
  };

  const handleExamFileUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('È consentito allegare esclusivamente referti in formato PDF');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setError('Il file PDF dell\'esame non può superare la dimensione di 12 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => {
        const next = [...prev.esami];
        next[index] = {
          ...next[index],
          fileAllegato: reader.result,
          nomeFile: file.name,
          tipoFile: file.type,
          dimensioneFile: file.size,
          stato: next[index].tipologia === 'Esterno' ? 'Pronto' : next[index].stato
        };
        return { ...prev, esami: next };
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveExamFile = (index) => {
    setFormData((prev) => {
      const next = [...prev.esami];
      next[index] = {
        ...next[index],
        fileAllegato: '',
        nomeFile: '',
        tipoFile: '',
        dimensioneFile: 0
      };
      return { ...prev, esami: next };
    });
  };

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
        veterinarioId: formData.veterinarioId || user?._id,
        data: formData.data,
        ora: roundTimeToHalfHour(formData.ora),
        tipoVisita: formData.tipoVisita,
        motivo: formData.motivo,
        anamnesi: formData.anamnesi,
        esameObiettivo: formData.esameObiettivo,
        diagnosi: formData.diagnosi,
        esami: formData.esami || [],
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

  const petOptions = pets.map((p) => ({
    value: p._id,
    label: p.nome,
    sublabel: `${p.specie} • ${p.razza || 'Meticcio'} (Prop: ${p.proprietarioId?.cognome || 'N/D'})`
  }));

  const clinicOptions = clinics.map((c) => ({
    value: c._id,
    label: c.nome,
    sublabel: c.citta
  }));

  const selectedClinic = clinics.find((c) => c._id === formData.ambulatorioId) || activeClinic;
  const clinicVets = selectedClinic?.veterinari || [];
  const allVets = [...clinicVets];
  if (user && !allVets.some((v) => (v._id || v) === user._id)) {
    allVets.unshift(user);
  }
  const vetOptions = allVets.map((v) => ({
    value: v._id || v,
    label: `Dr. ${v.nome || ''} ${v.cognome || ''}`.trim() || 'Medico Veterinario',
    sublabel: v.codiceAlbo ? `Albo: ${v.codiceAlbo}` : (v.email || '')
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
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

            {/* Paziente e Medico Esecutore */}
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Paziente (Animale) *</label>
                <CustomSelect
                  id="visit-select-pet"
                  name="animaleId"
                  value={formData.animaleId}
                  onChange={(e) => {
                    const sel = pets.find((p) => p._id === e.target.value);
                    setFormData({
                      ...formData,
                      animaleId: e.target.value,
                      pesoRilevato: sel?.pesoAttuale || formData.pesoRilevato
                    });
                  }}
                  options={petOptions}
                  placeholder="Seleziona paziente..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medico Veterinario Esecutore *</label>
                <CustomSelect
                  id="visit-select-veterinario"
                  name="veterinarioId"
                  value={formData.veterinarioId}
                  onChange={(e) => setFormData({ ...formData, veterinarioId: e.target.value })}
                  options={vetOptions}
                  placeholder="Seleziona medico veterinario..."
                />
              </div>
            </div>

            {/* Ambulatorio e Tipo Visita */}
            <div className="form-row form-row-2">
              <div className="form-group">
                <label className="form-label">Ambulatorio di Riferimento *</label>
                <CustomSelect
                  id="visit-select-ambulatorio"
                  name="ambulatorioId"
                  value={formData.ambulatorioId}
                  onChange={(e) => setFormData({ ...formData, ambulatorioId: e.target.value })}
                  options={clinicOptions}
                  placeholder="Seleziona ambulatorio..."
                />
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
                <label className="form-label">Orario (intervallo 30m)</label>
                <input
                  id="visit-input-ora"
                  type="time"
                  step="1800"
                  className="form-input"
                  value={formData.ora}
                  onChange={(e) => setFormData({ ...formData, ora: e.target.value })}
                  onBlur={(e) => setFormData((prev) => ({ ...prev, ora: roundTimeToHalfHour(e.target.value) }))}
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

            {/* Avviso sincronizzazione automatica calendario */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.78rem',
                color: 'var(--primary)',
                backgroundColor: 'var(--primary-50)',
                padding: '0.45rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                border: '1px solid rgba(13, 148, 136, 0.2)'
              }}
            >
              <Calendar size={14} />
              <span>Questa visita clinica sarà registrata e visibile automaticamente sull'agenda giornaliera.</span>
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

            {/* Sezione Esami & Diagnostica Specialistica */}
            <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FlaskConical size={18} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-800)' }}>
                    Esami, Test & Indagini Specialistiche ({formData.esami?.length || 0})
                  </span>
                </div>
                <button
                  type="button"
                  id="btn-add-exam"
                  className="btn btn-sm btn-secondary"
                  onClick={handleAddExam}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--primary)', fontWeight: 600 }}
                >
                  <FlaskConical size={14} /> + Aggiungi Esame
                </button>
              </div>

              {formData.esami && formData.esami.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {formData.esami.map((esame, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '1rem',
                        position: 'relative'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                          Esame #{idx + 1}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          style={{ color: '#ef4444', padding: '2px 8px' }}
                          onClick={() => handleRemoveExam(idx)}
                          title="Rimuovi esame"
                        >
                          <Trash2 size={13} /> Rimuovi
                        </button>
                      </div>

                      <div className="form-row form-row-2">
                        <div className="form-group">
                          <label className="form-label">Nome Prestazione / Esame *</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Es. Emocromo, Biochimico, Radiografia torace..."
                            value={esame.nome}
                            onChange={(e) => handleUpdateExam(idx, 'nome', e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Tipologia Esame *</label>
                          <select
                            className="form-select"
                            value={esame.tipologia}
                            onChange={(e) => handleUpdateExam(idx, 'tipologia', e.target.value)}
                          >
                            <option value="Interno">Interno (Ambulatorio)</option>
                            <option value="Esterno">Esterno (Laboratorio)</option>
                          </select>
                        </div>
                      </div>

                      {esame.tipologia === 'Esterno' && (
                        <div className="form-row form-row-2" style={{ backgroundColor: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px dashed #cbd5e1', marginBottom: '0.75rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ color: 'var(--primary)' }}>
                              Nome Laboratorio Esterno *
                            </label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Es. IDEXX Laboratories, Lab San Marco, CDVet..."
                              value={esame.laboratorio || ''}
                              onChange={(e) => handleUpdateExam(idx, 'laboratorio', e.target.value)}
                              required={esame.tipologia === 'Esterno'}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ color: 'var(--primary)' }}>
                              Stato Lavorazione *
                            </label>
                            <select
                              className="form-select"
                              value={esame.stato || 'In lavorazione'}
                              onChange={(e) => handleUpdateExam(idx, 'stato', e.target.value)}
                            >
                              <option value="In lavorazione">⏳ In lavorazione (Inviato)</option>
                              <option value="Pronto">✅ Pronto / Refertato</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="form-row form-row-2">
                        <div className="form-group">
                          <label className="form-label">Esito / Note Referto</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Es. Valori nella norma, lieve leucocitosi..."
                            value={esame.esito || ''}
                            onChange={(e) => handleUpdateExam(idx, 'esito', e.target.value)}
                          />
                        </div>

                        {/* File Upload PDF */}
                        <div className="form-group">
                          <label className="form-label">Referto PDF Allegato</label>
                          {esame.fileAllegato ? (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: '#f0fdfa',
                                border: '1px solid #99f6e4',
                                padding: '0.55rem 0.85rem',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                gap: '0.5rem',
                                flexWrap: 'wrap'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f766e', overflow: 'hidden', minWidth: '150px' }}>
                                <Paperclip size={15} style={{ flexShrink: 0 }} />
                                <span style={{ fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {esame.nomeFile || 'referto.pdf'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = esame.fileAllegato;
                                    link.download = esame.nomeFile || 'referto_esame.pdf';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  title="Visualizza o scarica il file allegato"
                                >
                                  <Download size={13} />
                                  <span>Visualizza</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-secondary"
                                  onClick={() => handleRemoveExamFile(idx)}
                                  style={{
                                    padding: '0.25rem 0.55rem',
                                    fontSize: '0.78rem',
                                    color: '#ef4444',
                                    borderColor: '#fca5a5',
                                    backgroundColor: '#ffffff',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Rimuovi il referto PDF allegato a questo esame"
                                >
                                  <Trash2 size={13} />
                                  <span>Rimuovi Allegato</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.4rem',
                                padding: '0.5rem 0.75rem',
                                background: '#ffffff',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                color: 'var(--slate-600)'
                              }}
                            >
                              <Upload size={14} color="var(--primary)" />
                              <span>Allega PDF Referto (max 12MB)</span>
                              <input
                                type="file"
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                onChange={(e) => handleExamFileUpload(idx, e)}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    color: 'var(--slate-400)',
                    fontSize: '0.84rem'
                  }}
                >
                  Nessun esame o indagine registrata. Clicca su "+ Aggiungi Esame" per inserire esami interni o inviati a laboratorio.
                </div>
              )}
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

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {initialData && (
                <button
                  type="button"
                  id="btn-print-from-visit-form"
                  className="btn btn-secondary"
                  onClick={() => setShowReportPreview(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: 'var(--primary)',
                    fontWeight: '700'
                  }}
                >
                  <Printer size={15} />
                  <span>Anteprima Referto</span>
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Annulla
              </button>
              <button id="btn-save-visit" type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvataggio in corso...' : initialData ? 'Salva Modifiche' : 'Registra Visita'}
              </button>
            </div>
          </div>
        </form>

        {/* Modale Referto Ufficiale & Stampa PDF */}
        <VisitReportModal
          isOpen={showReportPreview}
          onClose={() => setShowReportPreview(false)}
          visit={initialData}
        />
      </div>
    </div>
  );
};
