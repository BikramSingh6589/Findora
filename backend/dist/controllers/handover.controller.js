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
        // Look up claim by either claimId or foundItemId
        const claim = await Claim_1.default.findOne({
            $or: [
                { _id: itemId },
                { foundItemId: itemId }
            ],
            status: { $in: ['approved', 'resolved'] }
        });
        if (!claim) {
            (0, response_1.sendError)(res, 'No active resolved or approved claim found for this item', 404);
            return;
        }
        // Verify claimant or finder access
        const foundItem = await FoundItem_1.default.findById(claim.foundItemId);
        const isClaimant = claim.claimant.toString() === req.user._id.toString();
        const isFinder = foundItem?.finder?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isClaimant && !isFinder && !isAdmin) {
            (0, response_1.sendError)(res, 'Access denied', 403);
            return;
        }
        // Check QR expiration
        if (claim.qrExpiresAt && new Date() > new Date(claim.qrExpiresAt)) {
            (0, response_1.sendError)(res, 'QR Code has expired', 400);
            return;
        }
        (0, response_1.sendSuccess)(res, {
            qrToken: claim.qrToken,
            qrCodeUrl: claim.qrCodeUrl,
            expiresAt: claim.qrExpiresAt || claim.updatedAt
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
        const claim = await Claim_1.default.findOne({
            $or: [
                { _id: itemId },
                { foundItemId: itemId }
            ],
            qrToken,
            status: { $in: ['approved', 'resolved'] }
        }).populate('claimant', 'name email profilePic studentId')
            .populate('foundItemId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Invalid or expired QR code', 400);
            return;
        }
        if (!claim.qrToken) {
            (0, response_1.sendError)(res, 'This QR code has already been scanned/used', 400);
            return;
        }
        // Check QR expiration
        if (claim.qrExpiresAt && new Date() > new Date(claim.qrExpiresAt)) {
            (0, response_1.sendError)(res, 'QR Code has expired', 400);
            return;
        }
        const foundItem = claim.foundItemId;
        const isFinder = foundItem?.finder?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isFinder && !isAdmin) {
            (0, response_1.sendError)(res, 'Only the item finder or admin can verify the handover QR', 403);
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
        const claim = await Claim_1.default.findOne({
            $or: [
                { _id: itemId },
                { foundItemId: itemId }
            ],
            qrToken,
            status: { $in: ['approved', 'resolved'] }
        }).populate('claimant')
            .populate('foundItemId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Invalid or expired QR code', 400);
            return;
        }
        if (!claim.qrToken) {
            (0, response_1.sendError)(res, 'This QR code has already been verified/used', 400);
            return;
        }
        // Check QR expiration
        if (claim.qrExpiresAt && new Date() > new Date(claim.qrExpiresAt)) {
            (0, response_1.sendError)(res, 'QR Code has expired', 400);
            return;
        }
        const foundItem = claim.foundItemId;
        const isFinder = foundItem?.finder?.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isFinder && !isAdmin) {
            (0, response_1.sendError)(res, 'Only the item finder or admin can confirm the handover', 403);
            return;
        }
        // Mark items as returned/resolved
        await FoundItem_1.default.findByIdAndUpdate(foundItem._id, { status: 'resolved' });
        // Find linked lost item or fallback based on owner
        let targetLostItemId = claim.lostItemId;
        if (!targetLostItemId && claim.claimant) {
            const fallbackLostItem = await LostItem_1.default.findOne({ owner: claim.claimant._id, status: { $in: ['active', 'claimed'] } });
            if (fallbackLostItem)
                targetLostItemId = fallbackLostItem._id;
        }
        if (targetLostItemId) {
            await LostItem_1.default.findByIdAndUpdate(targetLostItemId, { status: 'resolved' });
        }
        // Award XP and increment returned count
        const claimant = claim.claimant;
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
        }
        catch (e) {
            console.warn('Socket emit failed for handover_confirmed:', e);
        }
        (0, response_1.sendSuccess)(res, { claim }, 'Item successfully returned! Reputation points distributed.');
    }
    catch (error) {
        next(error);
    }
};
exports.confirmHandover = confirmHandover;
