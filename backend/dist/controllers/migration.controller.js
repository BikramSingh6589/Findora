"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixLostItemStatuses = void 0;
const Claim_1 = __importDefault(require("../models/Claim"));
const LostItem_1 = __importDefault(require("../models/LostItem"));
const fixLostItemStatuses = async (req, res) => {
    try {
        // Find all resolved/approved claims
        const resolvedClaims = await Claim_1.default.find({
            status: { $in: ['resolved', 'approved'] }
        }).populate('claimant').populate('foundItemId');
        let fixed = 0;
        for (const claim of resolvedClaims) {
            let targetLostItemId = claim.lostItemId;
            // If not linked, try to find an active LostItem by this user
            if (!targetLostItemId && claim.claimant) {
                const fallbackLostItem = await LostItem_1.default.findOne({ owner: claim.claimant._id, status: 'active' });
                if (fallbackLostItem)
                    targetLostItemId = fallbackLostItem._id;
            }
            if (targetLostItemId) {
                const result = await LostItem_1.default.findByIdAndUpdate(targetLostItemId, { status: 'claimed' }, { new: false });
                if (result && result.status === 'active')
                    fixed++;
            }
        }
        res.json({
            success: true,
            message: `Migration complete. Fixed ${fixed} lost items.`,
            total: resolvedClaims.length,
            fixed
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
exports.fixLostItemStatuses = fixLostItemStatuses;
