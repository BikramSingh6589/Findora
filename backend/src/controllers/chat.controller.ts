import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import ChatMessage from '../models/ChatMessage';
import { sendSuccess, sendError } from '../utils/response';

export const getChatMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const messages = await ChatMessage.find({ claimId: itemId })
      .populate('sender', 'name profilePic role')
      .sort({ createdAt: 1 });

    sendSuccess(res, { messages }, 'Chat messages retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const sendChatMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { content } = req.body;

    if (!content) {
      sendError(res, 'Message content is required', 400);
      return;
    }

    const message = await ChatMessage.create({
      claimId: itemId,
      sender: req.user._id,
      content
    });

    const populated = await ChatMessage.findById(message._id)
      .populate('sender', 'name profilePic role');

    sendSuccess(res, { message: populated }, 'Message sent successfully', 201);
  } catch (error) {
    next(error);
  }
};
