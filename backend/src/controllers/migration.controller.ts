/**
 * One-time migration: mark LostItems as 'resolved' for all claims
 * that are already resolved/approved but whose lostItem is still 'active'.
 * 
 * Call this as: POST /api/admin/migrate/fix-lost-item-statuses
 * (requires admin auth)
 */
import { Request, Response } from 'express';
import Claim from '../models/Claim';
import LostItem from '../models/LostItem';

export const fixLostItemStatuses = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all resolved/approved claims
    const resolvedClaims = await Claim.find({
      status: { $in: ['resolved', 'approved'] }
    }).populate('claimant').populate('foundItemId');

    let fixed = 0;
    for (const claim of resolvedClaims) {
      let targetLostItemId = (claim as any).lostItemId;
      
      // If not linked, try to find an active LostItem by this user
      if (!targetLostItemId && claim.claimant) {
        const fallbackLostItem = await LostItem.findOne({ owner: claim.claimant._id, status: 'active' });
        if (fallbackLostItem) targetLostItemId = fallbackLostItem._id;
      }

      if (targetLostItemId) {
        const result = await LostItem.findByIdAndUpdate(
          targetLostItemId,
          { status: 'claimed' },
          { new: false }
        );
        if (result && result.status === 'active') fixed++;
      }
    }

    res.json({
      success: true,
      message: `Migration complete. Fixed ${fixed} lost items.`,
      total: resolvedClaims.length,
      fixed
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
