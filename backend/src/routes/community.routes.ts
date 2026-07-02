import { Router } from 'express';
import { z } from 'zod';
import { createPost, getPosts, flagPost, suggestOwner } from '../controllers/community.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content cannot be empty'),
  type: z.enum(['found', 'suggestion', 'lost', 'spam', 'warning']).optional(),
  itemId: z.string().regex(objectIdRegex, 'Invalid item ID').optional().nullable(),
});

const flagPostSchema = z.object({
  reason: z.string().min(1, 'Flag reason is required'),
});

const suggestOwnerSchema = z.object({
  suggestedUserId: z.string().regex(objectIdRegex, 'Invalid user ID'),
  note: z.string().optional(),
});

router.use(protect);

router.post('/', validateRequest(createPostSchema), createPost);
router.get('/', getPosts);
router.post('/:id/flag', validateRequest(flagPostSchema), flagPost);
router.post('/:id/suggest-owner', validateRequest(suggestOwnerSchema), suggestOwner);

export default router;
