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
    // Find all resolved/approved claims that have a lostItemId
    const resolvedClaims = await Claim.find({
      status: { $in: ['resolved', 'approved'] },
      lostItemId: { $exists: true, $ne: null }
    }).select('lostItemId status');

    let fixed = 0;
    for (const claim of resolvedClaims) {
      if ((claim as any).lostItemId) {
        const result = await LostItem.findByIdAndUpdate(
          (claim as any).lostItemId,
          { status: 'resolved' },
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
