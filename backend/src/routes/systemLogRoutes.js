import express from 'express';
import {
  getLogFiles,
  getLogEntries,
  downloadLogFile,
  clearLog
} from '../controllers/systemLogController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Tutti gli endpoint dei log di sistema sono protetti da autenticazione
router.use(protect);

router.get('/', getLogFiles);
router.get('/entries', getLogEntries);
router.get('/:filename/download', downloadLogFile);
router.delete('/:filename', clearLog);

export default router;
