import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import Claim from '../models/Claim';
import CommunityPost from '../models/CommunityPost';
import { sendSuccess, sendError } from '../utils/response';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalLost, totalFound, pendingClaims, resolvedToday, totalUsers] = await Promise.all([
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      Claim.countDocuments({ status: 'pending' }),
      Claim.countDocuments({ status: 'approved', updatedAt: { $gte: todayStart } }),
      User.countDocuments(),
    ]);

    sendSuccess(res, {
      totalLost,
      totalFound,
      pendingClaims,
      resolvedToday,
      totalUsers,
    }, 'Dashboard stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    // Calculate reports count for each user
    const usersWithDetails = await Promise.all(users.map(async (user) => {
      const [lostCount, foundCount] = await Promise.all([
        LostItem.countDocuments({ owner: user._id }),
        FoundItem.countDocuments({ finder: user._id }),
      ]);
      return {
        ...user.toObject(),
        reportsCount: lostCount + foundCount,
      };
    }));

    sendSuccess(res, { users: usersWithDetails }, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    
    if (!['active', 'warned', 'suspended', 'banned'].includes(status)) {
      sendError(res, 'Invalid user status', 400);
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, { user }, 'User status updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      sendError(res, 'Invalid user role', 400);
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, { user }, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getItems = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [lostItems, foundItems] = await Promise.all([
      LostItem.find({}).populate('owner', 'name email').sort({ createdAt: -1 }),
      FoundItem.find({}).populate('finder', 'name email').sort({ createdAt: -1 }),
    ]);

    const mappedLost = lostItems.map(item => ({
      id: item._id,
      name: item.itemName,
      type: 'lost',
      reporter: (item.owner as any)?.name || 'Unknown',
      location: item.locationLost,
      date: item.createdAt,
      status: item.status,
      img: item.images[0] || '',
    }));

    const mappedFound = foundItems.map(item => ({
      id: item._id,
      name: item.itemName,
      type: 'found',
      reporter: (item.finder as any)?.name || 'Unknown',
      location: item.locationFound,
      date: item.createdAt,
      status: item.status,
      img: item.images[0] || '',
    }));

    const allItems = [...mappedLost, ...mappedFound].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sendSuccess(res, { items: allItems }, 'Items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const approveItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (lostItem) {
      lostItem.status = 'active';
      await lostItem.save();
      sendSuccess(res, { item: lostItem }, 'Item approved successfully');
      return;
    }

    const foundItem = await FoundItem.findById(req.params.id);
    if (foundItem) {
      foundItem.status = 'active';
      await foundItem.save();
      sendSuccess(res, { item: foundItem }, 'Item approved successfully');
      return;
    }

    sendError(res, 'Item not found', 404);
  } catch (error) {
    next(error);
  }
};

export const rejectItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (lostItem) {
      lostItem.status = 'archived';
      await lostItem.save();
      sendSuccess(res, { item: lostItem }, 'Item rejected and archived successfully');
      return;
    }

    const foundItem = await FoundItem.findById(req.params.id);
    if (foundItem) {
      foundItem.status = 'archived';
      await foundItem.save();
      sendSuccess(res, { item: foundItem }, 'Item rejected and archived successfully');
      return;
    }

    sendError(res, 'Item not found', 404);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lostDeleted = await LostItem.findByIdAndDelete(req.params.id);
    if (lostDeleted) {
      sendSuccess(res, {}, 'Item deleted successfully');
      return;
    }

    const foundDeleted = await FoundItem.findByIdAndDelete(req.params.id);
    if (foundDeleted) {
      sendSuccess(res, {}, 'Item deleted successfully');
      return;
    }

    sendError(res, 'Item not found', 404);
  } catch (error) {
    next(error);
  }
};

export const getCommunityPosts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await CommunityPost.find({})
      .populate('author', 'name email profilePic')
      .sort({ createdAt: -1 });
    sendSuccess(res, { posts }, 'Community posts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const approveCommunityPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('author', 'name email profilePic');
    
    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }
    sendSuccess(res, { post }, 'Post approved successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteCommunityPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { status: 'removed' },
      { new: true }
    ).populate('author', 'name email profilePic');
    
    if (!post) {
      sendError(res, 'Post not found', 404);
      return;
    }
    sendSuccess(res, { post }, 'Post removed successfully');
  } catch (error) {
    next(error);
  }
};
