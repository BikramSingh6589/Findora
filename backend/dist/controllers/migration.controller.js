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
        // Find all resolved/approved claims that have a lostItemId
        const resolvedClaims = await Claim_1.default.find({
            status: { $in: ['resolved', 'approved'] },
            lostItemId: { $exists: true, $ne: null }
        }).select('lostItemId status');
        let fixed = 0;
        for (const claim of resolvedClaims) {
            if (claim.lostItemId) {
                const result = await LostItem_1.default.findByIdAndUpdate(claim.lostItemId, { status: 'resolved' }, { new: false });
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
