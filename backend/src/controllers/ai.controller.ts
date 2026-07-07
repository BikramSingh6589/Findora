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

    // Security Check: Verify item ownership/finder status or admin role
    const lostItem = await LostItem.findById(itemId);
    const foundItem = await FoundItem.findById(itemId);

    if (!lostItem && !foundItem) {
      sendError(res, 'Item not found', 404);
      return;
    }

    const isOwner = lostItem && String(lostItem.owner) === String(req.user._id);
    const isFinder = foundItem && String(foundItem.finder) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFinder && !isAdmin) {
      sendError(res, 'Access denied. You do not own this item.', 403);
      return;
    }

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

export const getMatchDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { matchId } = req.params;

    const match = await AIMatch.findById(matchId).populate('lostItem').populate('foundItem');
    if (!match) {
      sendError(res, 'Match not found', 404);
      return;
    }

    // Security Check: Verify that the user is the owner of the lost item, finder of the found item, or admin
    const lostItem = match.lostItem as any;
    const foundItem = match.foundItem as any;

    const isOwner = lostItem && String(lostItem.owner) === String(req.user._id);
    const isFinder = foundItem && String(foundItem.finder) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFinder && !isAdmin) {
      sendError(res, 'Access denied. You do not own the items associated with this match.', 403);
      return;
    }

    sendSuccess(res, { match }, 'Match details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateMatchStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { matchId } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'reviewed', 'dismissed'].includes(status)) {
      sendError(res, 'Invalid status. Must be new, reviewed, or dismissed.', 400);
      return;
    }

    const match = await AIMatch.findById(matchId).populate('lostItem').populate('foundItem');
    if (!match) {
      sendError(res, 'Match not found', 404);
      return;
    }

    // Security Check: Verify that the user is the owner of the lost item, finder of the found item, or admin
    const lostItem = match.lostItem as any;
    const foundItem = match.foundItem as any;

    const isOwner = lostItem && String(lostItem.owner) === String(req.user._id);
    const isFinder = foundItem && String(foundItem.finder) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFinder && !isAdmin) {
      sendError(res, 'Access denied. You cannot modify this match status.', 403);
      return;
    }

    match.status = status as 'new' | 'reviewed' | 'dismissed';
    await match.save();

    sendSuccess(res, { match }, 'Match status updated successfully');
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
