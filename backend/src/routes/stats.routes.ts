import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller';

const router = Router();

// Public route to get basic dashboard statistics
router.get('/dashboard', getDashboardStats);

export default router;
