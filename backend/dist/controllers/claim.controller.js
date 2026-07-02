"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectClaim = exports.approveClaim = exports.cancelClaim = exports.getClaimById = exports.getClaims = exports.submitClaim = void 0;
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
        const { foundItemId, lostItemId, answers, proofUrls: incomingProofUrls } = req.body;
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
        // Business Rule: Prevent duplicate pending claims for the same user & found item
        const existingClaim = await Claim_1.default.findOne({
            foundItemId,
            claimant: req.user._id,
            status: 'pending',
        });
        if (existingClaim) {
            (0, response_1.sendError)(res, 'You already have a pending claim for this item', 409);
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
        // Reserve the FoundItem
        await FoundItem_1.default.findByIdAndUpdate(foundItemId, { status: 'claimed' });
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
            query.claimant = req.user._id;
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
        // Authorization: User must be claimant or an admin
        if (claim.claimant._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
        if (claim.status !== 'pending') {
            (0, response_1.sendError)(res, `Claim is already ${claim.status}`, 400);
            return;
        }
        // Generate secure QR token & upload QR code image to Cloudinary
        const qrToken = (0, uuid_1.v4)();
        const qrCodeUrl = await (0, qr_service_1.generateQR)(qrToken);
        // Update claim status
        const remarks = req.body.remarks || 'Approved by admin';
        claim.status = 'approved';
        claim.qrToken = qrToken;
        claim.qrCodeUrl = qrCodeUrl;
        claim.remarks = remarks;
        await claim.save();
        // Re-verify FoundItem is marked claimed
        await FoundItem_1.default.findByIdAndUpdate(claim.foundItemId._id, { status: 'claimed' });
        // Send email notification to claimant
        const claimant = claim.claimant;
        const foundItem = claim.foundItemId;
        await (0, email_service_1.sendClaimApprovedEmail)(claimant.email, claimant.name, foundItem.itemName, qrCodeUrl);
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
        claim.reason = reason;
        claim.remarks = reason;
        await claim.save();
        // Release the FoundItem back to active
        await FoundItem_1.default.findByIdAndUpdate(claim.foundItemId._id, { status: 'active' });
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
