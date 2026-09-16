import express from 'express';
import { getPets, getPetById, createPet, updatePet, deletePet } from '../controllers/petController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getPets)
  .post(createPet);

router.route('/:id')
  .get(getPetById)
  .put(updatePet)
  .delete(deletePet);

export default router;
