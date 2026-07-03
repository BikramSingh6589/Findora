import { Router } from 'express';
import {
  getHandoverQR,
  scanHandoverQR,
  confirmHandover
} from '../controllers/handover.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/:itemId/qr', protect, getHandoverQR);
router.post('/:itemId/scan', protect, scanHandoverQR);
router.post('/:itemId/confirm', protect, confirmHandover);

export default router;
