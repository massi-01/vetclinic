import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit2,
  CheckCircle2,
  UserCheck,
  Check,
  X,
  AlertTriangle,
  Send,
  HelpCircle,
  Clock3
} from 'lucide-react';
import { useClinic } from '../context/ClinicContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ClinicsPage = ({ onNewClinic, onEditClinic }) => {
  const { clinics, activeClinic, switchClinic, refreshClinics } = useClinic();
  const { user } = useAuth();

  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const loadRequests = async () => {
    try {
      setLoadingRequests(true);
      const [sentRes, recvRes] = await Promise.all([
        api.clinics.getSentRequests(),
        api.clinics.getReceivedRequests()
      ]);
      if (sentRes.success) setSentRequests(sentRes.data || []);
      if (recvRes.success) setReceivedRequests(recvRes.data || []);
    } catch (err) {
      console.error('Errore nel caricamento delle richieste sedi:', err.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [clinics]);

  const handleRespond = async (requestId, action) => {
    try {
      setActionInProgress(requestId);
      setFeedbackMessage(null);
      const res = await api.clinics.respondRequest(requestId, { action });
      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: action === 'APPROVE' ? 'Richiesta accettata! Il veterinario è ora associato alla sede.' : 'Richiesta rifiutata.'
        });
        await Promise.all([loadRequests(), refreshClinics()]);
      }
    } catch (err) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Errore durante la gestione della richiesta'
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const pendingReceived = receivedRequests.filter((r) => r.stato === 'IN_ATTESA');

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--slate-900)' }}>
            I Miei Ambulatori & Cliniche
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Gestisci le sedi operative, accedi a strutture esistenti o approva nuovi collaboratori
          </p>
        </div>

        <button
          id="btn-add-clinic-page"
          className="btn btn-primary"
          onClick={() => {
            if (onNewClinic) onNewClinic();
          }}
        >
          <Plus size={16} /> Configura / Nuova Sede
        </button>
      </div>

      {/* Feedback banner */}
      {feedbackMessage && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: feedbackMessage.type === 'success' ? '#ecfdf5' : 'var(--rose-50)',
            color: feedbackMessage.type === 'success' ? '#065f46' : 'var(--rose-600)',
            border: `1px solid ${feedbackMessage.type === 'success' ? '#a7f3d0' : 'rgba(239, 68, 68, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.875rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            className="btn btn-icon btn-sm"
            onClick={() => setFeedbackMessage(null)}
            style={{ color: 'inherit' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* SEZIONE 1: RICHIESTE DI ACCESSO RICEVUTE (PER GESTORI) */}
      {pendingReceived.length > 0 && (
        <div
          id="section-received-requests"
          className="card"
          style={{
            border: '2px solid #3b82f6',
            backgroundColor: '#f8faff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e3a8a' }}>
                  Richieste di Accesso Ricevute ({pendingReceived.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                  Altri veterinari hanno chiesto di aggregarsi alle strutture di cui sei gestore
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {pendingReceived.map((req) => {
              const vet = req.veterinarioId;
              const clinic = req.ambulatorioId;
              const isWorking = actionInProgress === req._id;

              return (
                <div
                  key={req._id}
                  id={`received-request-${req._id}`}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '1rem' }}>
                        Dott. {vet?.nome} {vet?.cognome}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginTop: '2px', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {vet?.codiceAlbo && (
                          <span>Albo: <strong>{vet.codiceAlbo}</strong></span>
                        )}
                        {vet?.email && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Mail size={12} /> {vet.email}
                          </span>
                        )}
                        {vet?.telefono && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Phone size={12} /> {vet.telefono}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '700', marginTop: '4px' }}>
                        Richiesta per: {clinic?.nome} ({clinic?.citta})
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'center' }}>
                      <button
                        id={`btn-reject-request-${req._id}`}
                        className="btn btn-sm btn-secondary"
                        disabled={isWorking}
                        onClick={() => handleRespond(req._id, 'REJECT')}
                        style={{ color: 'var(--rose-600)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      >
                        <X size={14} /> Rifiuta
                      </button>
                      <button
                        id={`btn-approve-request-${req._id}`}
                        className="btn btn-sm btn-primary"
                        disabled={isWorking}
                        onClick={() => handleRespond(req._id, 'APPROVE')}
                        style={{ backgroundColor: '#059669', borderColor: '#047857' }}
                      >
                        <Check size={14} /> {isWorking ? 'Elaborazione...' : 'Accetta Richiesta'}
                      </button>
                    </div>
                  </div>

                  {req.messaggio && (
                    <div style={{ fontSize: '0.85rem', fontStyle: 'italic', backgroundColor: 'var(--slate-50)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', color: 'var(--slate-700)', borderLeft: '3px solid var(--primary)' }}>
                      "{req.messaggio}"
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> Richiesta inviata il {new Date(req.dataRichiesta || req.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEZIONE 2: I MIEI AMBULATORI COLLEGATI */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-800)' }}>
            Sedi Operative Associate ({clinics.length})
          </h2>
        </div>

        {clinics.length === 0 ? (
          <div
            className="card"
            style={{
              padding: '2rem 1.5rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: '#fffbeb',
              border: '1.5px dashed #f59e0b'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={24} />
            </div>
            <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#92400e' }}>
              Nessun ambulatorio attualmente associato
            </div>
            <p style={{ fontSize: '0.85rem', color: '#b45309', maxWidth: '460px', margin: 0 }}>
              Per poter registrare visite, pazienti e appuntamenti, configura la tua prima sede oppure richiedi l'accesso a un ambulatorio esistente gestito da un collega.
            </p>
            <button
              id="btn-empty-add-clinic"
              className="btn btn-primary"
              style={{ backgroundColor: '#d97706', borderColor: '#b45309', marginTop: '0.5rem' }}
              onClick={() => onNewClinic && onNewClinic()}
            >
              <Plus size={16} /> Configura o Accedi a una Sede
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {clinics.map((clinic) => {
              const isActive = activeClinic?._id === clinic._id;
              const isCreator = clinic.creatoreId?._id === user?._id || clinic.creatoreId === user?._id;

              return (
                <div
                  key={clinic._id}
                  className="card"
                  style={{
                    border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: clinic.coloreTema || 'var(--primary)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                      >
                        <Building2 size={24} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--slate-900)' }}>
                            {clinic.nome}
                          </h2>
                          {isActive && (
                            <span className="badge badge-status-active" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={12} /> Sede Correntemente Attiva
                            </span>
                          )}
                          {isCreator ? (
                            <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '700' }}>
                              Gestore / Creatore
                            </span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                              Collaboratore Associato
                            </span>
                          )}
                          {clinic.prontoSoccorso24h && (
                            <span className="badge" style={{ backgroundColor: 'var(--rose-50)', color: 'var(--rose-500)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                              Pronto Soccorso 24h
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <MapPin size={14} /> {clinic.indirizzo}, {clinic.cap ? `${clinic.cap} ` : ''}{clinic.citta}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {onEditClinic && (
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => onEditClinic(clinic)}
                        >
                          <Edit2 size={14} /> Modifica
                        </button>
                      )}
                      {!isActive && (
                        <button
                          id={`btn-select-clinic-${clinic._id}`}
                          className="btn btn-sm btn-primary"
                          onClick={() => switchClinic(clinic._id)}
                        >
                          Seleziona Sede
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Detailed Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '0.85rem',
                      backgroundColor: 'var(--slate-50)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>
                        RECAPITI
                      </div>
                      <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--slate-700)' }}>
                          <Phone size={13} color="var(--primary)" /> <strong>{clinic.telefono}</strong>
                        </div>
                        {clinic.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--slate-600)' }}>
                            <Mail size={13} color="var(--slate-400)" /> {clinic.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>
                        ORARI DI RICEVIMENTO
                      </div>
                      <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--slate-700)' }}>
                        <Clock size={13} color="var(--primary)" /> {clinic.orariApertura || 'Orario continuato'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: '700', textTransform: 'uppercase' }}>
                        DATI FISCALI
                      </div>
                      <div style={{ marginTop: '4px', color: 'var(--slate-600)' }}>
                        {clinic.partitaIva && <div>P.IVA: <code>{clinic.partitaIva}</code></div>}
                        {clinic.codiceFiscale && <div>C.F.: <code>{clinic.codiceFiscale}</code></div>}
                        {!clinic.partitaIva && !clinic.codiceFiscale && <div>Non specificati</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEZIONE 3: LE MIE RICHIESTE DI ACCESSO INVIATE */}
      {sentRequests.length > 0 && (
        <div id="section-sent-requests" style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Send size={18} color="var(--slate-600)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-800)' }}>
              Le Mie Richieste di Accesso Inviate ({sentRequests.length})
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sentRequests.map((req) => {
              const clinic = req.ambulatorioId;
              const gestore = req.gestoreId;

              let badgeStyle = { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
              let statusLabel = 'In attesa di approvazione';
              let statusIcon = <Clock3 size={12} />;

              if (req.stato === 'ACCETTATA') {
                badgeStyle = { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
                statusLabel = 'Accettata - Accesso abilitato';
                statusIcon = <CheckCircle2 size={12} />;
              } else if (req.stato === 'RIFIUTATA') {
                badgeStyle = { backgroundColor: 'var(--rose-50)', color: 'var(--rose-600)', border: '1px solid rgba(239,68,68,0.2)' };
                statusLabel = 'Rifiutata dal gestore';
                statusIcon = <X size={12} />;
              }

              return (
                <div
                  key={req._id}
                  id={`sent-request-${req._id}`}
                  className="card"
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    borderLeft: req.stato === 'ACCETTATA' ? '4px solid #059669' : req.stato === 'RIFIUTATA' ? '4px solid #ef4444' : '4px solid #f59e0b'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Building2 size={18} color="var(--primary)" />
                      <div style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '0.98rem' }}>
                        {clinic?.nome || 'Ambulatorio'}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        ({clinic?.citta})
                      </span>
                    </div>

                    <span className="badge" style={{ ...badgeStyle, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                      {statusIcon}
                      {statusLabel}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                    {gestore && (
                      <span>Gestore: <strong>Dott. {gestore.nome} {gestore.cognome}</strong></span>
                    )}
                    <span>
                      Inviata il: {new Date(req.dataRichiesta || req.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {req.dataRisposta && (
                      <span>
                        Riscontro del: {new Date(req.dataRisposta).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {req.messaggio && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', backgroundColor: 'var(--slate-50)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Il tuo messaggio:</strong> "{req.messaggio}"
                    </div>
                  )}

                  {req.noteRisposta && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', backgroundColor: '#f0fdf4', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Nota del gestore:</strong> "{req.noteRisposta}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
