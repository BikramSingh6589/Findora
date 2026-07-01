import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import FoundItem from '../models/FoundItem';
import { uploadImage } from '../services/cloudinary.service';
import { triggerMatching } from '../services/ai.service';
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

    // Trigger AI matching asynchronously
    triggerMatching(item._id.toString(), 'found').catch(console.error);

    // Award XP for reporting a found item
    await addXP(req.user._id, 15);

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
