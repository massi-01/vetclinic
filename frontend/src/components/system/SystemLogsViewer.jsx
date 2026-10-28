import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  AlertTriangle,
  Download,
  RefreshCw,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Activity,
  Layers,
  ChevronDown,
  ChevronRight,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmModal } from '../common/ConfirmModal';

export const SystemLogsViewer = () => {
  const toast = useToast();
  const [logFiles, setLogFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('combined.log');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(150);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedStacks, setExpandedStacks] = useState({});
  const [fileToClear, setFileToClear] = useState(null);
  const [clearing, setClearing] = useState(false);

  const consoleEndRef = useRef(null);

  // Caricamento iniziale dei dettagli file
  const loadFilesInfo = async () => {
    try {
      const res = await api.systemLogs.getFiles();
      if (res.success && Array.isArray(res.data)) {
        setLogFiles(res.data);
      }
    } catch (err) {
      console.warn('Errore recupero file di log:', err);
    }
  };

  // Caricamento delle voci di log
  const loadLogEntries = async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await api.systemLogs.getEntries({
        filename: selectedFile,
        level: levelFilter,
        search: searchQuery,
        limit
      });

      if (res.success && res.data) {
        setEntries(res.data.entries || []);
      }
    } catch (err) {
      console.error('Errore recupero voci di log:', err);
      if (!isSilent) {
        toast.error(err.message || 'Errore nel recupero delle voci di log');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFilesInfo();
    loadLogEntries();
  }, [selectedFile, levelFilter, limit]);

  // Gestione ricerca con debounce leggero
  useEffect(() => {
    const handler = setTimeout(() => {
      loadLogEntries(true);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Gestione auto-refresh
  useEffect(() => {
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadLogEntries(true);
        loadFilesInfo();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedFile, levelFilter, searchQuery, limit]);

  const handleDownload = async (filename) => {
    try {
      toast.info(`Download in corso di ${filename}...`);
      await api.systemLogs.download(filename);
      toast.success(`File ${filename} scaricato con successo`);
    } catch (err) {
      toast.error(err.message || 'Errore durante il download del log');
    }
  };

  const handleConfirmClear = async () => {
    if (!fileToClear) return;
    setClearing(true);
    try {
      await api.systemLogs.clearFile(fileToClear);
      toast.success(`File di log ${fileToClear} svuotato con successo`);
      setFileToClear(null);
      await loadFilesInfo();
      await loadLogEntries();
    } catch (err) {
      toast.error(err.message || 'Errore durante lo svuotamento del log');
    } finally {
      setClearing(false);
    }
  };

  const toggleStack = (id) => {
    setExpandedStacks((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const combinedFileInfo = logFiles.find((f) => f.filename === 'combined.log');
  const errorFileInfo = logFiles.find((f) => f.filename === 'error.log');

  const getLevelBadge = (level) => {
    const lvl = (level || 'INFO').toUpperCase();
    switch (lvl) {
      case 'ERROR':
        return {
          bg: '#450a0a',
          color: '#f87171',
          border: '#b91c1c',
          label: 'ERROR'
        };
      case 'WARN':
        return {
          bg: '#451a03',
          color: '#fbbf24',
          border: '#d97706',
          label: 'WARN'
        };
      case 'AUDIT':
        return {
          bg: '#3b0764',
          color: '#d8b4fe',
          border: '#9333ea',
          label: 'AUDIT'
        };
      case 'DEBUG':
        return {
          bg: '#172554',
          color: '#93c5fd',
          border: '#2563eb',
          label: 'DEBUG'
        };
      case 'INFO':
      default:
        return {
          bg: '#064e3b',
          color: '#34d399',
          border: '#059669',
          label: 'INFO'
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. Header Cards Panoramica File */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* Card Combined Log */}
        <div
          onClick={() => setSelectedFile('combined.log')}
          style={{
            background: selectedFile === 'combined.log' ? '#f0fdfa' : '#ffffff',
            border: `2px solid ${selectedFile === 'combined.log' ? 'var(--primary)' : 'var(--slate-200)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.15rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selectedFile === 'combined.log' ? '0 4px 12px rgba(13, 148, 136, 0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FileText size={18} />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '0.98rem' }}>
                  combined.log
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Tutti gli eventi (Info, Errori, Chiamate HTTP)
                </div>
              </div>
            </div>
            <button
              id="btn-download-combined-log"
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload('combined.log');
              }}
              title="Scarica file combined.log"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <Download size={13} /> Scarica
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.75rem', borderTop: '1px solid var(--slate-100)', paddingTop: '0.6rem' }}>
            <div>
              Dimensione: <strong>{combinedFileInfo?.sizeFormatted || '0 B'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: '600' }}>Attivo & Scrivibile</span>
            </div>
          </div>
        </div>

        {/* Card Error Log */}
        <div
          onClick={() => setSelectedFile('error.log')}
          style={{
            background: selectedFile === 'error.log' ? '#fef2f2' : '#ffffff',
            border: `2px solid ${selectedFile === 'error.log' ? '#ef4444' : 'var(--slate-200)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.15rem 1.25rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: selectedFile === 'error.log' ? '0 4px 12px rgba(239, 68, 68, 0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={18} />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--slate-900)', fontSize: '0.98rem' }}>
                  error.log
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Solo Eccezioni Critiche & Errori 500
                </div>
              </div>
            </div>
            <button
              id="btn-download-error-log"
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload('error.log');
              }}
              title="Scarica file error.log"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <Download size={13} /> Scarica
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.75rem', borderTop: '1px solid var(--slate-100)', paddingTop: '0.6rem' }}>
            <div>
              Dimensione: <strong>{errorFileInfo?.sizeFormatted || '0 B'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: errorFileInfo?.sizeBytes > 0 ? '#ef4444' : '#10b981' }} />
              <span style={{ fontSize: '0.75rem', color: errorFileInfo?.sizeBytes > 0 ? '#b91c1c' : '#047857', fontWeight: '600' }}>
                {errorFileInfo?.sizeBytes > 0 ? 'Errori Registrati' : 'Nessun Errore Recente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra Strumenti & Filtri */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          border: '1px solid var(--slate-200)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Filtri Livello */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--slate-500)', marginRight: '0.25rem' }}>
            Livello:
          </span>
          {['ALL', 'ERROR', 'WARN', 'INFO'].map((lvl) => {
            const isSelected = levelFilter === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  border: isSelected ? '1px solid transparent' : '1px solid var(--slate-300)',
                  background: isSelected
                    ? lvl === 'ERROR'
                      ? '#ef4444'
                      : lvl === 'WARN'
                      ? '#f59e0b'
                      : lvl === 'INFO'
                      ? '#0d9488'
                      : 'var(--slate-900)'
                    : '#ffffff',
                  color: isSelected ? '#ffffff' : 'var(--slate-700)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {lvl === 'ALL' ? 'Tutti' : lvl}
              </button>
            );
          })}
        </div>

        {/* Ricerca e Azioni */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', minWidth: '200px', flex: '1 1 200px', maxWidth: '320px' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }}
            />
            <input
              id="input-search-system-logs"
              type="text"
              className="form-control"
              placeholder="Cerca nei log (URL, errore, testo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
            />
          </div>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--slate-600)', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <span>Auto (5s)</span>
          </label>

          <button
            id="btn-refresh-system-logs"
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              loadFilesInfo();
              loadLogEntries();
            }}
            disabled={refreshing}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            <span>Aggiorna</span>
          </button>

          <button
            id="btn-clear-system-logs"
            type="button"
            className="btn btn-danger"
            onClick={() => setFileToClear(selectedFile)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Trash2 size={14} />
            <span>Svuota {selectedFile}</span>
          </button>
        </div>
      </div>

      {/* 3. Console Terminal Log Viewer */}
      <div
        style={{
          background: '#090d16',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #1e293b',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Terminal Window Top Bar */}
        <div
          style={{
            background: '#0f172a',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              <span style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'monospace', marginLeft: '0.5rem' }}>
              backend/logs/{selectedFile} • {entries.length} voci caricate
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              style={{
                background: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '4px',
                fontSize: '0.72rem',
                padding: '2px 6px'
              }}
            >
              <option value={50}>Ultime 50 righe</option>
              <option value={150}>Ultime 150 righe</option>
              <option value={300}>Ultime 300 righe</option>
              <option value={500}>Ultime 500 righe</option>
            </select>
          </div>
        </div>

        {/* Terminal Body */}
        <div
          style={{
            padding: '1rem',
            maxHeight: '520px',
            minHeight: '260px',
            overflowY: 'auto',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            fontSize: '0.8rem',
            lineHeight: 1.55,
            color: '#e2e8f0'
          }}
        >
          {loading && entries.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="spin-animation" style={{ marginBottom: '0.5rem' }} />
              <div>Caricamento log di sistema in corso...</div>
            </div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <Terminal size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
              <div style={{ fontWeight: '700', color: '#94a3b8' }}>Nessuna voce di log registrata</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {searchQuery || levelFilter !== 'ALL'
                  ? 'Nessun risultato corrispondente ai filtri impostati.'
                  : `Il file ${selectedFile} è attualmente vuoto o nessun evento ha generato messaggi.`}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {entries.map((entry, idx) => {
                const badge = getLevelBadge(entry.level);
                const hasStack = Boolean(entry.stack);
                const isStackOpen = expandedStacks[entry.id || idx];

                return (
                  <div
                    key={entry.id || idx}
                    style={{
                      background: entry.level === 'ERROR' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                      borderLeft: entry.level === 'ERROR' ? '3px solid #ef4444' : entry.level === 'WARN' ? '3px solid #f59e0b' : '3px solid transparent',
                      padding: '0.3rem 0.5rem',
                      borderRadius: '4px',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flexWrap: 'wrap' }}>
                      {/* Timestamp */}
                      <span style={{ color: '#64748b', fontSize: '0.74rem', userSelect: 'none', whiteSpace: 'nowrap' }}>
                        {entry.timestamp ? entry.timestamp.replace('T', ' ').substring(0, 19) : ''}
                      </span>

                      {/* Level Badge */}
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          letterSpacing: '0.02em',
                          userSelect: 'none'
                        }}
                      >
                        {badge.label}
                      </span>

                      {/* Message Content */}
                      <span style={{ color: entry.level === 'ERROR' ? '#fca5a5' : '#f1f5f9', wordBreak: 'break-word', flex: 1 }}>
                        {entry.message}
                      </span>

                      {/* HTTP Status or duration badges if present */}
                      {entry.status && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: entry.status >= 500 ? '#f87171' : entry.status >= 400 ? '#fbbf24' : '#34d399',
                            background: '#1e293b',
                            padding: '1px 6px',
                            borderRadius: '3px'
                          }}
                        >
                          {entry.status} {entry.durationMs ? `(${entry.durationMs}ms)` : ''}
                        </span>
                      )}

                      {/* Stack Trace Toggle */}
                      {hasStack && (
                        <button
                          type="button"
                          onClick={() => toggleStack(entry.id || idx)}
                          style={{
                            background: '#334155',
                            border: 'none',
                            color: '#e2e8f0',
                            borderRadius: '3px',
                            padding: '1px 6px',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          {isStackOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                          <span>{isStackOpen ? 'Nascondi Stack' : 'Vedi Stack Trace'}</span>
                        </button>
                      )}
                    </div>

                    {/* Meta info details */}
                    {(entry.url || entry.ip || entry.userId || entry.errorMessage) && (
                      <div style={{ marginTop: '0.2rem', paddingLeft: '1.2rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                        {entry.url && <span style={{ marginRight: '0.8rem' }}>🔗 URL: {entry.url}</span>}
                        {entry.ip && <span style={{ marginRight: '0.8rem' }}>🌐 IP: {entry.ip}</span>}
                        {entry.userId && <span style={{ marginRight: '0.8rem' }}>👤 UserID: {entry.userId}</span>}
                        {entry.errorMessage && <span style={{ color: '#f87171' }}>⚠️ Error: {entry.errorMessage}</span>}
                      </div>
                    )}

                    {/* Stack Trace Container */}
                    {hasStack && isStackOpen && (
                      <pre
                        style={{
                          background: '#020617',
                          border: '1px solid #7f1d1d',
                          borderRadius: '4px',
                          padding: '0.6rem 0.8rem',
                          marginTop: '0.4rem',
                          color: '#fca5a5',
                          fontSize: '0.71rem',
                          overflowX: 'auto',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all'
                        }}
                      >
                        {entry.stack}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>

      {/* Modale Conferma Svuotamento */}
      {fileToClear && (
        <ConfirmModal
          isOpen={Boolean(fileToClear)}
          onClose={() => setFileToClear(null)}
          onConfirm={handleConfirmClear}
          title={`Svuota file ${fileToClear}`}
          message={`Sei sicuro di voler svuotare completamente il file "${fileToClear}"? I log storici correnti verranno rimossi da questo file.`}
          confirmText="Svuota File Log"
          cancelText="Annulla"
          type="danger"
          isLoading={clearing}
        />
      )}
    </div>
  );
};

export default SystemLogsViewer;
