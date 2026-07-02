"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReports = exports.getUserById = exports.getLeaderboard = exports.updateMe = exports.getMe = void 0;
const User_1 = __importDefault(require("../models/User"));
const LostItem_1 = __importDefault(require("../models/LostItem"));
const FoundItem_1 = __importDefault(require("../models/FoundItem"));
const response_1 = require("../utils/response");
const getMe = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { user }, 'User profile retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const updateMe = async (req, res, next) => {
    try {
        const { name, phone, profilePic } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.user._id, { name, phone, profilePic }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { user }, 'Profile updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateMe = updateMe;
const getLeaderboard = async (req, res, next) => {
    try {
        const users = await User_1.default.find()
            .sort({ xp: -1 })
            .limit(20)
            .select('name xp level badges itemsReturned itemsReported profilePic role');
        (0, response_1.sendSuccess)(res, { users }, 'Leaderboard retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getLeaderboard = getLeaderboard;
const getUserById = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { user }, 'User profile retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
const getUserReports = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const lostItems = await LostItem_1.default.find({ owner: userId }).sort({ createdAt: -1 });
        const foundItems = await FoundItem_1.default.find({ finder: userId }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, { lostItems, foundItems }, 'User reports retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getUserReports = getUserReports;
