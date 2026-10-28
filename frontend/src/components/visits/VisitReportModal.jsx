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
  AlertCircle,
  FlaskConical,
  Download,
  Paperclip,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';
import { useClinic } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ConfirmModal } from '../common/ConfirmModal';
import { generateMergedVisitPdf } from '../../services/pdfReportGenerator';

export const VisitReportModal = ({ isOpen, onClose, visit: initialVisit, visitId, pet: defaultPet, onVisitUpdated }) => {
  const { activeClinic } = useClinic();
  const { user } = useAuth();
  const toast = useToast();
  const [visit, setVisit] = useState(initialVisit || null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [error, setError] = useState('');
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [isRemovingAttachment, setIsRemovingAttachment] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('report-modal-open');
    } else {
      document.body.classList.remove('report-modal-open');
    }
    return () => {
      document.body.classList.remove('report-modal-open');
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      const iframe = document.getElementById('print-visit-iframe');
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };
  }, []);

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

  const generatePrintDocumentHtml = (contentHtml, patientName) => `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <title>Referto Visita - ${patientName || 'Paziente'}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm;
        }
        :root {
          --primary: #0d9488;
          --primary-subtle: #f0fdfa;
          --primary-light: #ccfbf1;
          --slate-900: #0f172a;
          --slate-800: #1e293b;
          --slate-700: #334155;
          --slate-600: #475569;
          --slate-500: #64748b;
          --slate-400: #94a3b8;
          --slate-200: #e2e8f0;
          --slate-100: #f1f5f9;
          --slate-50: #f8fafc;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff !important;
          color: #0f172a !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 9.5pt;
          line-height: 1.4;
        }
        .visit-report-sheet {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
        .report-clinic-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 8px;
          margin-bottom: 10px;
        }
        .report-title-banner {
          background: #0f172a !important;
          color: #ffffff !important;
          padding: 6px 12px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-weight: bold;
          font-size: 8.8pt;
        }
        .report-grid-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        .report-box {
          background: #f8fafc !important;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
        }
        .report-box-title {
          font-size: 8pt;
          font-weight: 800;
          text-transform: uppercase;
          color: #0d9488;
          margin-bottom: 5px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 3px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .report-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2.5px;
          font-size: 8.5pt;
        }
        .report-info-label {
          color: #64748b;
        }
        .report-info-value {
          font-weight: bold;
          color: #0f172a;
        }
        .report-vitals-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        .report-vital-card {
          background: #ffffff !important;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 5px 4px;
          text-align: center;
        }
        .report-section {
          margin-bottom: 10px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .report-section-title {
          font-size: 8.2pt;
          font-weight: 800;
          text-transform: uppercase;
          color: #1e293b;
          margin-bottom: 3px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .report-text-block {
          background: #ffffff !important;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 7px 12px;
          font-size: 8.6pt;
          white-space: pre-wrap;
        }
        .report-therapy-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8.2pt;
          margin-top: 4px;
        }
        .report-therapy-table th {
          background: #f1f5f9 !important;
          padding: 4px 8px;
          border: 1px solid #cbd5e1;
          text-align: left;
        }
        .report-therapy-table td {
          padding: 4px 8px;
          border: 1px solid #cbd5e1;
        }
        .report-signature-block {
          margin-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          border-top: 1px solid #cbd5e1;
          padding-top: 10px;
          break-inside: avoid;
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      ${contentHtml}
    </body>
    </html>
  `;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-visit-report');
    if (!printContent) return;

    let iframe = document.getElementById('print-visit-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'print-visit-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);
    }

    const html = generatePrintDocumentHtml(printContent.innerHTML, pet?.nome);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Errore stampa iframe:', err);
        window.print();
      }
    }, 250);
  };

  const handleOpenPrintWindow = () => {
    const printContent = document.getElementById('printable-visit-report');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('Consentire i popup per aprire la finestra di stampa.');
      return;
    }

    const html = generatePrintDocumentHtml(printContent.innerHTML, pet?.nome);
    printWindow.document.open();
    printWindow.document.write(`
      ${html}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    `);
    printWindow.document.close();
  };

  const hasAttachedPdfs = (visit?.esami || []).some((e) => Boolean(e.fileAllegato));

  const handleDownloadMergedPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const pdfBytes = await generateMergedVisitPdf({
        visit,
        clinic,
        pet,
        owner,
        vet: visit.veterinarioId || user
      });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Referto_${(pet?.nome || 'Paziente').replace(/\s+/g, '_')}_${protocolNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Errore nella generazione del PDF con allegati:', err);
      alert('Si è verificato un errore durante la generazione del fascicolo PDF: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const downloadAttachment = (esame) => {
    if (!esame.fileAllegato) return;
    const link = document.createElement('a');
    link.href = esame.fileAllegato;
    link.download = esame.nomeFile || `esame_${esame.nome || 'allegato'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmRemoveAttachment = async () => {
    if (!attachmentToDelete || !visit?._id) return;
    setIsRemovingAttachment(true);
    try {
      const examIdentifier = attachmentToDelete.exam?._id || attachmentToDelete.examIndex;
      let updated = null;

      try {
        const res = await api.visits.removeExamAttachment(visit._id, examIdentifier);
        if (res?.success && res?.data) {
          updated = res.data;
        }
      } catch (callErr) {
        console.warn('Rimozione tramite endpoint dedicato fallita, tentativo con fallback:', callErr);
        // Fallback: update esami array directly via update visit
        const currentEsami = [...(visit.esami || [])];
        const idx = attachmentToDelete.examIndex;
        if (idx >= 0 && idx < currentEsami.length) {
          currentEsami[idx] = {
            ...currentEsami[idx],
            fileAllegato: null,
            nomeFile: null,
            tipoFile: null,
            dimensioneFile: null
          };
          const res = await api.visits.update(visit._id, { esami: currentEsami });
          if (res?.success && res?.data) {
            updated = res.data;
          }
        }
      }

      if (updated) {
        setVisit((prev) => ({
          ...prev,
          ...updated,
          esami: updated.esami || prev.esami
        }));
        if (onVisitUpdated) {
          onVisitUpdated(updated);
        }
      } else {
        // Aggiornamento ottimistico locale se necessario
        setVisit((prev) => {
          const nextEsami = [...(prev?.esami || [])];
          if (nextEsami[attachmentToDelete.examIndex]) {
            nextEsami[attachmentToDelete.examIndex] = {
              ...nextEsami[attachmentToDelete.examIndex],
              fileAllegato: null,
              nomeFile: null,
              tipoFile: null,
              dimensioneFile: null
            };
          }
          const nextVisit = { ...prev, esami: nextEsami };
          if (onVisitUpdated) onVisitUpdated(nextVisit);
          return nextVisit;
        });
      }

      toast.success("Allegato PDF dell'esame rimosso con successo");
      setAttachmentToDelete(null);
    } catch (err) {
      console.error("Errore durante la rimozione dell'allegato:", err);
      toast.error(err.message || "Impossibile rimuovere l'allegato dall'esame");
    } finally {
      setIsRemovingAttachment(false);
    }
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
              id="btn-download-merged-pdf"
              className="btn btn-primary"
              onClick={handleDownloadMergedPdf}
              disabled={isGeneratingPdf}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.1rem' }}
            >
              <Download size={16} />
              <span>
                {isGeneratingPdf
                  ? 'Generazione in corso...'
                  : hasAttachedPdfs
                  ? 'Scarica Fascicolo PDF (con Allegati)'
                  : 'Scarica Referto PDF'}
              </span>
            </button>

            <button
              id="btn-print-visit-direct"
              className="btn btn-secondary"
              onClick={handlePrint}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 0.9rem' }}
            >
              <Printer size={16} />
              <span>Stampa</span>
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

              {/* Esami & Prestazioni Specialistiche */}
              {Array.isArray(visit.esami) && visit.esami.length > 0 && (
                <div className="report-section">
                  <div className="report-section-title">
                    <FlaskConical size={14} /> Esami di Laboratorio & Indagini Diagnostiche
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visit.esami.map((esame, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '8px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px' }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: '9pt', color: 'var(--slate-900)' }}>
                              {esame.nome || 'Esame specialistico'}
                            </span>
                            <span
                              style={{
                                marginLeft: '8px',
                                fontSize: '7.8pt',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: esame.tipologia === 'Esterno' ? '#fef3c7' : '#e0f2fe',
                                color: esame.tipologia === 'Esterno' ? '#92400e' : '#0369a1',
                                fontWeight: 600
                              }}
                            >
                              {esame.tipologia || 'Interno'}
                              {esame.tipologia === 'Esterno' && esame.laboratorio ? ` • Lab: ${esame.laboratorio}` : ''}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '7.8pt',
                                fontWeight: 700,
                                color: esame.stato === 'In lavorazione' ? '#d97706' : '#0d9488'
                              }}
                            >
                              {esame.stato === 'In lavorazione' ? '⏳ In lavorazione' : '✅ Pronto'}
                            </span>
                            {esame.fileAllegato && (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="no-print btn btn-sm btn-secondary"
                                  onClick={() => downloadAttachment(esame)}
                                  style={{
                                    fontSize: '7.5pt',
                                    padding: '2px 7px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Scarica il PDF referto del laboratorio"
                                >
                                  <Download size={12} /> Scarica PDF Esame
                                </button>
                                <button
                                  type="button"
                                  className="no-print btn btn-sm btn-secondary"
                                  onClick={() => setAttachmentToDelete({ examIndex: idx, exam: esame })}
                                  style={{
                                    fontSize: '7.5pt',
                                    padding: '2px 7px',
                                    color: '#ef4444',
                                    borderColor: '#fca5a5',
                                    background: '#fef2f2',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                  title="Rimuovi allegato PDF da questo esame"
                                >
                                  <Trash2 size={12} /> Rimuovi Allegato
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {esame.esito && (
                          <div style={{ fontSize: '8.4pt', color: '#334155', marginTop: '4px' }}>
                            <strong>Esito:</strong> {esame.esito}
                          </div>
                        )}

                        {esame.fileAllegato && (
                          <div style={{ fontSize: '7.8pt', color: '#0d9488', fontStyle: 'italic', marginTop: '3px' }}>
                            📎 Referto laboratorio originale ({esame.nomeFile || 'allegato.pdf'}) unito al fascicolo PDF.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {attachmentToDelete && (
        <ConfirmModal
          isOpen={Boolean(attachmentToDelete)}
          onClose={() => setAttachmentToDelete(null)}
          onConfirm={handleConfirmRemoveAttachment}
          title="Rimuovi Allegato Esame"
          message={`Sei sicuro di voler rimuovere il file PDF allegato all'esame "${attachmentToDelete?.exam?.nome || 'Esame'}"? Il fascicolo PDF verrà aggiornato automaticamente.`}
          confirmText="Rimuovi Allegato"
          cancelText="Annulla"
          type="danger"
          isLoading={isRemovingAttachment}
        />
      )}
    </div>
  );
};
