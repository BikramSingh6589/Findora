import { Router } from 'express';
import { z } from 'zod';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';
import { protect } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

// Category endpoints
router.get('/', getCategories);
router.post('/', protect, adminOnly, validateRequest(categorySchema), createCategory);
router.put('/:id', protect, adminOnly, validateRequest(categorySchema), updateCategory);
router.delete('/:id', protect, adminOnly, deleteCategory);

export default router;
