"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerManualMatching = exports.updateMatchStatus = exports.getMatchDetails = exports.getItemMatches = exports.getMatches = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AIMatch_1 = __importDefault(require("../models/AIMatch"));
const LostItem_1 = __importDefault(require("../models/LostItem"));
const FoundItem_1 = __importDefault(require("../models/FoundItem"));
const ai_service_1 = require("../services/ai.service");
const response_1 = require("../utils/response");
const getMatches = async (req, res, next) => {
    try {
        const lostItems = await LostItem_1.default.find({ owner: req.user._id });
        const foundItems = await FoundItem_1.default.find({ finder: req.user._id });
        const lostIds = lostItems.map(i => i._id);
        const foundIds = foundItems.map(i => i._id);
        const matches = await AIMatch_1.default.find({
            $or: [
                { lostItem: { $in: lostIds } },
                { foundItem: { $in: foundIds } }
            ]
        }).populate('lostItem').populate('foundItem');
        // Filter out matches where populated items are null (deleted)
        const activeMatches = matches.filter(m => m.lostItem && m.foundItem);
        (0, response_1.sendSuccess)(res, { matches: activeMatches }, 'AI matches retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getMatches = getMatches;
const getItemMatches = async (req, res, next) => {
    try {
        const itemId = req.params.itemId;
        if (!mongoose_1.default.Types.ObjectId.isValid(itemId)) {
            (0, response_1.sendError)(res, 'Invalid item ID format', 400);
            return;
        }
        // Security Check: Verify item ownership/finder status or admin role
        const lostItem = await LostItem_1.default.findById(itemId);
        const foundItem = await FoundItem_1.default.findById(itemId);
        if (!lostItem && !foundItem) {
            (0, response_1.sendError)(res, 'Item not found', 404);
            return;
        }
        const isOwner = lostItem && String(lostItem.owner) === String(req.user._id);
        const isFinder = foundItem && String(foundItem.finder) === String(req.user._id);
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isFinder && !isAdmin) {
            (0, response_1.sendError)(res, 'Access denied. You do not own this item.', 403);
            return;
        }
        const matches = await AIMatch_1.default.find({
            $or: [
                { lostItem: itemId },
                { foundItem: itemId }
            ]
        }).populate('lostItem').populate('foundItem');
        // Filter out matches where populated items are null (deleted)
        const activeMatches = matches.filter(m => m.lostItem && m.foundItem);
        (0, response_1.sendSuccess)(res, { matches: activeMatches }, 'Item matches retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getItemMatches = getItemMatches;
const getMatchDetails = async (req, res, next) => {
    try {
        const matchId = req.params.matchId;
        if (!mongoose_1.default.Types.ObjectId.isValid(matchId)) {
            (0, response_1.sendError)(res, 'Invalid match ID format', 400);
            return;
        }
        const match = await AIMatch_1.default.findById(matchId).populate('lostItem').populate('foundItem');
        if (!match) {
            (0, response_1.sendError)(res, 'Match not found', 404);
            return;
        }
        // Security Check: Verify that the user is the owner of the lost item, finder of the found item, or admin
        const lostItem = match.lostItem;
        const foundItem = match.foundItem;
        if (!lostItem || !foundItem) {
            (0, response_1.sendError)(res, 'Match associated items are no longer available', 404);
            return;
        }
        const isOwner = String(lostItem.owner) === String(req.user._id);
        const isFinder = String(foundItem.finder) === String(req.user._id);
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isFinder && !isAdmin) {
            (0, response_1.sendError)(res, 'Access denied. You do not own the items associated with this match.', 403);
            return;
        }
        (0, response_1.sendSuccess)(res, { match }, 'Match details retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getMatchDetails = getMatchDetails;
const updateMatchStatus = async (req, res, next) => {
    try {
        const matchId = req.params.matchId;
        const { status } = req.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(matchId)) {
            (0, response_1.sendError)(res, 'Invalid match ID format', 400);
            return;
        }
        if (!status || !['new', 'reviewed', 'dismissed'].includes(status)) {
            (0, response_1.sendError)(res, 'Invalid status. Must be new, reviewed, or dismissed.', 400);
            return;
        }
        const match = await AIMatch_1.default.findById(matchId).populate('lostItem').populate('foundItem');
        if (!match) {
            (0, response_1.sendError)(res, 'Match not found', 404);
            return;
        }
        // Security Check: Verify that the user is the owner of the lost item, finder of the found item, or admin
        const lostItem = match.lostItem;
        const foundItem = match.foundItem;
        if (!lostItem || !foundItem) {
            (0, response_1.sendError)(res, 'Match associated items are no longer available', 404);
            return;
        }
        const isOwner = String(lostItem.owner) === String(req.user._id);
        const isFinder = String(foundItem.finder) === String(req.user._id);
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isFinder && !isAdmin) {
            (0, response_1.sendError)(res, 'Access denied. You cannot modify this match status.', 403);
            return;
        }
        match.status = status;
        await match.save();
        (0, response_1.sendSuccess)(res, { match }, 'Match status updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateMatchStatus = updateMatchStatus;
const triggerManualMatching = async (req, res, next) => {
    try {
        const { itemId, itemType } = req.body;
        if (!itemId || !itemType || !['lost', 'found'].includes(itemType)) {
            (0, response_1.sendError)(res, 'Invalid itemId or itemType', 400);
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(itemId)) {
            (0, response_1.sendError)(res, 'Invalid item ID format', 400);
            return;
        }
        await (0, ai_service_1.processAIData)(itemId, itemType);
        const matchCount = await AIMatch_1.default.countDocuments({
            $or: [
                { lostItem: itemId },
                { foundItem: itemId }
            ],
            status: { $ne: 'dismissed' }
        });
        (0, response_1.sendSuccess)(res, { matchCount }, 'Matching workflow triggered successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.triggerManualMatching = triggerManualMatching;
