import express from 'express';
import {
  getVaccinations,
  getVaccinationById,
  createVaccination,
  updateVaccination,
  deleteVaccination
} from '../controllers/vaccinationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVaccinations)
  .post(createVaccination);

router.route('/:id')
  .get(getVaccinationById)
  .put(updateVaccination)
  .delete(deleteVaccination);

export default router;
