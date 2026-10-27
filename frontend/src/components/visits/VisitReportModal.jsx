import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  ExternalLink,
  Stethoscope,
  Heart,
  User,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  Pill,
  Activity,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const VisitReportModal = ({ isOpen, onClose, visit: initialVisit, visitId, pet: defaultPet }) => {
  const { activeClinic } = useClinic();
  const { user } = useAuth();
  const [visit, setVisit] = useState(initialVisit || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setError('');
      return;
    }

    // Se initialVisit è fornito, aggiorna immediatamente lo stato locale
    if (initialVisit) {
      const cleanInitial = initialVisit?._doc ? { ...initialVisit._doc, ...initialVisit } : initialVisit;
      setVisit(cleanInitial);
    }

    const targetId = initialVisit?._id || visitId;
    if (targetId) {
      // Se abbiamo già dati completi (inclusi animaleId e motivo), non bloccare con spinner full screen
      const hasCompleteInitial = Boolean(
        initialVisit &&
        initialVisit.motivo &&
        initialVisit.animaleId &&
        typeof initialVisit.animaleId === 'object'
      );
      loadFullVisitDetails(targetId, hasCompleteInitial);
    } else if (initialVisit) {
      setLoading(false);
    }
  }, [isOpen, initialVisit, visitId]);

  const loadFullVisitDetails = async (id, hasCompleteInitial) => {
    try {
      if (!hasCompleteInitial) {
        setLoading(true);
      }
      setError('');
      const res = await api.visits.getById(id);
      if (res.success && res.data) {
        const raw = res.data;
        const clean = raw?._doc ? { ...raw._doc, ...raw } : raw;
        setVisit((prev) => {
          return {
            ...(prev || {}),
            ...clean,
            animaleId: (clean.animaleId && typeof clean.animaleId === 'object')
              ? clean.animaleId
              : (prev?.animaleId || defaultPet),
            ambulatorioId: (clean.ambulatorioId && typeof clean.ambulatorioId === 'object')
              ? clean.ambulatorioId
              : (prev?.ambulatorioId || activeClinic),
            veterinarioId: (clean.veterinarioId && typeof clean.veterinarioId === 'object')
              ? clean.veterinarioId
              : (prev?.veterinarioId || user),
            terapiePrescritte: Array.isArray(clean.terapiePrescritte)
              ? clean.terapiePrescritte
              : (prev?.terapiePrescritte || [])
          };
        });
      }
    } catch (err) {
      console.error('Errore caricamento dettagli referto:', err);
      if (!hasCompleteInitial && !visit && !initialVisit) {
        setError('Impossibile caricare i dati completi della visita');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Risoluzione robusta delle entità collegate con fallback intelligente
  const pet = (visit?.animaleId && typeof visit.animaleId === 'object')
    ? visit.animaleId
    : (defaultPet && typeof defaultPet === 'object' ? defaultPet : null);

  const owner = (pet?.proprietarioId && typeof pet.proprietarioId === 'object')
    ? pet.proprietarioId
    : (visit?.proprietarioId && typeof visit.proprietarioId === 'object' ? visit.proprietarioId : null);

  const clinic = (visit?.ambulatorioId && typeof visit.ambulatorioId === 'object')
    ? visit.ambulatorioId
    : (activeClinic || null);

  const vet = (visit?.veterinarioId && typeof visit.veterinarioId === 'object')
    ? visit.veterinarioId
    : (user ? { nome: user.nome, cognome: user.cognome, codiceAlbo: user.codiceAlbo, email: user.email, telefono: user.telefono } : null);

  const therapies = Array.isArray(visit?.terapiePrescritte) ? visit.terapiePrescritte : [];

  const visitDateFormatted = visit?.data
    ? new Date(visit.data).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : new Date().toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

  const protocolNumber = `REF-${visit?._id ? visit._id.toString().slice(-6).toUpperCase() : 'VISITA'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPrintWindow = () => {
    const printContent = document.getElementById('printable-visit-report');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Consentire i popup per aprire la finestra di stampa.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="it">
      <head>
        <meta charset="UTF-8">
        <title>Referto Visita - ${pet?.nome || 'Paziente'}</title>
        <style>
          @page { size: A4 portrait; margin: 12mm 15mm; }
          body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 15px;
            color: #0f172a;
            background: #ffffff;
            font-size: 11pt;
            line-height: 1.5;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          * { box-sizing: border-box; }
          .visit-report-sheet { width: 100%; max-width: 100%; margin: 0; padding: 0; }
          .report-clinic-header { display: flex; justify-content: space-between; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
          .report-title-banner { background: #0f172a !important; color: #ffffff !important; padding: 8px 14px; border-radius: 6px; display: flex; justify-content: space-between; margin-bottom: 16px; font-weight: bold; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .report-grid-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
          .report-box { background: #f8fafc !important; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .report-box-title { font-size: 8.5pt; font-weight: 800; text-transform: uppercase; color: #0d9488; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; display: flex; align-items: center; gap: 4px; }
          .report-info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 9.5pt; }
          .report-info-label { color: #64748b; }
          .report-info-value { font-weight: bold; color: #0f172a; }
          .report-vitals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
          .report-vital-card { background: #ffffff !important; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center; }
          .report-section { margin-bottom: 14px; break-inside: avoid; }
          .report-section-title { font-size: 9pt; font-weight: 800; text-transform: uppercase; color: #1e293b; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
          .report-text-block { background: #ffffff !important; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px 14px; font-size: 9.5pt; white-space: pre-wrap; }
          .report-therapy-table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 6px; }
          .report-therapy-table th { background: #f1f5f9 !important; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .report-therapy-table td { padding: 6px 10px; border: 1px solid #cbd5e1; }
          .report-signature-block { margin-top: 28px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #cbd5e1; padding-top: 16px; break-inside: avoid; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '880px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          background: 'var(--bg-app)'
        }}
      >
        {/* Modal Top Toolbar (Non-printable) */}
        <div
          className="no-print"
          style={{
            padding: '1rem 1.5rem',
            background: '#ffffff',
            borderBottom: '1px solid var(--slate-200)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--slate-900)', margin: 0 }}>
                Referto Visita Clinica
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Protocollo {protocolNumber} • {pet?.nome ? `Paziente: ${pet.nome}` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button
              id="btn-print-visit-direct"
              className="btn btn-primary"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem' }}
            >
              <Printer size={16} />
              <span>Stampa / Salva in PDF</span>
            </button>

            <button
              id="btn-print-visit-window"
              className="btn btn-secondary"
              onClick={handleOpenPrintWindow}
              title="Apri documento in una nuova finestra per la stampa"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 0.9rem' }}
            >
              <ExternalLink size={15} />
              <span>Nuova Scheda</span>
            </button>

            <button
              id="btn-close-visit-report"
              className="btn btn-icon btn-secondary"
              onClick={onClose}
              aria-label="Chiudi"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <LoadingSpinner size="md" message="Generazione documento clinico in corso..." />
            </div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--rose-500)' }}>
              <AlertCircle size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div>{error}</div>
            </div>
          ) : !visit ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-400)' }}>
              Nessun dato di visita disponibile
            </div>
          ) : (
            /* Printable Sheet Container */
            <div id="printable-visit-report" className="visit-report-sheet">
              {/* Header / Intestazione Clinica */}
              <div className="report-clinic-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#0d9488',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      🩺
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
                      {clinic?.nome || 'Clinica Veterinaria'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--slate-600)', lineHeight: '1.4' }}>
                    {clinic?.indirizzo && <div>{clinic.indirizzo} - {clinic.cap} {clinic.citta}</div>}
                    <div>
                      {clinic?.telefono && <span>Tel: <strong>{clinic.telefono}</strong></span>}
                      {clinic?.email && <span> • Email: {clinic.email}</span>}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--slate-600)', lineHeight: '1.45' }}>
                  {clinic?.partitaIva && <div>P.IVA: <strong>{clinic.partitaIva}</strong></div>}
                  {clinic?.codiceFiscale && <div>C.F.: <strong>{clinic.codiceFiscale}</strong></div>}
                  {clinic?.direttoreSanitario && (
                    <div style={{ marginTop: '0.2rem', color: 'var(--slate-700)' }}>
                      Dir. Sanitario: <strong>{clinic.direttoreSanitario}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Protocol Banner */}
              <div className="report-title-banner">
                <div>
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.92rem' }}>
                    REFERTO DI VISITA CLINICA ED ESAME OBIETTIVO
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', opacity: 0.95, textAlign: 'right' }}>
                  <span>{protocolNumber}</span> • Data: <strong>{visitDateFormatted}</strong> (Ore {visit.ora || '09:00'})
                </div>
              </div>

              {/* Patient & Owner Anamorphic Box (2 Columns) */}
              <div className="report-grid-two-col">
                {/* Colonna 1: Paziente */}
                <div className="report-box">
                  <div className="report-box-title">
                    <Heart size={14} /> Paziente Animale
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Nome:</span>
                    <span className="report-info-value" style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                      {pet?.nome || 'Paziente non specificato'}
                    </span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Specie / Razza:</span>
                    <span className="report-info-value">
                      {pet?.specie || 'N/D'} - {pet?.razza || 'Meticcio'}
                    </span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Sesso:</span>
                    <span className="report-info-value">{pet?.sesso || 'N/D'}</span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Microchip:</span>
                    <span className="report-info-value" style={{ fontFamily: 'monospace' }}>
                      {pet?.microchip || 'Non presente'}
                    </span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Data Nascita:</span>
                    <span className="report-info-value">
                      {pet?.dataNascita ? new Date(pet.dataNascita).toLocaleDateString('it-IT') : 'N/D'}
                    </span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Colore Mantello:</span>
                    <span className="report-info-value">{pet?.coloreMantello || 'Non specificato'}</span>
                  </div>
                </div>

                {/* Colonna 2: Proprietario */}
                <div className="report-box">
                  <div className="report-box-title">
                    <User size={14} /> Proprietario / Detentore
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Intestatario:</span>
                    <span className="report-info-value">
                      {owner ? `${owner.nome} ${owner.cognome}` : 'N/D'}
                    </span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Codice Fiscale:</span>
                    <span className="report-info-value" style={{ fontFamily: 'monospace' }}>
                      {owner?.codiceFiscale || 'Non registrato'}
                    </span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Recapito Telefonico:</span>
                    <span className="report-info-value">
                      {owner?.telefono || 'N/D'}
                    </span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Indirizzo:</span>
                    <span className="report-info-value">
                      {owner?.indirizzo ? `${owner.indirizzo}, ${owner.citta || ''}` : 'N/D'}
                    </span>
                  </div>
                  <div className="report-info-row">
                    <span className="report-info-label">Email:</span>
                    <span className="report-info-value">{owner?.email || 'N/D'}</span>
                  </div>
                </div>
              </div>

              {/* Parametri Vitali Rilevati */}
              {visit.parametriVitali && (
                <div className="report-section">
                  <div className="report-section-title">
                    <Activity size={14} /> Parametri Vitali & Rilievi Fisici
                  </div>
                  <div className="report-vitals-grid">
                    <div className="report-vital-card">
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: '600', textTransform: 'uppercase' }}>
                        Temperatura
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--slate-900)', marginTop: '2px' }}>
                        {visit.parametriVitali.temperatura ? `${visit.parametriVitali.temperatura} °C` : 'N/R'}
                      </div>
                    </div>
                    <div className="report-vital-card">
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: '600', textTransform: 'uppercase' }}>
                        Frequenza Cardiaca
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--slate-900)', marginTop: '2px' }}>
                        {visit.parametriVitali.frequenzaCardiaca ? `${visit.parametriVitali.frequenzaCardiaca} bpm` : 'N/R'}
                      </div>
                    </div>
                    <div className="report-vital-card">
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: '600', textTransform: 'uppercase' }}>
                        Freq. Respiratoria
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--slate-900)', marginTop: '2px' }}>
                        {visit.parametriVitali.frequenzaRespiratoria ? `${visit.parametriVitali.frequenzaRespiratoria} a/m` : 'N/R'}
                      </div>
                    </div>
                    <div className="report-vital-card">
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: '600', textTransform: 'uppercase' }}>
                        Peso Rilevato
                      </div>
                      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--slate-900)', marginTop: '2px' }}>
                        {visit.parametriVitali.pesoRilevato ? `${visit.parametriVitali.pesoRilevato} kg` : (pet?.pesoAttuale ? `${pet.pesoAttuale} kg` : 'N/R')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dettagli Clinici */}
              <div className="report-section">
                <div className="report-section-title">
                  <Stethoscope size={14} /> Tipologia & Motivo della Visita
                </div>
                <div className="report-text-block">
                  <div style={{ marginBottom: '0.35rem' }}>
                    <strong>Tipo Prestazione: </strong>
                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{visit.tipoVisita || 'Controllo Generale'}</span>
                    <span style={{ marginLeft: '1rem', color: 'var(--slate-500)', fontSize: '0.8rem' }}>
                      (Stato: <strong>{visit.stato || 'Completata'}</strong>)
                    </span>
                  </div>
                  <div>
                    <strong>Motivo del Consulto: </strong>
                    {visit.motivo}
                  </div>
                </div>
              </div>

              {/* Anamnesi */}
              {visit.anamnesi && (
                <div className="report-section">
                  <div className="report-section-title">Anamnesi Clinica Riferita</div>
                  <div className="report-text-block">{visit.anamnesi}</div>
                </div>
              )}

              {/* Esame Obiettivo */}
              {visit.esameObiettivo && (
                <div className="report-section">
                  <div className="report-section-title">Esame Obiettivo Generale e Particolare (EOG / EOP)</div>
                  <div className="report-text-block">{visit.esameObiettivo}</div>
                </div>
              )}

              {/* Diagnosi */}
              <div className="report-section">
                <div className="report-section-title">
                  <Activity size={14} /> Diagnosi & Giudizio Clinico
                </div>
                <div
                  className="report-text-block"
                  style={{
                    backgroundColor: '#f0fdfa',
                    border: '1px solid #99f6e4',
                    fontWeight: '600',
                    color: '#0f766e'
                  }}
                >
                  {visit.diagnosi || 'Esame nella norma, nessun reperto patologico rilevato al momento della visita.'}
                </div>
              </div>

              {/* Terapie & Prescrizioni Farmacologiche */}
              {therapies.length > 0 && (
                <div className="report-section">
                  <div className="report-section-title">
                    <Pill size={14} /> Prescrizioni Farmacologiche & Terapie Assegnate
                  </div>
                  <table className="report-therapy-table">
                    <thead>
                      <tr>
                        <th>Farmaco & Principio</th>
                        <th>Dosaggio & Via</th>
                        <th>Posologia & Frequenza</th>
                        <th>Durata</th>
                        <th>Istruzioni d'uso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {therapies.map((t, idx) => (
                        <tr key={t._id || idx}>
                          <td>
                            <strong>{t.nomeFarmaco}</strong>
                            {t.principioAttivo && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>({t.principioAttivo})</div>}
                          </td>
                          <td>
                            {t.dosaggio || 'Standard'}<br />
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.viaSomministrazione || 'Orale'}</span>
                          </td>
                          <td>{t.posologia}</td>
                          <td>{t.durataGiorni ? `${t.durataGiorni} giorni` : 'Al bisogno'}</td>
                          <td>{t.istruzioni || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Note e Raccomandazioni per il Proprietario */}
              {visit.note && (
                <div className="report-section">
                  <div className="report-section-title">Raccomandazioni & Indicazioni per il Proprietario</div>
                  <div className="report-text-block">{visit.note}</div>
                </div>
              )}

              {/* Allergie note (promemoria di sicurezza) */}
              {pet?.allergie && pet.allergie.length > 0 && (
                <div style={{ marginTop: '0.85rem', padding: '0.55rem 0.85rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.82rem', color: '#991b1b' }}>
                  <strong>⚠️ Attenzione - Allergie/Intolleranze note del paziente: </strong>
                  {pet.allergie.join(', ')}
                </div>
              )}

              {/* Signature Block */}
              <div className="report-signature-block">
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', maxWidth: '320px' }}>
                  <div>Luogo e Data di Emissione:</div>
                  <div style={{ fontWeight: '600', color: 'var(--slate-800)', marginTop: '2px' }}>
                    {clinic?.citta || 'Milano'}, {visitDateFormatted}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '6px', fontStyle: 'italic' }}>
                    Documento clinico redatto ad uso diagnostico e terapeutico ai sensi del Codice Deontologico dei Medici Veterinari.
                  </div>
                </div>

                <div style={{ textAlign: 'center', minWidth: '240px' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginBottom: '2.5rem' }}>
                    Il Medico Veterinario Curante
                  </div>
                  <div style={{ borderTop: '1px dashed var(--slate-400)', paddingTop: '0.5rem' }}>
                    <div style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '0.9rem' }}>
                      {vet ? `Dott. ${vet.nome} ${vet.cognome}` : 'Dott. Medico Veterinario'}
                    </div>
                    {vet?.codiceAlbo && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                        Iscr. Ordine Medici Veterinari n° <strong>{vet.codiceAlbo}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
