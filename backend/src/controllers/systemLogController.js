/**
 * Controller per la gestione e il monitoraggio dei log di sistema
 */
import fs from 'fs';
import {
  getLogFilesInfo,
  getRecentLogs,
  getLogFilePath,
  clearLogFile
} from '../utils/logger.js';

/**
 * @desc    Restituisce le informazioni sui file di log presenti sul sistema (dimensione, data, righe)
 * @route   GET /api/system/logs
 * @access  Private (Operatori e Veterinari autenticati)
 */
export const getLogFiles = async (req, res) => {
  try {
    const files = getLogFilesInfo();
    res.json({
      success: true,
      data: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Impossibile recuperare i file di log',
      error: error.message
    });
  }
};

/**
 * @desc    Restituisce le voci di log recenti filtrate
 * @route   GET /api/system/logs/entries
 * @access  Private (Operatori e Veterinari autenticati)
 */
export const getLogEntries = async (req, res) => {
  try {
    const { filename = 'combined.log', level, search, limit = 200 } = req.query;

    const entries = getRecentLogs({
      filename,
      level,
      search,
      limit: Math.min(parseInt(limit, 10) || 200, 1000)
    });

    res.json({
      success: true,
      data: {
        filename,
        count: entries.length,
        entries
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante la lettura delle voci di log',
      error: error.message
    });
  }
};

/**
 * @desc    Scarica il file .log grezzo in formato testo
 * @route   GET /api/system/logs/:filename/download
 * @access  Private (Operatori e Veterinari autenticati)
 */
export const downloadLogFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = getLogFilePath(filename);

    if (fs.existsSync(filePath)) {
      return res.download(filePath, filename);
    }

    // Se il file su disco non è ancora presente, genera il file al volo dal buffer in memoria
    const entries = getRecentLogs({ filename, limit: 1000 });
    const textOutput = entries
      .map(
        (e) =>
          `[${e.timestamp}] [${e.level}] [${e.service || 'vetclinic-backend'}] ${e.message}${
            e.stack ? `\nStack trace:\n${e.stack}` : ''
          }`
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(textOutput || `# Nessun log presente per ${filename}\n`);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'File di log non trovato o non accessibile',
      error: error.message
    });
  }
};

/**
 * @desc    Svuota o resetta un file di log
 * @route   DELETE /api/system/logs/:filename
 * @access  Private (Operatori e Veterinari autenticati)
 */
export const clearLog = async (req, res) => {
  try {
    const { filename } = req.params;
    clearLogFile(filename);

    res.json({
      success: true,
      message: `File di log ${filename} svuotato con successo`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Errore durante lo svuotamento del log',
      error: error.message
    });
  }
};
