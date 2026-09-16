import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getStats);

export default router;
