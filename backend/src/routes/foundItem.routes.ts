import { Router } from 'express';
import { z } from 'zod';
import {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem
} from '../controllers/foundItem.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

const foundItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  description: z.string().min(1, 'Description is required'),
  locationFound: z.string().min(1, 'Location found is required'),
  dateFound: z.string().transform((str) => new Date(str)),
  specialAppearance: z.string().optional(),
  additionalNotes: z.string().optional(),
});

router.post('/', protect, upload.array('images', 5), validateRequest(foundItemSchema), createFoundItem);
router.get('/', protect, getFoundItems);
router.get('/:id', protect, getFoundItemById);
router.put('/:id', protect, upload.array('images', 5), validateRequest(foundItemSchema), updateFoundItem);
router.delete('/:id', protect, deleteFoundItem);

export default router;
