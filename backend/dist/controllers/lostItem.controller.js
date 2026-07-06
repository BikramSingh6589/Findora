"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLostItem = exports.updateLostItem = exports.getLostItemById = exports.getLostItems = exports.createLostItem = void 0;
const LostItem_1 = __importDefault(require("../models/LostItem"));
const cloudinary_service_1 = require("../services/cloudinary.service");
const ai_service_1 = require("../services/ai.service");
const reputation_service_1 = require("../services/reputation.service");
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
const createLostItem = async (req, res, next) => {
    try {
        const files = (req.files || []);
        const imageUrls = await Promise.all(files.map(f => (0, cloudinary_service_1.uploadImage)(f.buffer)));
        const item = await LostItem_1.default.create({
            ...req.body,
            images: imageUrls,
            owner: req.user._id,
        });
        // Trigger AI matching asynchronously (do not await)
        (0, ai_service_1.triggerMatching)(item._id.toString(), 'lost').catch(console.error);
        // Award XP for reporting a lost item
        await (0, reputation_service_1.addXP)(req.user._id, 10);
        (0, response_1.sendSuccess)(res, { item }, 'Lost item reported successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createLostItem = createLostItem;
const getLostItems = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
        const { category, search, status } = req.query;
        const query = {};
        if (category)
            query.category = category;
        // Default to 'active' only — hide resolved/archived from community feed
        query.status = status || 'active';
        query.communityHidden = { $ne: true };
        if (search)
            query['$text'] = { $search: search };
        const [items, total] = await Promise.all([
            LostItem_1.default.find(query)
                .populate('owner', 'name profilePic')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            LostItem_1.default.countDocuments(query),
        ]);
        (0, response_1.sendSuccess)(res, {
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }, 'Lost items retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getLostItems = getLostItems;
const getLostItemById = async (req, res, next) => {
    try {
        const item = await LostItem_1.default.findById(req.params.id).populate('owner', 'name profilePic');
        if (!item) {
            (0, response_1.sendError)(res, 'Lost item not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { item }, 'Lost item retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getLostItemById = getLostItemById;
const updateLostItem = async (req, res, next) => {
    try {
        const item = await LostItem_1.default.findById(req.params.id);
        if (!item) {
            (0, response_1.sendError)(res, 'Lost item not found', 404);
            return;
        }
        // Verify ownership or admin permission
        if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            (0, response_1.sendError)(res, 'Access denied', 403);
            return;
        }
        const files = (req.files || []);
        let imageUrls = item.images;
        if (files.length > 0) {
            imageUrls = await Promise.all(files.map(f => (0, cloudinary_service_1.uploadImage)(f.buffer)));
        }
        const updated = await LostItem_1.default.findByIdAndUpdate(req.params.id, {
            ...req.body,
            images: imageUrls,
        }, { new: true, runValidators: true });
        (0, response_1.sendSuccess)(res, { item: updated }, 'Lost item updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateLostItem = updateLostItem;
const deleteLostItem = async (req, res, next) => {
    try {
        const item = await LostItem_1.default.findById(req.params.id);
        if (!item) {
            (0, response_1.sendError)(res, 'Lost item not found', 404);
            return;
        }
        // Verify ownership or admin permission
        if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            (0, response_1.sendError)(res, 'Access denied', 403);
            return;
        }
        await LostItem_1.default.findByIdAndDelete(req.params.id);
        (0, response_1.sendSuccess)(res, {}, 'Lost item deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteLostItem = deleteLostItem;
