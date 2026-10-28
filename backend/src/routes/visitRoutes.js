import express from 'express';
import {
  getVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  removeExamAttachment
} from '../controllers/visitController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVisits)
  .post(createVisit);

router.route('/:id')
  .get(getVisitById)
  .put(updateVisit)
  .delete(deleteVisit);

router.delete('/:id/esami/:examId/allegato', removeExamAttachment);

export default router;
