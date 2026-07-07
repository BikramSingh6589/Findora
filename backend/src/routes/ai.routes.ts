import { Router } from 'express';
import { z } from 'zod';
import {
  getMatches,
  getItemMatches,
  triggerManualMatching,
  getMatchDetails,
  updateMatchStatus
} from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const updateStatusSchema = z.object({
  status: z.enum(['new', 'reviewed', 'dismissed'])
});

const triggerSchema = z.object({
  itemId: z.string().regex(objectIdRegex, 'Invalid item ID'),
  itemType: z.enum(['lost', 'found'])
});

// All routes are protected by JWT authentication
router.use(protect);

router.get('/matches', getMatches);
router.get('/matches/:itemId', getItemMatches);
router.get('/matches/match/:matchId', getMatchDetails);
router.put('/matches/:matchId/status', validateRequest(updateStatusSchema), updateMatchStatus);
router.post('/trigger', validateRequest(triggerSchema), triggerManualMatching);

export default router;
