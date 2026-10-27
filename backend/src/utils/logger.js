/**
 * Modulo di Logging Strutturato ed Enterprise Observability per VetClinic Pro
 */

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

const formatLog = (levelKey, message, meta = {}) => {
  const level = LOG_LEVELS[levelKey] || LOG_LEVELS.INFO;
  if (level.priority < currentLevelThreshold) return;

  const timestamp = new Date().toISOString();

  if (isProduction) {
    // In produzione: JSON strutturato per aggregatori di log (Datadog, CloudWatch, Loki)
    const logObject = {
      timestamp,
      level: level.label,
      message,
      service: 'vetclinic-backend',
      ...meta
    };
    if (levelKey === 'ERROR') {
      process.stderr.write(JSON.stringify(logObject) + '\n');
    } else {
      process.stdout.write(JSON.stringify(logObject) + '\n');
    }
  } else {
    // In sviluppo: output human-readable formattato con colori
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const output = `${level.color}[${timestamp}] [${level.label}]${RESET_COLOR} ${message}${metaStr}`;
    if (levelKey === 'ERROR') {
      console.error(output);
    } else if (levelKey === 'WARN') {
      console.warn(output);
    } else {
      console.log(output);
    }
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
