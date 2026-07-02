import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import CommunityPost from '../models/CommunityPost';
import { sendSuccess, sendError } from '../utils/response';
import { addXP } from '../services/reputation.service';

export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { content, type, itemId } = req.body;
    
    // Auto-expiry in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const post = await CommunityPost.create({
      author: req.user._id,
      content,
      type: type || 'found',
      itemId: itemId || undefined,
      expiresAt,
      status: 'active',
    });

    // Award 5 XP for community contribution
    await addXP(req.user._id, 5);

    // Populate author before returning
    const populatedPost = await post.populate('author', 'name profilePic');

    sendSuccess(res, { post: populatedPost }, 'Community post created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Only return posts that are active or approved, and not expired
    const posts = await CommunityPost.find({
      status: { $in: ['active', 'approved'] },
      expiresAt: { $gt: new Date() },
    })
      .populate('author', 'name profilePic')
      .populate('itemId', 'itemName locationFound dateFound images status')
      .sort({ createdAt: -1 });

    sendSuccess(res, { posts }, 'Community posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const flagPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reason } = req.body;
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      {
        status: 'flagged',
        flagReason: reason || 'Flagged by community',
      },
      { new: true }
    );

    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }

    sendSuccess(res, { post }, 'Post flagged for moderation');
  } catch (error) {
    next(error);
  }
};

export const suggestOwner = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { suggestedUserId, note } = req.body;
    
    // In a full implementation, this triggers a notification. For now, we return success.
    sendSuccess(res, {}, 'Ownership suggestion submitted successfully');
  } catch (error) {
    next(error);
  }
};
