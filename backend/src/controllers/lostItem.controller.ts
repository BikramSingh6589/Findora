import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import LostItem from '../models/LostItem';
import { uploadImage } from '../services/cloudinary.service';
import { processAIData } from '../services/ai.service';
import { addXP } from '../services/reputation.service';
import { sendSuccess, sendError } from '../utils/response';
import { getPagination } from '../utils/pagination';

export const createLostItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = (req.files || []) as Express.Multer.File[];
    const imageUrls = await Promise.all(files.map(f => uploadImage(f.buffer)));

    const item = await LostItem.create({
      ...req.body,
      images: imageUrls,
      owner: req.user._id,
    });

    // Trigger AI processing & matching asynchronously (do not await)
    processAIData(item._id.toString(), 'lost').catch(console.error);

    // Award XP for reporting a lost item
    await addXP(req.user._id, 10);

    // Emit real-time update
    try {
      const { getIO } = require('../services/socket.service');
      const itemWithOwner = await LostItem.findById(item._id).populate('owner', 'name profilePic');
      getIO().emit('new_lost_item', itemWithOwner);
    } catch (e) {
      console.warn('Socket emit failed for new_lost_item:', e);
    }

    sendSuccess(res, { item }, 'Lost item reported successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getLostItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { category, search, status } = req.query;

    const query: any = {};
    if (category) query.category = category;
    // Default to 'active' only — hide resolved/archived from community feed
    query.status = (status as string) || 'active';
    query.communityHidden = { $ne: true };
    if (search) query['$text'] = { $search: search as string };

    const [items, total] = await Promise.all([
      LostItem.find(query)
        .populate('owner', 'name profilePic')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LostItem.countDocuments(query),
    ]);

    sendSuccess(res, {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }, 'Lost items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getLostItemById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id).populate('owner', 'name profilePic');
    if (!item) {
      sendError(res, 'Lost item not found', 404);
      return;
    }
    sendSuccess(res, { item }, 'Lost item retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateLostItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      sendError(res, 'Lost item not found', 404);
      return;
    }

    // Verify ownership or admin permission
    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      sendError(res, 'Access denied', 403);
      return;
    }

    const files = (req.files || []) as Express.Multer.File[];
    let imageUrls = item.images;
    if (files.length > 0) {
      imageUrls = await Promise.all(files.map(f => uploadImage(f.buffer)));
    }

    const updated = await LostItem.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images: imageUrls,
      },
      { new: true, runValidators: true }
    );

    sendSuccess(res, { item: updated }, 'Lost item updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteLostItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      sendError(res, 'Lost item not found', 404);
      return;
    }

    // Verify ownership or admin permission
    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      sendError(res, 'Access denied', 403);
      return;
    }

    await LostItem.findByIdAndDelete(req.params.id);
    sendSuccess(res, {}, 'Lost item deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const resolveLostItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      sendError(res, 'Lost item not found', 404);
      return;
    }

    // Verify ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      sendError(res, 'Access denied', 403);
      return;
    }

    if (item.status === 'resolved') {
      sendError(res, 'Item is already resolved', 400);
      return;
    }

    item.status = 'resolved';
    await item.save();

    sendSuccess(res, { item }, 'Lost item marked as resolved successfully');
  } catch (error) {
    next(error);
  }
};

export const revertLostItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) {
      sendError(res, 'Lost item not found', 404);
      return;
    }

    // Verify ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      sendError(res, 'Access denied', 403);
      return;
    }

    if (item.status !== 'resolved') {
      sendError(res, 'Item is not resolved', 400);
      return;
    }

    item.status = 'active';
    await item.save();

    sendSuccess(res, { item }, 'Lost item reverted to active successfully');
  } catch (error) {
    next(error);
  }
};
