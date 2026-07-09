import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import AIMatch from '../models/AIMatch';
import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import { processAIData } from '../services/ai.service';
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

    // Filter out matches where populated items are null (deleted)
    const activeMatches = matches.filter(m => m.lostItem && m.foundItem).map(m => {
      const matchObj = m.toObject();
      if (matchObj.lostItem) {
        (matchObj.lostItem as any).title = (matchObj.lostItem as any).itemName;
        (matchObj.lostItem as any).location = (matchObj.lostItem as any).locationLost;
      }
      if (matchObj.foundItem) {
        (matchObj.foundItem as any).title = (matchObj.foundItem as any).itemName;
        (matchObj.foundItem as any).location = (matchObj.foundItem as any).locationFound;
      }
      return matchObj;
    });

    sendSuccess(res, { matches: activeMatches }, 'AI matches retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getItemMatches = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const itemId = req.params.itemId as string;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      sendError(res, 'Invalid item ID format', 400);
      return;
    }

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

    // Filter out matches where populated items are null (deleted)
    const activeMatches = matches.filter(m => m.lostItem && m.foundItem).map(m => {
      const matchObj = m.toObject();
      if (matchObj.lostItem) {
        (matchObj.lostItem as any).title = (matchObj.lostItem as any).itemName;
        (matchObj.lostItem as any).location = (matchObj.lostItem as any).locationLost;
      }
      if (matchObj.foundItem) {
        (matchObj.foundItem as any).title = (matchObj.foundItem as any).itemName;
        (matchObj.foundItem as any).location = (matchObj.foundItem as any).locationFound;
      }
      return matchObj;
    });

    sendSuccess(res, { matches: activeMatches }, 'Item matches retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMatchDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const matchId = req.params.matchId as string;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      sendError(res, 'Invalid match ID format', 400);
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

    if (!lostItem || !foundItem) {
      sendError(res, 'Match associated items are no longer available', 404);
      return;
    }

    const isOwner = String(lostItem.owner) === String(req.user._id);
    const isFinder = String(foundItem.finder) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isFinder && !isAdmin) {
      sendError(res, 'Access denied. You do not own the items associated with this match.', 403);
      return;
    }

    const matchObj = match.toObject();
    if (matchObj.lostItem) {
      (matchObj.lostItem as any).title = (matchObj.lostItem as any).itemName;
      (matchObj.lostItem as any).location = (matchObj.lostItem as any).locationLost;
    }
    if (matchObj.foundItem) {
      (matchObj.foundItem as any).title = (matchObj.foundItem as any).itemName;
      (matchObj.foundItem as any).location = (matchObj.foundItem as any).locationFound;
    }

    sendSuccess(res, { match: matchObj }, 'Match details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateMatchStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const matchId = req.params.matchId as string;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      sendError(res, 'Invalid match ID format', 400);
      return;
    }

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

    if (!lostItem || !foundItem) {
      sendError(res, 'Match associated items are no longer available', 404);
      return;
    }

    const isOwner = String(lostItem.owner) === String(req.user._id);
    const isFinder = String(foundItem.finder) === String(req.user._id);
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

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      sendError(res, 'Invalid item ID format', 400);
      return;
    }

    await processAIData(itemId, itemType as 'lost' | 'found');

    const matchCount = await AIMatch.countDocuments({
      $or: [
        { lostItem: itemId },
        { foundItem: itemId }
      ],
      status: { $ne: 'dismissed' }
    });

    sendSuccess(res, { matchCount }, 'Matching workflow triggered successfully');
  } catch (error) {
    next(error);
  }
};
