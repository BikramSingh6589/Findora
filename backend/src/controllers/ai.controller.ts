import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import AIMatch from '../models/AIMatch';
import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import { triggerMatching } from '../services/ai.service';
import { sendSuccess, sendError } from '../utils/response';

export const getMatches = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lostItems = await LostItem.find({ owner: req.user._id });
    const foundItems = await FoundItem.find({ finder: req.user._id });

    const lostIds = lostItems.map(i => i._id);
    const foundIds = foundItems.map(i => i._id);

    const matches = await AIMatch.find({
      $or: [
        { lostItem: { $in: lostIds } },
        { foundItem: { $in: foundIds } }
      ]
    }).populate('lostItem').populate('foundItem');

    sendSuccess(res, { matches }, 'AI matches retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getItemMatches = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const matches = await AIMatch.find({
      $or: [
        { lostItem: itemId },
        { foundItem: itemId }
      ]
    }).populate('lostItem').populate('foundItem');

    sendSuccess(res, { matches }, 'Item matches retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const triggerManualMatching = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId, itemType } = req.body;
    if (!itemId || !itemType || !['lost', 'found'].includes(itemType)) {
      sendError(res, 'Invalid itemId or itemType', 400);
      return;
    }

    const matchCount = await triggerMatching(itemId, itemType as 'lost' | 'found');
    sendSuccess(res, { matchCount }, 'Matching workflow triggered successfully');
  } catch (error) {
    next(error);
  }
};
