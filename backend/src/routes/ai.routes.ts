import { Router } from 'express';
import {
  getMatches,
  getItemMatches,
  triggerManualMatching
} from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/matches', protect, getMatches);
router.get('/matches/:itemId', protect, getItemMatches);
router.post('/trigger', protect, triggerManualMatching);

export default router;
