import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import Claim from '../models/Claim';
import { sendSuccess, sendError } from '../utils/response';

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, profilePic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, profilePic },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find()
      .sort({ xp: -1 })
      .limit(20)
      .select('name xp level badges itemsReturned itemsReported profilePic role');
    
    sendSuccess(res, { users }, 'Leaderboard retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUserReports = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.params.id;
    const lostItems = await LostItem.find({ owner: userId }).sort({ createdAt: -1 });
    const foundItems = await FoundItem.find({ finder: userId }).sort({ createdAt: -1 });
    
    sendSuccess(res, { lostItems, foundItems }, 'User reports retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUserHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user._id;
    const [lostItems, foundItems, claims] = await Promise.all([
      LostItem.find({ owner: userId }).sort({ createdAt: -1 }),
      FoundItem.find({ finder: userId }).sort({ createdAt: -1 }),
      Claim.find({ claimant: userId })
        .populate('foundItemId', 'itemName category brand color images status locationFound')
        .populate('lostItemId', 'itemName category brand color status locationLost')
        .sort({ createdAt: -1 }),
    ]);
    
    sendSuccess(res, { lostItems, foundItems, claims }, 'User history retrieved');
  } catch (error) {
    next(error);
  }
};
