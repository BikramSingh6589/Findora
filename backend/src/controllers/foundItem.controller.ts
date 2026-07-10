import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import FoundItem from '../models/FoundItem';
import LostItem from '../models/LostItem';
import { uploadImage } from '../services/cloudinary.service';
import { processAIData } from '../services/ai.service';
import { addXP } from '../services/reputation.service';
import { sendSuccess, sendError } from '../utils/response';
import { getPagination } from '../utils/pagination';

export const createFoundItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = (req.files || []) as Express.Multer.File[];
    const imageUrls = await Promise.all(files.map(f => uploadImage(f.buffer)));

    const item = await FoundItem.create({
      ...req.body,
      images: imageUrls,
      finder: req.user._id,
    });

    // Trigger AI processing & matching asynchronously (do not await)
    processAIData(item._id.toString(), 'found').catch(console.error);

    // If this FoundItem is linked to an existing LostItem from the Community Board,
    // we instantly hide that LostItem from the community view.
    if (req.body.linkedLostItem) {
      await LostItem.findByIdAndUpdate(req.body.linkedLostItem, { communityHidden: true });
      try {
        const { getIO } = require('../services/socket.service');
        getIO().emit('lost_item_resolved', { itemId: req.body.linkedLostItem });
      } catch (e) {
        console.warn('Socket emit failed for lost_item_resolved:', e);
      }
    }

    // Award XP for reporting a found item
    await addXP(req.user._id, 15);

    // Emit real-time update
    try {
      const { getIO } = require('../services/socket.service');
      const itemWithFinder = await FoundItem.findById(item._id).populate('finder', 'name profilePic');
      getIO().emit('new_found_item', itemWithFinder);
    } catch (e) {
      console.warn('Socket emit failed for new_found_item:', e);
    }

    sendSuccess(res, { item }, 'Found item reported successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getFoundItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, search, status } = req.query;

    const query: any = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query['$text'] = { $search: search as string };

    const [items, total] = await Promise.all([
      FoundItem.find(query)
        .populate('finder', 'name profilePic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      FoundItem.countDocuments(query),
    ]);

    sendSuccess(res, {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, 'Found items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getFoundItemById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await FoundItem.findById(req.params.id).populate('finder', 'name profilePic');
    if (!item) {
      sendError(res, 'Found item not found', 404);
      return;
    }
    sendSuccess(res, { item }, 'Found item retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateFoundItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      sendError(res, 'Found item not found', 404);
      return;
    }

    // Verify finder ownership or admin permission
    if (item.finder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      sendError(res, 'Access denied', 403);
      return;
    }

    const files = (req.files || []) as Express.Multer.File[];
    let imageUrls = item.images;
    if (files.length > 0) {
      imageUrls = await Promise.all(files.map(f => uploadImage(f.buffer)));
    }

    const updated = await FoundItem.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images: imageUrls,
      },
      { new: true, runValidators: true }
    );

    sendSuccess(res, { item: updated }, 'Found item updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteFoundItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      sendError(res, 'Found item not found', 404);
      return;
    }

    // Verify finder ownership or admin permission
    if (item.finder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      sendError(res, 'Access denied', 403);
      return;
    }

    await FoundItem.findByIdAndDelete(req.params.id);
    sendSuccess(res, {}, 'Found item deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const lockFoundItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      sendError(res, 'Found item not found', 404);
      return;
    }

    if (item.status !== 'active') {
      sendError(res, `Item is currently ${item.status} and cannot be locked`, 400);
      return;
    }

    // Check if locked by someone else and lock is not expired
    if (item.lockedBy && item.lockedBy.toString() !== req.user._id.toString()) {
      if (item.lockedUntil && new Date() < item.lockedUntil) {
        sendError(res, 'Item is currently being claimed by someone else', 409);
        return;
      }
    }

    // Lock for 15 minutes
    item.lockedBy = req.user._id;
    item.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await item.save();

    // Emit socket event
    try {
      const { getIO } = require('../services/socket.service');
      const io = getIO();
      io.emit('item_locked', { itemId: item._id, lockedBy: item.lockedBy, lockedUntil: item.lockedUntil });
    } catch (e) {
      console.warn('Socket emit failed for item_locked:', e);
    }

    sendSuccess(res, { item }, 'Item locked successfully');
  } catch (error) {
    next(error);
  }
};

export const unlockFoundItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) {
      sendError(res, 'Found item not found', 404);
      return;
    }

    // Only allow unlock if it's the person who locked it, or admin
    if (item.lockedBy && item.lockedBy.toString() === req.user._id.toString() || req.user.role === 'admin') {
      item.lockedBy = null;
      item.lockedUntil = null;
      await item.save();

      // Emit socket event
      try {
        const { getIO } = require('../services/socket.service');
        const io = getIO();
        io.emit('item_unlocked', { itemId: item._id });
      } catch (e) {
        console.warn('Socket emit failed for item_unlocked:', e);
      }
    }

    sendSuccess(res, { item }, 'Item unlocked successfully');
  } catch (error) {
    next(error);
  }
};
