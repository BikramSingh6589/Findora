import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';
import { sendError } from '../utils/response';

// Extend Request type to include user properties
export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Not authorized, no token', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      sendError(res, 'Not authorized, invalid token', 401);
      return;
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    if (user.status === 'banned') {
      sendError(res, 'Your account has been banned', 403);
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
