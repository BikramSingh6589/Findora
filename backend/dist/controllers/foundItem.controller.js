"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFoundItem = exports.updateFoundItem = exports.getFoundItemById = exports.getFoundItems = exports.createFoundItem = void 0;
const FoundItem_1 = __importDefault(require("../models/FoundItem"));
const cloudinary_service_1 = require("../services/cloudinary.service");
const ai_service_1 = require("../services/ai.service");
const reputation_service_1 = require("../services/reputation.service");
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
const createFoundItem = async (req, res, next) => {
    try {
        const files = (req.files || []);
        const imageUrls = await Promise.all(files.map(f => (0, cloudinary_service_1.uploadImage)(f.buffer)));
        const item = await FoundItem_1.default.create({
            ...req.body,
            images: imageUrls,
            finder: req.user._id,
        });
        // Trigger AI matching asynchronously
        (0, ai_service_1.triggerMatching)(item._id.toString(), 'found').catch(console.error);
        // Award XP for reporting a found item
        await (0, reputation_service_1.addXP)(req.user._id, 15);
        (0, response_1.sendSuccess)(res, { item }, 'Found item reported successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createFoundItem = createFoundItem;
const getFoundItems = async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.getPagination)(req.query);
        const { category, search, status } = req.query;
        const query = {};
        if (category)
            query.category = category;
        if (status)
            query.status = status;
        if (search)
            query['$text'] = { $search: search };
        const [items, total] = await Promise.all([
            FoundItem_1.default.find(query)
                .populate('finder', 'name profilePic')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            FoundItem_1.default.countDocuments(query),
        ]);
        (0, response_1.sendSuccess)(res, {
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }, 'Found items retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getFoundItems = getFoundItems;
const getFoundItemById = async (req, res, next) => {
    try {
        const item = await FoundItem_1.default.findById(req.params.id).populate('finder', 'name profilePic');
        if (!item) {
            (0, response_1.sendError)(res, 'Found item not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { item }, 'Found item retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getFoundItemById = getFoundItemById;
const updateFoundItem = async (req, res, next) => {
    try {
        const item = await FoundItem_1.default.findById(req.params.id);
        if (!item) {
            (0, response_1.sendError)(res, 'Found item not found', 404);
            return;
        }
        // Verify finder ownership or admin permission
        if (item.finder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            (0, response_1.sendError)(res, 'Access denied', 403);
            return;
        }
        const files = (req.files || []);
        let imageUrls = item.images;
        if (files.length > 0) {
            imageUrls = await Promise.all(files.map(f => (0, cloudinary_service_1.uploadImage)(f.buffer)));
        }
        const updated = await FoundItem_1.default.findByIdAndUpdate(req.params.id, {
            ...req.body,
            images: imageUrls,
        }, { new: true, runValidators: true });
        (0, response_1.sendSuccess)(res, { item: updated }, 'Found item updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateFoundItem = updateFoundItem;
const deleteFoundItem = async (req, res, next) => {
    try {
        const item = await FoundItem_1.default.findById(req.params.id);
        if (!item) {
            (0, response_1.sendError)(res, 'Found item not found', 404);
            return;
        }
        // Verify finder ownership or admin permission
        if (item.finder.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            (0, response_1.sendError)(res, 'Access denied', 403);
            return;
        }
        await FoundItem_1.default.findByIdAndDelete(req.params.id);
        (0, response_1.sendSuccess)(res, {}, 'Found item deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteFoundItem = deleteFoundItem;
