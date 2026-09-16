import express from 'express';
import { getTherapies, createTherapy, updateTherapy, deleteTherapy } from '../controllers/therapyController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTherapies)
  .post(createTherapy);

router.route('/:id')
  .put(updateTherapy)
  .delete(deleteTherapy);

export default router;
