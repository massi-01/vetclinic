import React, { useState, useEffect } from 'react';
import { X, Building2, Search, Send, CheckCircle2, AlertCircle, Clock, MapPin, Phone, UserCheck } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import { api } from '../../services/api';

export const ClinicFormModal = ({ isOpen, onClose, onClinicSaved, initialData = null }) => {
  const { refreshClinics } = useClinic();

  // Tab mode: 'create' | 'join' (only if !initialData)
  const [activeTab, setActiveTab] = useState('create');

  // Form data for creating/editing a clinic
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

  // States for "Accedi a Sede Esistente"
  const [searchQuery, setSearchQuery] = useState('');
  const [availableClinics, setAvailableClinics] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setRequestSuccess('');
      setSelectedClinicId(null);
      setRequestMessage('');
      setSearchQuery('');

      if (initialData) {
        setActiveTab('create');
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
    }
  }, [isOpen, initialData]);

  // Carica ambulatori disponibili quando si seleziona il tab "join" o cambia searchQuery
  const loadAvailableClinics = async (search = '') => {
    try {
      setLoadingAvailable(true);
      const res = await api.clinics.getAvailable(search);
      if (res.success) {
        setAvailableClinics(res.data || []);
      }
    } catch (err) {
      console.error('Errore caricamento ambulatori disponibili:', err.message);
    } finally {
      setLoadingAvailable(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'join' && !initialData) {
      const timer = setTimeout(() => {
        loadAvailableClinics(searchQuery);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, searchQuery]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadAvailableClinics(searchQuery);
  };

  const handleCreateSubmit = async (e) => {
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

  const handleSendRequest = async () => {
    if (!selectedClinicId) {
      setError('Seleziona una sede prima di inviare la richiesta');
      return;
    }

    try {
      setSendingRequest(true);
      setError('');
      const res = await api.clinics.sendRequest({
        ambulatorioId: selectedClinicId,
        messaggio: requestMessage
      });

      if (res.success) {
        setRequestSuccess("Richiesta inviata con successo! Il gestore della sede la esaminerà.");
        if (onClinicSaved) onClinicSaved();
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Errore nell'invio della richiesta");
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} />
            </div>
            <h2 className="modal-title">
              {initialData ? 'Modifica Sede Ambulatorio' : 'Configurazione Sede Ambulatorio'}
            </h2>
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher per creazione o associazione a sede esistente */}
        {!initialData && (
          <div
            style={{
              display: 'flex',
              padding: '0.5rem 1.5rem 0',
              backgroundColor: 'var(--slate-50)',
              borderBottom: '1px solid var(--border-color)',
              gap: '0.75rem'
            }}
          >
            <button
              id="tab-create-clinic"
              type="button"
              className="btn btn-sm"
              style={{
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === 'create' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                backgroundColor: activeTab === 'create' ? '#ffffff' : 'transparent',
                color: activeTab === 'create' ? 'var(--primary)' : 'var(--slate-600)',
                fontWeight: activeTab === 'create' ? '800' : '600',
                padding: '0.6rem 1rem'
              }}
              onClick={() => {
                setActiveTab('create');
                setError('');
              }}
            >
              <Building2 size={16} /> Crea Nuova Sede
            </button>
            <button
              id="tab-join-clinic"
              type="button"
              className="btn btn-sm"
              style={{
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === 'join' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                backgroundColor: activeTab === 'join' ? '#ffffff' : 'transparent',
                color: activeTab === 'join' ? 'var(--primary)' : 'var(--slate-600)',
                fontWeight: activeTab === 'join' ? '800' : '600',
                padding: '0.6rem 1rem'
              }}
              onClick={() => {
                setActiveTab('join');
                setError('');
              }}
            >
              <UserCheck size={16} /> Accedi a Sede Esistente
            </button>
          </div>
        )}

        {/* CONTENUTO TAB 1: CREA NUOVA SEDE */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
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
        )}

        {/* CONTENUTO TAB 2: ACCEDI A SEDE ESISTENTE */}
        {activeTab === 'join' && !initialData && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--rose-50)', color: 'var(--rose-500)', fontSize: '0.85rem' }}>
                  {error}
                </div>
              )}

              {requestSuccess && (
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: '#047857', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  {requestSuccess}
                </div>
              )}

              <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.45 }}>
                Seleziona la struttura veterinaria alla quale desideri aggregarti. Il responsabile/gestore della sede riceverà la tua richiesta e, previa approvazione, ti abiliterà alla consultazione e gestione delle cartelle cliniche dei pazienti.
              </div>

              {/* Barra di Ricerca Sedi */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                  <input
                    id="input-search-available-clinics"
                    type="text"
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Cerca per nome clinica, città o via..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-secondary">
                  Cerca
                </button>
              </form>

              {/* Lista Sedi Disponibili */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: '600' }}>
                <span>Ambulatori registrati trovati ({availableClinics.length})</span>
                {selectedClinicId && <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Sede selezionata ✓</span>}
              </div>

              <div
                style={{
                  maxHeight: '320px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem',
                  backgroundColor: 'var(--slate-50)'
                }}
              >
                {loadingAvailable ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                    Ricerca delle strutture in corso...
                  </div>
                ) : availableClinics.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
                    Nessun ambulatorio trovato. Modifica i termini di ricerca o creane uno nuovo dal tab precedente.
                  </div>
                ) : (
                  availableClinics.map((clinic) => {
                    const isSelected = selectedClinicId === clinic._id;
                    const isMember = clinic.giaAssociata;
                    const hasPending = clinic.richiestaEsistente?.stato === 'IN_ATTESA';
                    const hasRejected = clinic.richiestaEsistente?.stato === 'RIFIUTATA';
                    const isClickable = !isMember && !hasPending;
                    const gestoreName = clinic.creatoreId ? `Dott. ${clinic.creatoreId.nome} ${clinic.creatoreId.cognome}` : 'Gestore della sede';

                    return (
                      <div
                        key={clinic._id}
                        id={`clinic-option-${clinic._id}`}
                        onClick={() => {
                          if (isClickable) {
                            setSelectedClinicId(clinic._id);
                            setError('');
                          }
                        }}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                          cursor: isClickable ? 'pointer' : 'not-allowed',
                          opacity: isMember ? 0.75 : hasPending ? 0.7 : 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                          boxShadow: isSelected ? '0 2px 8px rgba(13, 148, 136, 0.15)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <div style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '0.98rem' }}>
                            {clinic.nome}
                          </div>
                          
                          {isMember && (
                            <span className="badge badge-status-active" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem' }}>
                              <CheckCircle2 size={11} /> Già associata al tuo profilo
                            </span>
                          )}
                          {!isMember && hasPending && (
                            <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem' }}>
                              <Clock size={11} /> Richiesta Inviata (In attesa)
                            </span>
                          )}
                          {!isMember && hasRejected && (
                            <span className="badge" style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', fontSize: '0.72rem' }}>
                              Precedentemente Rifiutata (puoi riprovare)
                            </span>
                          )}
                          {isClickable && !isSelected && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '600' }}>
                              Seleziona per richiedere accesso
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} /> {clinic.indirizzo}, {clinic.citta}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={13} /> {clinic.telefono}
                          </span>
                          <span style={{ fontWeight: '600', color: 'var(--slate-700)' }}>
                            Gestore: {gestoreName}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Messaggio di Richiesta Opzionale */}
              {selectedClinicId && (
                <div className="form-group" style={{ marginTop: '0.25rem' }}>
                  <label className="form-label">
                    Messaggio / Presentazione per il Gestore (Opzionale)
                  </label>
                  <textarea
                    id="input-request-message"
                    className="form-input"
                    rows="2"
                    placeholder="Es. Salve, collaboro come medico veterinario e vorrei poter inserire le visite dei pazienti per questa sede..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={sendingRequest}>
                Annulla
              </button>
              <button
                id="btn-send-clinic-request"
                type="button"
                className="btn btn-primary"
                disabled={!selectedClinicId || sendingRequest}
                onClick={handleSendRequest}
              >
                <Send size={15} /> {sendingRequest ? 'Invio in corso...' : 'Invia Richiesta di Accesso'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
