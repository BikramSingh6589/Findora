import { Router } from 'express';
import { z } from 'zod';
import {
  createLostItem,
  getLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem,
  resolveLostItem,
  revertLostItem
} from '../controllers/lostItem.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

const lostItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  description: z.string().min(1, 'Description is required'),
  locationLost: z.string().min(1, 'Location lost is required'),
  dateLost: z.string().transform((str) => new Date(str)),
  specialAppearance: z.string().optional(),
});

router.post('/', protect, upload.array('images', 5), validateRequest(lostItemSchema), createLostItem);
router.get('/', protect, getLostItems);
router.get('/:id', protect, getLostItemById);
router.put('/:id', protect, upload.array('images', 5), validateRequest(lostItemSchema), updateLostItem);
router.patch('/:id/resolve', protect, resolveLostItem);
router.patch('/:id/revert', protect, revertLostItem);
router.delete('/:id', protect, deleteLostItem);

export default router;
