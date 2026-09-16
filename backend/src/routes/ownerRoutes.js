import express from 'express';
import { getOwners, getOwnerById, createOwner, updateOwner, deleteOwner } from '../controllers/ownerController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOwners)
  .post(createOwner);

router.route('/:id')
  .get(getOwnerById)
  .put(updateOwner)
  .delete(deleteOwner);

export default router;
