"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediationResolve = exports.mediateClaim = exports.resolveClaim = exports.rejectClaim = exports.approveClaim = exports.cancelClaim = exports.getClaimById = exports.getClaims = exports.submitClaim = void 0;
const uuid_1 = require("uuid");
const Claim_1 = __importDefault(require("../models/Claim"));
const FoundItem_1 = __importDefault(require("../models/FoundItem"));
const LostItem_1 = __importDefault(require("../models/LostItem"));
const cloudinary_service_1 = require("../services/cloudinary.service");
const qr_service_1 = require("../services/qr.service");
const email_service_1 = require("../services/email.service");
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
/**
 * Helper to calculate a similarity confidence score for a claim.
 */
const calculateConfidence = async (foundItemId, lostItemId, answers) => {
    let confidence = 0;
    // 1. Completeness of answers (up to 30%)
    if (answers) {
        let answersCount = 0;
        if (answers.location && answers.location.trim().length > 0)
            answersCount++;
        if (answers.dateDetails && answers.dateDetails.trim().length > 0)
            answersCount++;
        if (answers.colorMatch && answers.colorMatch.trim().length > 0)
            answersCount++;
        if (answers.specialMarks && answers.specialMarks.trim().length > 0)
            answersCount++;
        confidence += (answersCount / 4) * 30;
    }
    // 2. Similarity with reported lost item if provided (up to 70% extra)
    if (lostItemId) {
        try {
            const lostItem = await LostItem_1.default.findById(lostItemId);
            const foundItem = await FoundItem_1.default.findById(foundItemId);
            if (lostItem && foundItem) {
                let matchScore = 0;
                // Category match: 25%
                if (lostItem.category.trim().toLowerCase() === foundItem.category.trim().toLowerCase()) {
                    matchScore += 25;
                }
                // Color match: 20%
                if (lostItem.color.trim().toLowerCase() === foundItem.color.trim().toLowerCase()) {
                    matchScore += 20;
                }
                // Brand match: 15%
                if (lostItem.brand &&
                    foundItem.brand &&
                    lostItem.brand.trim().toLowerCase() === foundItem.brand.trim().toLowerCase()) {
                    matchScore += 15;
                }
                // Date proximity: 15%
                if (lostItem.dateLost && foundItem.dateFound) {
                    const diffTime = Math.abs(lostItem.dateLost.getTime() - foundItem.dateFound.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays <= 3) {
                        matchScore += 15;
                    }
                    else if (diffDays <= 7) {
                        matchScore += 10;
                    }
                }
                // Location proximity (keyword overlap): 10%
                if (lostItem.locationLost && foundItem.locationFound) {
                    const lostWords = new Set(lostItem.locationLost.toLowerCase().split(/\s+/));
                    const foundWords = foundItem.locationFound.toLowerCase().split(/\s+/);
                    const common = foundWords.filter(w => lostWords.has(w) && w.length > 2);
                    if (common.length > 0) {
                        matchScore += 10;
                    }
                }
                // ColorMatch validation flag: 15%
                if (answers && answers.colorMatch && answers.colorMatch.trim().toLowerCase() === 'yes') {
                    matchScore += 15;
                }
                // Blend basic completeness score (50% weight) and strict match score (50% weight)
                confidence = Math.min(Math.round(matchScore + (confidence * 0.5)), 100);
            }
        }
        catch (error) {
            console.error('Error calculating confidence:', error);
        }
    }
    else {
        // If no lostItem, confidence is purely answer based (up to 40% total)
        if (answers && answers.specialMarks && answers.specialMarks.trim().length > 5) {
            confidence += 10;
        }
    }
    return confidence;
};
/**
 * Submit a claim for a found item.
 */
const submitClaim = async (req, res, next) => {
    try {
        let { foundItemId, lostItemId, answers, proofUrls: incomingProofUrls } = req.body;
        if (!foundItemId) {
            (0, response_1.sendError)(res, 'Found item ID is required', 400);
            return;
        }
        const foundItem = await FoundItem_1.default.findById(foundItemId);
        if (!foundItem) {
            (0, response_1.sendError)(res, 'Found item not found', 404);
            return;
        }
        // Check item status
        if (foundItem.status !== 'active') {
            (0, response_1.sendError)(res, 'Found item is already claimed or archived', 400);
            return;
        }
        // Business Rule: Claimant cannot be the finder of the found item
        if (foundItem.finder.toString() === req.user._id.toString()) {
            (0, response_1.sendError)(res, 'You cannot claim an item that you reported as found', 400);
            return;
        }
        // Business Rule: Retrieve existing claim if it already exists
        const existingClaim = await Claim_1.default.findOne({
            foundItemId,
            claimant: req.user._id,
        });
        if (existingClaim) {
            (0, response_1.sendSuccess)(res, { claim: existingClaim }, 'Retrieved existing claim.', 200);
            return;
        }
        // Handle upload files if sent via multer
        const files = (req.files || []);
        const uploadedProofUrls = await Promise.all(files.map(f => (0, cloudinary_service_1.uploadImage)(f.buffer, 'claim-proofs')));
        // Combine incoming and uploaded proof URLs
        const finalProofUrls = [
            ...(Array.isArray(incomingProofUrls) ? incomingProofUrls : []),
            ...uploadedProofUrls,
        ];
        // Auto-link a LostItem if not explicitly provided
        if (!lostItemId) {
            const potentialLostItem = await LostItem_1.default.findOne({
                owner: req.user._id,
                category: foundItem.category,
                status: 'active'
            });
            if (potentialLostItem) {
                lostItemId = potentialLostItem._id;
            }
        }
        // Calculate confidence match score
        const confidence = await calculateConfidence(foundItemId, lostItemId, answers);
        // Create the Claim
        const claim = await Claim_1.default.create({
            foundItemId,
            lostItemId: lostItemId || undefined,
            claimant: req.user._id,
            answers,
            proofUrls: finalProofUrls,
            confidence,
            status: 'pending',
        });
        // Reserve the FoundItem and clear any locks
        await FoundItem_1.default.findByIdAndUpdate(foundItemId, {
            status: 'claimed',
            lockedBy: null,
            lockedUntil: null
        });
        // Also update LostItem status if provided
        if (lostItemId) {
            await LostItem_1.default.findByIdAndUpdate(lostItemId, { status: 'claimed' });
        }
        // Emit socket event to update Community Board
        try {
            const { getIO } = require('../services/socket.service');
            const io = getIO();
            io.emit('item_claimed', { itemId: foundItemId });
            if (lostItemId) {
                io.emit('lost_item_claimed', { itemId: lostItemId });
            }
        }
        catch (e) {
            console.warn('Socket emit failed for item_claimed:', e);
        }
        (0, response_1.sendSuccess)(res, { claim }, 'Claim submitted successfully. Item reserved.', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.submitClaim = submitClaim;
/**
 * Get claims.
 * Regular users see only their own claims.
 * Admins see all claims, with optional filter by status.
 */
const getClaims = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
        const { status } = req.query;
        const query = {};
        if (req.user.role === 'admin') {
            if (status)
                query.status = status;
        }
        else {
            const userFoundItems = await FoundItem_1.default.find({ finder: req.user._id }).select('_id');
            const foundItemIds = userFoundItems.map(item => item._id);
            query.$or = [
                { claimant: req.user._id },
                { foundItemId: { $in: foundItemIds } }
            ];
        }
        const [claims, total] = await Promise.all([
            Claim_1.default.find(query)
                .populate('foundItemId', 'itemName category brand color images status locationFound finder')
                .populate('lostItemId', 'itemName category brand color status locationLost owner')
                .populate('claimant', 'name email profilePic studentId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Claim_1.default.countDocuments(query),
        ]);
        (0, response_1.sendSuccess)(res, {
            claims,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }, 'Claims retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getClaims = getClaims;
/**
 * Get details of a single claim by ID.
 */
const getClaimById = async (req, res, next) => {
    try {
        const claim = await Claim_1.default.findById(req.params.id)
            .populate('foundItemId')
            .populate('lostItemId')
            .populate('claimant', 'name email profilePic studentId phone');
        if (!claim) {
            (0, response_1.sendError)(res, 'Claim not found', 404);
            return;
        }
        // Authorization: User must be claimant, finder, or an admin
        const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
        const isFinder = claim.foundItemId && claim.foundItemId.finder && claim.foundItemId.finder.toString() === req.user._id.toString();
        if (!isClaimant && !isFinder && req.user.role !== 'admin') {
            (0, response_1.sendError)(res, 'Access denied', 403);
            return;
        }
        (0, response_1.sendSuccess)(res, { claim }, 'Claim retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getClaimById = getClaimById;
/**
 * Cancel a pending claim.
 */
const cancelClaim = async (req, res, next) => {
    try {
        const claim = await Claim_1.default.findById(req.params.id);
        if (!claim) {
            (0, response_1.sendError)(res, 'Claim not found', 404);
            return;
        }
        // Verify ownership
        if (claim.claimant.toString() !== req.user._id.toString()) {
            (0, response_1.sendError)(res, 'You are not authorized to cancel this claim', 403);
            return;
        }
        // Verify claim is pending
        if (claim.status !== 'pending') {
            (0, response_1.sendError)(res, `Cannot cancel a claim that is already ${claim.status}`, 400);
            return;
        }
        // Release the FoundItem back to active status
        await FoundItem_1.default.findByIdAndUpdate(claim.foundItemId, { status: 'active' });
        // Release linked LostItem back to active status
        if (claim.lostItemId) {
            await LostItem_1.default.findByIdAndUpdate(claim.lostItemId, { status: 'active' });
        }
        // Delete or update the claim to cancelled/rejected (we delete it to allow re-claiming)
        await Claim_1.default.findByIdAndDelete(req.params.id);
        (0, response_1.sendSuccess)(res, {}, 'Claim cancelled successfully. Item is available again.');
    }
    catch (error) {
        next(error);
    }
};
exports.cancelClaim = cancelClaim;
/**
 * Approve a claim (Admin only).
 */
const approveClaim = async (req, res, next) => {
    try {
        const claim = await Claim_1.default.findById(req.params.id)
            .populate('claimant')
            .populate('foundItemId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Claim not found', 404);
            return;
        }
        if (claim.status !== 'pending' && claim.status !== 'mediated') {
            (0, response_1.sendError)(res, `Claim is already ${claim.status}`, 400);
            return;
        }
        // Update claim status to resolved
        const handoverCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const remarks = req.body.remarks || 'Approved by admin - Check your chat for the handover code';
        claim.status = 'resolved';
        claim.mediationStatus = 'approved'; // clear pending mediation flag
        claim.qrToken = `ADMIN-CODE:${handoverCode}`;
        claim.remarks = remarks;
        await claim.save();
        // Re-verify FoundItem is marked resolved and set adminResolved
        await FoundItem_1.default.findByIdAndUpdate(claim.foundItemId._id, {
            status: 'resolved',
            adminResolved: true
        });
        // Notify connected users via socket
        try {
            const { getIO } = require('../services/socket.service');
            const io = getIO();
            io.to(`claim:${claim._id}`).emit('claim_resolved', {
                claimId: claim._id,
                status: 'resolved',
                code: handoverCode,
                remarks
            });
            // Broadcast to community board
            io.emit('item_resolved', {
                itemId: claim.foundItemId._id,
                adminResolved: true
            });
            io.emit('admin_claims_updated');
        }
        catch (e) {
            console.warn('Socket emit failed for claim_resolved:', e);
        }
        // Mark linked lost item as resolved so it updates appropriately, or fallback
        let targetLostItemId = claim.lostItemId;
        if (!targetLostItemId && claim.claimant) {
            const fallbackLostItem = await LostItem_1.default.findOne({ owner: claim.claimant._id, status: 'active' });
            if (fallbackLostItem)
                targetLostItemId = fallbackLostItem._id;
        }
        if (targetLostItemId) {
            await LostItem_1.default.findByIdAndUpdate(targetLostItemId, { status: 'resolved' });
            try {
                const { getIO } = require('../services/socket.service');
                const io = getIO();
                io.emit('lost_item_resolved', { itemId: targetLostItemId });
            }
            catch (e) {
                console.warn('Socket emit failed for lost_item_resolved:', e);
            }
        }
        // Handle communityHidden for the original linked lost item if it exists
        const foundItemData = await FoundItem_1.default.findById(claim.foundItemId);
        if (foundItemData && foundItemData.linkedLostItem) {
            const origLostItem = await LostItem_1.default.findById(foundItemData.linkedLostItem);
            if (origLostItem && origLostItem.status === 'active') {
                if (origLostItem.owner.toString() === claim.claimant._id.toString()) {
                    await LostItem_1.default.findByIdAndUpdate(foundItemData.linkedLostItem, { status: 'resolved' });
                }
                else {
                    await LostItem_1.default.findByIdAndUpdate(foundItemData.linkedLostItem, { communityHidden: true });
                }
            }
        }
        // Send email notification to claimant
        const claimant = claim.claimant;
        const foundItem = claim.foundItemId;
        await (0, email_service_1.sendClaimApprovedEmail)(claimant.email, claimant.name, foundItem.itemName);
        (0, response_1.sendSuccess)(res, { claim }, 'Claim approved successfully. Notification sent.');
    }
    catch (error) {
        next(error);
    }
};
exports.approveClaim = approveClaim;
/**
 * Reject a claim (Admin only).
 */
const rejectClaim = async (req, res, next) => {
    try {
        const claim = await Claim_1.default.findById(req.params.id)
            .populate('claimant')
            .populate('foundItemId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Claim not found', 404);
            return;
        }
        if (claim.status !== 'pending') {
            (0, response_1.sendError)(res, `Claim is already ${claim.status}`, 400);
            return;
        }
        const reason = req.body.reason || req.body.remarks || 'Insufficient proof of ownership';
        claim.status = 'rejected';
        claim.mediationStatus = 'rejected'; // clear pending mediation flag
        claim.reason = reason;
        claim.remarks = reason;
        await claim.save();
        // Release the FoundItem back to active
        await FoundItem_1.default.findByIdAndUpdate(claim.foundItemId._id, { status: 'active' });
        // Release linked LostItem back to active status
        if (claim.lostItemId) {
            await LostItem_1.default.findByIdAndUpdate(claim.lostItemId, { status: 'active' });
        }
        // Notify room via socket
        try {
            const { getIO } = require('../services/socket.service');
            const io = getIO();
            io.to(`claim:${claim._id}`).emit('claim_rejected', {
                claimId: claim._id,
                status: 'rejected',
                reason
            });
        }
        catch (e) {
            console.warn('Socket emit failed:', e);
        }
        // Send email notification to claimant
        const claimant = claim.claimant;
        const foundItem = claim.foundItemId;
        await (0, email_service_1.sendClaimRejectedEmail)(claimant.email, claimant.name, foundItem.itemName, reason);
        (0, response_1.sendSuccess)(res, { claim }, 'Claim rejected successfully. Item released.');
    }
    catch (error) {
        next(error);
    }
};
exports.rejectClaim = rejectClaim;
/**
 * Resolve a claim by confirming ownership (Finder only).
 */
const resolveClaim = async (req, res, next) => {
    try {
        const claim = await Claim_1.default.findById(req.params.id)
            .populate('claimant')
            .populate('foundItemId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Claim not found', 404);
            return;
        }
        const foundItem = claim.foundItemId;
        if (!foundItem) {
            (0, response_1.sendError)(res, 'Found item not associated with this claim', 400);
            return;
        }
        // Only the finder of the item can resolve and confirm ownership
        if (foundItem.finder.toString() !== req.user._id.toString()) {
            (0, response_1.sendError)(res, 'Only the finder of this item can confirm ownership and resolve the claim', 403);
            return;
        }
        // Generate secure QR token & upload QR code image to Cloudinary
        const qrToken = (0, uuid_1.v4)();
        const qrCodeUrl = await (0, qr_service_1.generateQR)(qrToken);
        // Calculate expiration time (default 24h, max 48h)
        let hours = Number(req.body.qrExpiresHours) || 24;
        if (hours > 48)
            hours = 48;
        if (hours < 1)
            hours = 1;
        const qrExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        claim.status = 'resolved';
        claim.qrToken = qrToken;
        claim.qrCodeUrl = qrCodeUrl;
        claim.qrExpiresAt = qrExpiresAt;
        claim.remarks = 'Ownership confirmed by Finder';
        await claim.save();
        await FoundItem_1.default.findByIdAndUpdate(foundItem._id, { status: 'claimed' });
        // Mark linked lost item as resolved so it updates appropriately, or fallback
        let targetLostItemId = claim.lostItemId;
        if (!targetLostItemId && claim.claimant) {
            const fallbackLostItem = await LostItem_1.default.findOne({ owner: claim.claimant._id, status: 'active' });
            if (fallbackLostItem)
                targetLostItemId = fallbackLostItem._id;
        }
        if (targetLostItemId) {
            await LostItem_1.default.findByIdAndUpdate(targetLostItemId, { status: 'resolved' });
            try {
                const { getIO } = require('../services/socket.service');
                const io = getIO();
                io.emit('lost_item_resolved', { itemId: targetLostItemId });
            }
            catch (e) {
                console.warn('Socket emit failed for lost_item_resolved:', e);
            }
        }
        // Handle communityHidden for the original linked lost item if it exists
        const foundItemData2 = await FoundItem_1.default.findById(claim.foundItemId);
        if (foundItemData2 && foundItemData2.linkedLostItem) {
            const origLostItem = await LostItem_1.default.findById(foundItemData2.linkedLostItem);
            if (origLostItem && origLostItem.status === 'active') {
                if (origLostItem.owner.toString() === claim.claimant._id.toString()) {
                    await LostItem_1.default.findByIdAndUpdate(foundItemData2.linkedLostItem, { status: 'resolved' });
                }
                else {
                    await LostItem_1.default.findByIdAndUpdate(foundItemData2.linkedLostItem, { communityHidden: true });
                }
            }
        }
        // Send real-time notification to the room via Socket.IO
        try {
            const { getIO } = require('../services/socket.service');
            const io = getIO();
            io.to(`claim:${claim._id}`).emit('claim_resolved', {
                claimId: claim._id,
                qrCodeUrl,
                qrExpiresAt
            });
        }
        catch (e) {
            console.warn('Socket emit failed (running without active listeners?):', e);
        }
        (0, response_1.sendSuccess)(res, { claim }, 'Claim resolved and ownership confirmed successfully.');
    }
    catch (error) {
        next(error);
    }
};
exports.resolveClaim = resolveClaim;
/**
 * Request admin mediation for a claim (Finder or Claimant).
 */
const mediateClaim = async (req, res, next) => {
    try {
        const claim = await Claim_1.default.findById(req.params.id).populate('foundItemId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Claim not found', 404);
            return;
        }
        const foundItem = claim.foundItemId;
        const isFinder = foundItem?.finder?.toString() === req.user._id.toString();
        const isClaimant = claim.claimant.toString() === req.user._id.toString();
        if (!isFinder && !isClaimant) {
            (0, response_1.sendError)(res, 'Only the finder or claimant can request admin mediation', 403);
            return;
        }
        claim.mediationRequested = true;
        claim.mediationStatus = 'pending';
        await claim.save();
        // Notify room via socket
        try {
            const { getIO } = require('../services/socket.service');
            const io = getIO();
            io.to(`claim:${claim._id}`).emit('mediation_status', {
                claimId: claim._id,
                mediationRequested: true,
                mediationStatus: 'pending'
            });
            // Also emit a global update for the admin dashboard
            io.emit('admin_claims_updated');
        }
        catch (e) {
            console.warn(e);
        }
        (0, response_1.sendSuccess)(res, { claim }, 'Mediation requested successfully.');
    }
    catch (error) {
        next(error);
    }
};
exports.mediateClaim = mediateClaim;
/**
 * Admin resolves mediation request.
 */
const mediationResolve = async (req, res, next) => {
    try {
        const { action } = req.body; // 'approve' or 'reject'
        if (action !== 'approve' && action !== 'reject') {
            (0, response_1.sendError)(res, 'Invalid mediation resolution action. Must be approve or reject', 400);
            return;
        }
        const claim = await Claim_1.default.findById(req.params.id).populate('foundItemId');
        if (!claim) {
            (0, response_1.sendError)(res, 'Claim not found', 404);
            return;
        }
        if (action === 'approve') {
            claim.status = 'resolved'; // Mark as resolved directly based on admin approval
            claim.mediationStatus = 'approved';
            // Generate a 6-digit alphanumeric code for the finder
            const handoverCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            claim.qrToken = `ADMIN-CODE:${handoverCode}`;
            claim.remarks = 'Ownership confirmed by Admin Mediation - No QR needed, check your chat window for the handover code.';
            await claim.save();
            await FoundItem_1.default.findByIdAndUpdate(claim.foundItemId._id, {
                status: 'resolved',
                adminResolved: true
            });
            // Notify connected users via socket
            try {
                const { getIO } = require('../services/socket.service');
                const io = getIO();
                io.to(`claim:${claim._id}`).emit('claim_resolved', {
                    claimId: claim._id,
                    status: 'resolved',
                    code: handoverCode,
                    remarks: claim.remarks
                });
                // Broadcast to community board
                io.emit('item_resolved', {
                    itemId: claim.foundItemId._id,
                    adminResolved: true
                });
                io.emit('admin_claims_updated');
            }
            catch (e) {
                console.warn('Socket emit failed for claim_resolved:', e);
            }
            // Mark linked lost item as resolved so it updates appropriately, or fallback
            let targetLostItemId = claim.lostItemId;
            if (!targetLostItemId && claim.claimant) {
                const fallbackLostItem = await LostItem_1.default.findOne({ owner: claim.claimant._id, status: 'active' });
                if (fallbackLostItem)
                    targetLostItemId = fallbackLostItem._id;
            }
            if (targetLostItemId) {
                await LostItem_1.default.findByIdAndUpdate(targetLostItemId, { status: 'resolved' });
                try {
                    const { getIO } = require('../services/socket.service');
                    const io = getIO();
                    io.emit('lost_item_resolved', { itemId: targetLostItemId });
                }
                catch (e) {
                    console.warn('Socket emit failed for lost_item_resolved:', e);
                }
            }
        }
        else {
            // Reject mediation request: Resume chat
            claim.mediationStatus = 'rejected';
            claim.mediationRequested = false;
            await claim.save();
            try {
                const { getIO } = require('../services/socket.service');
                const io = getIO();
                io.to(`claim:${claim._id}`).emit('mediation_status', {
                    claimId: claim._id,
                    mediationRequested: false,
                    mediationStatus: 'rejected'
                });
            }
            catch (e) {
                console.warn(e);
            }
        }
        (0, response_1.sendSuccess)(res, { claim }, `Mediation request successfully resolved with action: ${action}`);
    }
    catch (error) {
        next(error);
    }
};
exports.mediationResolve = mediationResolve;
