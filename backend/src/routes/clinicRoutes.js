import express from 'express';
import { getClinics, getClinicById, createClinic, updateClinic } from '../controllers/clinicController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // Tutte le rotte richiedono autenticazione

router.route('/')
  .get(getClinics)
  .post(createClinic);

router.route('/:id')
  .get(getClinicById)
  .put(updateClinic);

export default router;
