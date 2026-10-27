import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // Autenticazione obbligatoria per consultare il registro audit medico-legale

router.get('/', getAuditLogs);

export default router;
