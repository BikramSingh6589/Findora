"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmHandover = exports.scanHandoverQR = exports.getHandoverQR = void 0;
const Claim_1 = __importDefault(require("../models/Claim"));
const FoundItem_1 = __importDefault(require("../models/FoundItem"));
const LostItem_1 = __importDefault(require("../models/LostItem"));
const User_1 = __importDefault(require("../models/User"));
const reputation_service_1 = require("../services/reputation.service");
const response_1 = require("../utils/response");
const getHandoverQR = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const claim = await Claim_1.default.findOne({ foundItemId: itemId, status: 'approved' });
        if (!claim) {
            (0, response_1.sendError)(res, 'No approved claim found for this item', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, {
            qrToken: claim.qrToken,
            qrCodeUrl: claim.qrCodeUrl,
            expiresAt: claim.updatedAt
        }, 'QR data retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getHandoverQR = getHandoverQR;
const scanHandoverQR = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { qrToken } = req.body;
        const claim = await Claim_1.default.findOne({ foundItemId: itemId, qrToken, status: 'approved' })
            .populate('claimant', 'name email profilePic studentId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Invalid or expired QR code', 400);
            return;
        }
        (0, response_1.sendSuccess)(res, { claim, claimant: claim.claimant }, 'QR code verified successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.scanHandoverQR = scanHandoverQR;
const confirmHandover = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { qrToken } = req.body;
        const claim = await Claim_1.default.findOne({ foundItemId: itemId, qrToken, status: 'approved' })
            .populate('claimant')
            .populate('foundItemId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Invalid or expired QR code', 400);
            return;
        }
        // Mark items as returned/resolved
        await FoundItem_1.default.findByIdAndUpdate(itemId, { status: 'claimed' });
        if (claim.lostItemId) {
            await LostItem_1.default.findByIdAndUpdate(claim.lostItemId, { status: 'resolved' });
        }
        // Award XP and increment returned count
        const claimant = claim.claimant;
        const foundItem = claim.foundItemId;
        if (claimant) {
            await (0, reputation_service_1.addXP)(claimant._id.toString(), 50);
        }
        if (foundItem && foundItem.finder) {
            const finderId = foundItem.finder.toString();
            const claimantId = claimant ? claimant._id.toString() : '';
            if (finderId !== claimantId) {
                await (0, reputation_service_1.addXP)(finderId, 100);
                await User_1.default.findByIdAndUpdate(finderId, { $inc: { itemsReturned: 1 } });
            }
        }
        // We can update claim status to 'completed' or keep it 'approved' (we keep it, or we delete/archive it)
        // To allow historic tracking, let's keep it.
        (0, response_1.sendSuccess)(res, { claim }, 'Item successfully returned! Reputation points distributed.');
    }
    catch (error) {
        next(error);
    }
};
exports.confirmHandover = confirmHandover;
