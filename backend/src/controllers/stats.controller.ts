import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import FoundItem from '../models/FoundItem';

/**
 * Get dashboard stats: total returns and top categories
 */
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Total Returns = found items with status 'claimed'
    const totalReturns = await FoundItem.countDocuments({ status: 'claimed' });

    // Top Categories for claimed items
    const categoryStats = await FoundItem.aggregate([
      { $match: { status: 'claimed' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const formattedCategories = categoryStats.map((cat, index) => ({
      name: cat._id || 'Uncategorized',
      count: cat.count,
      // For UI visualization (e.g. 3 dots for first, 2 for second, 1 for third)
      intensity: 3 - index
    }));

    sendSuccess(res, {
      totalReturns,
      topCategories: formattedCategories
    }, 'Dashboard stats fetched successfully');
  } catch (error) {
    next(error);
  }
};
