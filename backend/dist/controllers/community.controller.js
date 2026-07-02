"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestOwner = exports.flagPost = exports.getPosts = exports.createPost = void 0;
const CommunityPost_1 = __importDefault(require("../models/CommunityPost"));
const response_1 = require("../utils/response");
const reputation_service_1 = require("../services/reputation.service");
const createPost = async (req, res, next) => {
    try {
        const { content, type, itemId } = req.body;
        // Auto-expiry in 24 hours
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const post = await CommunityPost_1.default.create({
            author: req.user._id,
            content,
            type: type || 'found',
            itemId: itemId || undefined,
            expiresAt,
            status: 'active',
        });
        // Award 5 XP for community contribution
        await (0, reputation_service_1.addXP)(req.user._id, 5);
        // Populate author before returning
        const populatedPost = await post.populate('author', 'name profilePic');
        (0, response_1.sendSuccess)(res, { post: populatedPost }, 'Community post created successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createPost = createPost;
const getPosts = async (req, res, next) => {
    try {
        // Only return posts that are active or approved, and not expired
        const posts = await CommunityPost_1.default.find({
            status: { $in: ['active', 'approved'] },
            expiresAt: { $gt: new Date() },
        })
            .populate('author', 'name profilePic')
            .populate('itemId', 'itemName locationFound dateFound images status')
            .sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, { posts }, 'Community posts retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getPosts = getPosts;
const flagPost = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const post = await CommunityPost_1.default.findByIdAndUpdate(req.params.id, {
            status: 'flagged',
            flagReason: reason || 'Flagged by community',
        }, { new: true });
        if (!post) {
            (0, response_1.sendError)(res, 'Post not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { post }, 'Post flagged for moderation');
    }
    catch (error) {
        next(error);
    }
};
exports.flagPost = flagPost;
const suggestOwner = async (req, res, next) => {
    try {
        const { suggestedUserId, note } = req.body;
        // In a full implementation, this triggers a notification. For now, we return success.
        (0, response_1.sendSuccess)(res, {}, 'Ownership suggestion submitted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.suggestOwner = suggestOwner;
