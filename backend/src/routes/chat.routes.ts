import { Router } from 'express';
import {
  getChatMessages,
  sendChatMessage
} from '../controllers/chat.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/:itemId/messages', protect, getChatMessages);
router.post('/:itemId/messages', protect, sendChatMessage);

export default router;
