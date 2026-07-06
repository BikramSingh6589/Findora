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
    
    // Look up claim by either claimId or foundItemId
    const claim = await Claim.findOne({
      $or: [
        { _id: itemId },
        { foundItemId: itemId }
      ],
      status: { $in: ['approved', 'resolved'] }
    });

    if (!claim) {
      sendError(res, 'No active resolved or approved claim found for this item', 404);
      return;
    }

    // Verify claimant or finder access
    const foundItem = await FoundItem.findById(claim.foundItemId);
    const isClaimant = claim.claimant.toString() === req.user._id.toString();
    const isFinder = foundItem?.finder?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isClaimant && !isFinder && !isAdmin) {
      sendError(res, 'Access denied', 403);
      return;
    }

    // Check QR expiration
    if (claim.qrExpiresAt && new Date() > new Date(claim.qrExpiresAt)) {
      sendError(res, 'QR Code has expired', 400);
      return;
    }

    sendSuccess(res, {
      qrToken: claim.qrToken,
      qrCodeUrl: claim.qrCodeUrl,
      expiresAt: claim.qrExpiresAt || claim.updatedAt
    }, 'QR data retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const scanHandoverQR = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { itemId } = req.params;
    const { qrToken } = req.body;

    const claim = await Claim.findOne({
      $or: [
        { _id: itemId },
        { foundItemId: itemId }
      ],
      qrToken,
      status: { $in: ['approved', 'resolved'] }
    }).populate('claimant', 'name email profilePic studentId')
      .populate('foundItemId');

    if (!claim) {
      sendError(res, 'Invalid or expired QR code', 400);
      return;
    }

    if (!claim.qrToken) {
      sendError(res, 'This QR code has already been scanned/used', 400);
      return;
    }

    // Check QR expiration
    if (claim.qrExpiresAt && new Date() > new Date(claim.qrExpiresAt)) {
      sendError(res, 'QR Code has expired', 400);
      return;
    }

    const foundItem = claim.foundItemId as any;
    const isFinder = foundItem?.finder?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFinder && !isAdmin) {
      sendError(res, 'Only the item finder or admin can verify the handover QR', 403);
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

    const claim = await Claim.findOne({
      $or: [
        { _id: itemId },
        { foundItemId: itemId }
      ],
      qrToken,
      status: { $in: ['approved', 'resolved'] }
    }).populate('claimant')
      .populate('foundItemId');

    if (!claim) {
      sendError(res, 'Invalid or expired QR code', 400);
      return;
    }

    if (!claim.qrToken) {
      sendError(res, 'This QR code has already been verified/used', 400);
      return;
    }

    // Check QR expiration
    if (claim.qrExpiresAt && new Date() > new Date(claim.qrExpiresAt)) {
      sendError(res, 'QR Code has expired', 400);
      return;
    }

    const foundItem: any = claim.foundItemId;
    const isFinder = foundItem?.finder?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFinder && !isAdmin) {
      sendError(res, 'Only the item finder or admin can confirm the handover', 403);
      return;
    }

    // Mark items as returned/resolved
    await FoundItem.findByIdAndUpdate(foundItem._id, { status: 'resolved' });
    
    // Find linked lost item or fallback based on owner
    let targetLostItemId = claim.lostItemId;
    if (!targetLostItemId && claim.claimant) {
      const fallbackLostItem = await LostItem.findOne({ owner: claim.claimant._id, status: { $in: ['active', 'claimed'] } });
      if (fallbackLostItem) targetLostItemId = fallbackLostItem._id;
    }
    
    if (targetLostItemId) {
      await LostItem.findByIdAndUpdate(targetLostItemId, { status: 'resolved' });
    }

    // Award XP and increment returned count
    const claimant: any = claim.claimant;

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

    // Invalidate QR Token to prevent reuse
    claim.qrToken = '';
    await claim.save();
    
    // Notify room via socket
    try {
      const { getIO } = require('../services/socket.service');
      const io = getIO();
      io.to(`claim:${claim._id}`).emit('handover_confirmed', {
        claimId: claim._id,
        status: 'resolved'
      });
    } catch (e) {
      console.warn('Socket emit failed for handover_confirmed:', e);
    }
    
    sendSuccess(res, { claim }, 'Item successfully returned! Reputation points distributed.');
  } catch (error) {
    next(error);
  }
};
