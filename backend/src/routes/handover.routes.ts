import { Router } from 'express';
import {
  getHandoverQR,
  scanHandoverQR,
  confirmHandover
} from '../controllers/handover.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';

const router = Router();

router.get('/:itemId/qr', protect, getHandoverQR);
router.post('/:itemId/scan', protect, adminOnly, scanHandoverQR);
router.post('/:itemId/confirm', protect, adminOnly, confirmHandover);

export default router;
