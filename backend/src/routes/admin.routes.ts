import { Router } from 'express';
import { z } from 'zod';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  updateUserRole,
  getItems,
  approveItem,
  rejectItem,
  deleteItem,
  getCommunityPosts,
  approveCommunityPost,
  deleteCommunityPost
} from '../controllers/admin.controller';
import { fixLostItemStatuses } from '../controllers/migration.controller';

const router = Router();

const userStatusSchema = z.object({
  status: z.enum(['active', 'warned', 'suspended', 'banned']),
});

const userRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', validateRequest(userStatusSchema), updateUserStatus);
router.put('/users/:id/role', validateRequest(userRoleSchema), updateUserRole);
router.get('/items', getItems);
router.put('/items/:id/approve', approveItem);
router.put('/items/:id/reject', rejectItem);
router.delete('/items/:id', deleteItem);
router.get('/community', getCommunityPosts);
router.put('/community/:id/approve', approveCommunityPost);
router.delete('/community/:id', deleteCommunityPost);

// One-time migration routes
router.post('/migrate/fix-lost-item-statuses', fixLostItemStatuses);

export default router;
