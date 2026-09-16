import express from 'express';
import {
  getClinics,
  getClinicById,
  createClinic,
  updateClinic,
  getAvailableClinics,
  createClinicRequest,
  getSentClinicRequests,
  getReceivedClinicRequests,
  respondClinicRequest
} from '../controllers/clinicController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // Tutte le rotte richiedono autenticazione

// Ambulatori disponibili per richiesta accesso
router.get('/available', getAvailableClinics);

// Gestione richieste di accesso
router.get('/requests/sent', getSentClinicRequests);
router.get('/requests/received', getReceivedClinicRequests);
router.post('/requests', createClinicRequest);
router.put('/requests/:id/respond', respondClinicRequest);

router.route('/')
  .get(getClinics)
  .post(createClinic);

router.route('/:id')
  .get(getClinicById)
  .put(updateClinic);

export default router;
