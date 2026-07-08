import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.delete('/all', protect, deleteAllNotifications);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
