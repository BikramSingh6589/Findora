"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCommunityPost = exports.approveCommunityPost = exports.getCommunityPosts = exports.deleteItem = exports.rejectItem = exports.approveItem = exports.getItems = exports.updateUserRole = exports.updateUserStatus = exports.getUsers = exports.getDashboardStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const LostItem_1 = __importDefault(require("../models/LostItem"));
const FoundItem_1 = __importDefault(require("../models/FoundItem"));
const Claim_1 = __importDefault(require("../models/Claim"));
const CommunityPost_1 = __importDefault(require("../models/CommunityPost"));
const response_1 = require("../utils/response");
const getDashboardStats = async (req, res, next) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const [totalLost, totalFound, pendingClaims, resolvedToday, totalUsers] = await Promise.all([
            LostItem_1.default.countDocuments(),
            FoundItem_1.default.countDocuments(),
            Claim_1.default.countDocuments({ status: 'pending' }),
            Claim_1.default.countDocuments({ status: 'approved', updatedAt: { $gte: todayStart } }),
            User_1.default.countDocuments(),
        ]);
        (0, response_1.sendSuccess)(res, {
            totalLost,
            totalFound,
            pendingClaims,
            resolvedToday,
            totalUsers,
        }, 'Dashboard stats retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
const getUsers = async (req, res, next) => {
    try {
        const users = await User_1.default.find({}).select('-password').sort({ createdAt: -1 });
        // Calculate reports count for each user
        const usersWithDetails = await Promise.all(users.map(async (user) => {
            const [lostCount, foundCount] = await Promise.all([
                LostItem_1.default.countDocuments({ owner: user._id }),
                FoundItem_1.default.countDocuments({ finder: user._id }),
            ]);
            return {
                ...user.toObject(),
                reportsCount: lostCount + foundCount,
            };
        }));
        (0, response_1.sendSuccess)(res, { users: usersWithDetails }, 'Users retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['active', 'warned', 'suspended', 'banned'].includes(status)) {
            (0, response_1.sendError)(res, 'Invalid user status', 400);
            return;
        }
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { user }, 'User status updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatus = updateUserStatus;
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            (0, response_1.sendError)(res, 'Invalid user role', 400);
            return;
        }
        const user = await User_1.default.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { user }, 'User role updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
const getItems = async (req, res, next) => {
    try {
        const [lostItems, foundItems] = await Promise.all([
            LostItem_1.default.find({}).populate('owner', 'name email').sort({ createdAt: -1 }),
            FoundItem_1.default.find({}).populate('finder', 'name email').sort({ createdAt: -1 }),
        ]);
        const mappedLost = lostItems.map(item => ({
            id: item._id,
            name: item.itemName,
            type: 'lost',
            reporter: item.owner?.name || 'Unknown',
            location: item.locationLost,
            date: item.createdAt,
            status: item.status,
            img: item.images[0] || '',
        }));
        const mappedFound = foundItems.map(item => ({
            id: item._id,
            name: item.itemName,
            type: 'found',
            reporter: item.finder?.name || 'Unknown',
            location: item.locationFound,
            date: item.createdAt,
            status: item.status,
            img: item.images[0] || '',
        }));
        const allItems = [...mappedLost, ...mappedFound].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        (0, response_1.sendSuccess)(res, { items: allItems }, 'Items retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getItems = getItems;
const approveItem = async (req, res, next) => {
    try {
        const lostItem = await LostItem_1.default.findById(req.params.id);
        if (lostItem) {
            lostItem.status = 'active';
            await lostItem.save();
            (0, response_1.sendSuccess)(res, { item: lostItem }, 'Item approved successfully');
            return;
        }
        const foundItem = await FoundItem_1.default.findById(req.params.id);
        if (foundItem) {
            foundItem.status = 'active';
            await foundItem.save();
            (0, response_1.sendSuccess)(res, { item: foundItem }, 'Item approved successfully');
            return;
        }
        (0, response_1.sendError)(res, 'Item not found', 404);
    }
    catch (error) {
        next(error);
    }
};
exports.approveItem = approveItem;
const rejectItem = async (req, res, next) => {
    try {
        const lostItem = await LostItem_1.default.findById(req.params.id);
        if (lostItem) {
            lostItem.status = 'archived';
            await lostItem.save();
            (0, response_1.sendSuccess)(res, { item: lostItem }, 'Item rejected and archived successfully');
            return;
        }
        const foundItem = await FoundItem_1.default.findById(req.params.id);
        if (foundItem) {
            foundItem.status = 'archived';
            await foundItem.save();
            (0, response_1.sendSuccess)(res, { item: foundItem }, 'Item rejected and archived successfully');
            return;
        }
        (0, response_1.sendError)(res, 'Item not found', 404);
    }
    catch (error) {
        next(error);
    }
};
exports.rejectItem = rejectItem;
const deleteItem = async (req, res, next) => {
    try {
        const lostDeleted = await LostItem_1.default.findByIdAndDelete(req.params.id);
        if (lostDeleted) {
            (0, response_1.sendSuccess)(res, {}, 'Item deleted successfully');
            return;
        }
        const foundDeleted = await FoundItem_1.default.findByIdAndDelete(req.params.id);
        if (foundDeleted) {
            (0, response_1.sendSuccess)(res, {}, 'Item deleted successfully');
            return;
        }
        (0, response_1.sendError)(res, 'Item not found', 404);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteItem = deleteItem;
const getCommunityPosts = async (req, res, next) => {
    try {
        const posts = await CommunityPost_1.default.find({})
            .populate('author', 'name email profilePic')
            .sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, { posts }, 'Community posts retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getCommunityPosts = getCommunityPosts;
const approveCommunityPost = async (req, res, next) => {
    try {
        const post = await CommunityPost_1.default.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true }).populate('author', 'name email profilePic');
        if (!post) {
            (0, response_1.sendError)(res, 'Post not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { post }, 'Post approved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.approveCommunityPost = approveCommunityPost;
const deleteCommunityPost = async (req, res, next) => {
    try {
        const post = await CommunityPost_1.default.findByIdAndUpdate(req.params.id, { status: 'removed' }, { new: true }).populate('author', 'name email profilePic');
        if (!post) {
            (0, response_1.sendError)(res, 'Post not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { post }, 'Post removed successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCommunityPost = deleteCommunityPost;
