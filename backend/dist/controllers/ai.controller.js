"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerManualMatching = exports.getItemMatches = exports.getMatches = void 0;
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
        (0, response_1.sendSuccess)(res, { matches }, 'AI matches retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getMatches = getMatches;
const getItemMatches = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const matches = await AIMatch_1.default.find({
            $or: [
                { lostItem: itemId },
                { foundItem: itemId }
            ]
        }).populate('lostItem').populate('foundItem');
        (0, response_1.sendSuccess)(res, { matches }, 'Item matches retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getItemMatches = getItemMatches;
const triggerManualMatching = async (req, res, next) => {
    try {
        const { itemId, itemType } = req.body;
        if (!itemId || !itemType || !['lost', 'found'].includes(itemType)) {
            (0, response_1.sendError)(res, 'Invalid itemId or itemType', 400);
            return;
        }
        const matchCount = await (0, ai_service_1.triggerMatching)(itemId, itemType);
        (0, response_1.sendSuccess)(res, { matchCount }, 'Matching workflow triggered successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.triggerManualMatching = triggerManualMatching;
