import express from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from '../controllers/appointmentController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post(createAppointment);

router.patch('/:id/status', updateAppointmentStatus);
router.put('/:id/status', updateAppointmentStatus);

router.route('/:id')
  .get(getAppointmentById)
  .put(updateAppointment)
  .patch(updateAppointment)
  .delete(deleteAppointment);

export default router;
