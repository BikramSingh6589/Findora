import { Router } from 'express';
import { z } from 'zod';
import {
  getMe,
  updateMe,
  getLeaderboard,
  getUserById,
  getUserReports
} from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

const updateMeSchema = z.object({
  name:       z.string().min(1, 'Name cannot be empty').optional(),
  phone:      z.string().optional(),
  profilePic: z.string().optional(),
});

router.get('/me', protect, getMe);
router.put('/me', protect, validateRequest(updateMeSchema), updateMe);
router.get('/leaderboard', protect, getLeaderboard);
router.get('/:id', protect, adminOnly, getUserById);
router.get('/:id/reports', protect, getUserReports);

export default router;
