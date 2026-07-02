import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import Claim from '../models/Claim';
import FoundItem from '../models/FoundItem';
import LostItem from '../models/LostItem';
import User from '../models/User';
import { addXP } from '../services/reputation.service';
import { sendSuccess, sendError } from '../utils/response';

export const getHandoverQR = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const claim = await Claim.findOne({ foundItemId: itemId, status: 'approved' });
    if (!claim) {
      sendError(res, 'No approved claim found for this item', 404);
      return;
    }

    sendSuccess(res, {
      qrToken: claim.qrToken,
      qrCodeUrl: claim.qrCodeUrl,
      expiresAt: claim.updatedAt
    }, 'QR data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const scanHandoverQR = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { qrToken } = req.body;

    const claim = await Claim.findOne({ foundItemId: itemId, qrToken, status: 'approved' })
      .populate('claimant', 'name email profilePic studentId');

    if (!claim) {
      sendError(res, 'Invalid or expired QR code', 400);
      return;
    }

    sendSuccess(res, { claim, claimant: claim.claimant }, 'QR code verified successfully');
  } catch (error) {
    next(error);
  }
};

export const confirmHandover = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { qrToken } = req.body;

    const claim = await Claim.findOne({ foundItemId: itemId, qrToken, status: 'approved' })
      .populate('claimant')
      .populate('foundItemId');

    if (!claim) {
      sendError(res, 'Invalid or expired QR code', 400);
      return;
    }

    // Mark items as returned/resolved
    await FoundItem.findByIdAndUpdate(itemId, { status: 'claimed' });
    if (claim.lostItemId) {
      await LostItem.findByIdAndUpdate(claim.lostItemId, { status: 'resolved' });
    }

    // Award XP and increment returned count
    const claimant: any = claim.claimant;
    const foundItem: any = claim.foundItemId;

    if (claimant) {
      await addXP(claimant._id.toString(), 50);
    }

    if (foundItem && foundItem.finder) {
      const finderId = foundItem.finder.toString();
      const claimantId = claimant ? claimant._id.toString() : '';
      
      if (finderId !== claimantId) {
        await addXP(finderId, 100);
        await User.findByIdAndUpdate(finderId, { $inc: { itemsReturned: 1 } });
      }
    }

    // We can update claim status to 'completed' or keep it 'approved' (we keep it, or we delete/archive it)
    // To allow historic tracking, let's keep it.
    
    sendSuccess(res, { claim }, 'Item successfully returned! Reputation points distributed.');
  } catch (error) {
    next(error);
  }
};
