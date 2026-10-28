/**
 * Modulo di Logging Strutturato, File Logging ed Enterprise Observability per VetClinic Pro
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const LOG_LEVELS = {
  DEBUG: { priority: 0, label: 'DEBUG', color: '\x1b[36m' },
  INFO: { priority: 1, label: 'INFO', color: '\x1b[32m' },
  AUDIT: { priority: 2, label: 'AUDIT', color: '\x1b[35m' },
  WARN: { priority: 3, label: 'WARN', color: '\x1b[33m' },
  ERROR: { priority: 4, label: 'ERROR', color: '\x1b[31m' }
};

const RESET_COLOR = '\x1b[0m';
const isProduction = process.env.NODE_ENV === 'production';
const currentLevelThreshold = isProduction ? 1 : 0; // In prod logga da INFO in su

// Configurazioni per il File Logging
const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file prima della rotazione
const MAX_BACKUP_FILES = 3;
const MAX_MEMORY_LOGS = 1000;

// Determinazione sicura della cartella dei log
let logsDirectory = process.env.LOG_DIR || path.resolve(process.cwd(), 'logs');
let isFileLoggingAvailable = true;

function initializeLogsDirectory() {
  try {
    if (!fs.existsSync(logsDirectory)) {
      fs.mkdirSync(logsDirectory, { recursive: true });
    }
    const testFile = path.join(logsDirectory, '.write_test');
    fs.writeFileSync(testFile, 'ok', 'utf8');
    fs.unlinkSync(testFile);
  } catch (err) {
    // In ambienti serverless read-only (es. Vercel), ripiega sulla directory temporanea scrivibile dell'OS
    try {
      const fallbackDir = path.join(os.tmpdir(), 'vetclinic-logs');
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      logsDirectory = fallbackDir;
    } catch (fallbackErr) {
      isFileLoggingAvailable = false;
    }
  }
}

initializeLogsDirectory();

// Buffer circolare in memoria per consultazione ad alta velocità da UI e API
const memoryLogBuffer = [];

/**
 * Gestione rotazione file di log al superamento della dimensione massima
 */
function rotateLogFileIfNeeded(filePath) {
  try {
    if (!fs.existsSync(filePath)) return;
    const stats = fs.statSync(filePath);
    if (stats.size >= MAX_LOG_FILE_SIZE) {
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${filePath}.${dateStr}.bak`;
      fs.renameSync(filePath, backupPath);

      // Elimina i backup più vecchi oltre MAX_BACKUP_FILES
      const dir = path.dirname(filePath);
      const base = path.basename(filePath);
      const files = fs.readdirSync(dir)
        .filter((f) => f.startsWith(base) && f.endsWith('.bak'))
        .map((f) => ({ name: f, time: fs.statSync(path.join(dir, f)).mtimeMs }))
        .sort((a, b) => b.time - a.time);

      if (files.length > MAX_BACKUP_FILES) {
        for (let i = MAX_BACKUP_FILES; i < files.length; i++) {
          try {
            fs.unlinkSync(path.join(dir, files[i].name));
          } catch (_) {}
        }
      }
    }
  } catch (err) {
    // Ignora errori non bloccanti di rotazione
  }
}

/**
 * Scrittura asincrona e sicura su file di testo
 */
function writeLineToLogFile(filename, lineText) {
  if (!isFileLoggingAvailable) return;
  try {
    const filePath = path.join(logsDirectory, filename);
    rotateLogFileIfNeeded(filePath);
    fs.appendFileSync(filePath, lineText + '\n', 'utf8');
  } catch (err) {
    // Silenzioso per evitare crash dell'applicazione
  }
}

/**
 * Formattatore principale dei log
 */
const formatLog = (levelKey, message, meta = {}) => {
  const level = LOG_LEVELS[levelKey] || LOG_LEVELS.INFO;
  if (level.priority < currentLevelThreshold) return;

  const timestamp = new Date().toISOString();
  const logId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Oggetto strutturato in memoria
  const logEntry = {
    id: logId,
    timestamp,
    level: level.label,
    message,
    service: 'vetclinic-backend',
    ...meta
  };

  // Buffer circolare in-memory
  memoryLogBuffer.push(logEntry);
  if (memoryLogBuffer.length > MAX_MEMORY_LOGS) {
    memoryLogBuffer.shift();
  }

  // 2. Output su Console / Standard Output
  if (isProduction) {
    const jsonOutput = JSON.stringify(logEntry);
    if (levelKey === 'ERROR') {
      process.stderr.write(jsonOutput + '\n');
    } else {
      process.stdout.write(jsonOutput + '\n');
    }
  } else {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const consoleOutput = `${level.color}[${timestamp}] [${level.label}]${RESET_COLOR} ${message}${metaStr}`;
    if (levelKey === 'ERROR') {
      console.error(consoleOutput);
    } else if (levelKey === 'WARN') {
      console.warn(consoleOutput);
    } else {
      console.log(consoleOutput);
    }
  }

  // 3. Scrittura su file di testo (.log)
  let fileText = `[${timestamp}] [${level.label}] [vetclinic-backend] ${message}`;
  const cleanMeta = { ...meta };
  const stack = cleanMeta.stack;
  delete cleanMeta.stack;

  if (Object.keys(cleanMeta).length > 0) {
    fileText += ` | meta=${JSON.stringify(cleanMeta)}`;
  }
  if (stack) {
    fileText += `\nStack trace:\n${stack}`;
  }

  // Scrivi sempre nel registro combinato (combined.log)
  writeLineToLogFile('combined.log', fileText);

  // Se è un errore o warning critico, scrivi anche nel file dedicato (error.log)
  if (levelKey === 'ERROR') {
    writeLineToLogFile('error.log', fileText);
  }
};

export const logger = {
  debug: (msg, meta) => formatLog('DEBUG', msg, meta),
  info: (msg, meta) => formatLog('INFO', msg, meta),
  audit: (msg, meta) => formatLog('AUDIT', msg, meta),
  warn: (msg, meta) => formatLog('WARN', msg, meta),
  error: (msg, errorOrMeta, extraMeta = {}) => {
    let meta = {};
    if (errorOrMeta instanceof Error) {
      meta = {
        errorMessage: errorOrMeta.message,
        stack: errorOrMeta.stack,
        ...extraMeta
      };
    } else if (typeof errorOrMeta === 'object') {
      meta = { ...errorOrMeta, ...extraMeta };
    }
    formatLog('ERROR', msg, meta);
  }
};

/**
 * Middleware Express per il monitoraggio e tracciamento delle richieste HTTP
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    // Evita di inquinare i log con i polling periodici di salute in dev se status ok
    if (req.originalUrl === '/api/health' && res.statusCode === 200 && !isProduction) {
      return;
    }

    const durationMs = Date.now() - startTime;
    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      ip: req.ip || req.connection?.remoteAddress,
      userId: req.user?._id?.toString()
    };

    const msg = `HTTP ${req.method} ${req.originalUrl} ${res.statusCode} (${durationMs}ms)`;

    if (res.statusCode >= 500) {
      logger.error(msg, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(msg, meta);
    } else {
      logger.info(msg, meta);
    }
  });

  next();
};

/**
 * Funzioni di utilità e interrogazione per l'API di monitoraggio Log di Sistema
 */

// Formatta dimensione in byte in formato leggibile (KB, MB)
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getLogsDirectory() {
  return logsDirectory;
}

/**
 * Restituisce i dettagli e le dimensioni dei file di log disponibili
 */
export function getLogFilesInfo() {
  const targetFiles = ['combined.log', 'error.log'];
  return targetFiles.map((filename) => {
    const filePath = path.join(logsDirectory, filename);
    let exists = false;
    let sizeBytes = 0;
    let lastModified = null;
    let lineCount = 0;

    if (fs.existsSync(filePath)) {
      exists = true;
      try {
        const stats = fs.statSync(filePath);
        sizeBytes = stats.size;
        lastModified = stats.mtime;
        // Conteggio rapido righe se file < 5MB
        if (sizeBytes < 5 * 1024 * 1024) {
          const content = fs.readFileSync(filePath, 'utf8');
          lineCount = content.split('\n').filter(Boolean).length;
        }
      } catch (_) {}
    }

    return {
      filename,
      exists,
      path: filePath,
      sizeBytes,
      sizeFormatted: formatBytes(sizeBytes),
      lastModified: lastModified ? lastModified.toISOString() : null,
      lineCount
    };
  });
}

/**
 * Restituisce il percorso assoluto protetto di un file di log (prevenzione path traversal)
 */
export function getLogFilePath(filename) {
  const safeFilename = path.basename(filename);
  if (!safeFilename.endsWith('.log') && !safeFilename.endsWith('.bak')) {
    throw new Error('Tipo di file non consentito');
  }
  const fullPath = path.join(logsDirectory, safeFilename);
  if (!fullPath.startsWith(logsDirectory)) {
    throw new Error('Accesso non autorizzato al file system');
  }
  return fullPath;
}

/**
 * Legge e analizza le ultime N righe di log con supporto filtri (livello, ricerca testo)
 */
export function getRecentLogs({ filename = 'combined.log', level, search, limit = 200 } = {}) {
  const safeFilename = path.basename(filename);
  const filePath = path.join(logsDirectory, safeFilename);

  let rawLines = [];

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      rawLines = content.split('\n').filter(Boolean);
    } catch (_) {
      rawLines = [];
    }
  }

  // Se il file su disco è vuoto o non accessibile (es. serverless), usa il buffer in-memory
  if (rawLines.length === 0 && memoryLogBuffer.length > 0) {
    let memoryEntries = [...memoryLogBuffer];
    if (filename === 'error.log') {
      memoryEntries = memoryEntries.filter((e) => e.level === 'ERROR');
    }
    if (level && level !== 'ALL') {
      memoryEntries = memoryEntries.filter((e) => e.level.toUpperCase() === level.toUpperCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      memoryEntries = memoryEntries.filter((e) =>
        e.message?.toLowerCase().includes(q) ||
        JSON.stringify(e).toLowerCase().includes(q)
      );
    }
    return memoryEntries.slice(-limit).reverse();
  }

  // Parsifica le righe di testo in oggetti strutturati
  const parsedEntries = [];
  const logRegex = /^\[(.*?)\]\s+\[(.*?)\](?:\s+\[(.*?)\])?\s+(.*?)(?:\s+\|\s+meta=(.*))?$/;

  for (let i = rawLines.length - 1; i >= 0; i--) {
    const line = rawLines[i];
    const match = line.match(logRegex);

    if (match) {
      const [, timestamp, lvl, service, message, metaStr] = match;
      let meta = {};
      if (metaStr) {
        try {
          meta = JSON.parse(metaStr);
        } catch (_) {
          meta = { raw: metaStr };
        }
      }

      parsedEntries.push({
        id: `file-${i}`,
        timestamp,
        level: lvl,
        service: service || 'vetclinic-backend',
        message,
        ...meta
      });
    } else {
      // Righe di continuazione (es. Stack trace)
      if (parsedEntries.length > 0) {
        const last = parsedEntries[parsedEntries.length - 1];
        last.stack = (last.stack ? last.stack + '\n' : '') + line;
      }
    }

    if (parsedEntries.length >= limit * 3) {
      break; // Ottimizzazione: non parsare l'intero file se supera il limite di righe
    }
  }

  let filtered = parsedEntries;

  if (level && level !== 'ALL') {
    filtered = filtered.filter((e) => e.level.toUpperCase() === level.toUpperCase());
  }

  if (search && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((e) =>
      e.message?.toLowerCase().includes(q) ||
      (e.url && e.url.toLowerCase().includes(q)) ||
      (e.errorMessage && e.errorMessage.toLowerCase().includes(q)) ||
      (e.stack && e.stack.toLowerCase().includes(q))
    );
  }

  return filtered.slice(0, limit);
}

/**
 * Svuota il file di log specificato
 */
export function clearLogFile(filename) {
  const filePath = getLogFilePath(filename);
  if (fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '', 'utf8');
  }
  // Pulisci anche il buffer in memoria se combined
  if (filename === 'combined.log') {
    memoryLogBuffer.length = 0;
  } else if (filename === 'error.log') {
    for (let i = memoryLogBuffer.length - 1; i >= 0; i--) {
      if (memoryLogBuffer[i].level === 'ERROR') {
        memoryLogBuffer.splice(i, 1);
      }
    }
  }
  return true;
}
