"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = __importDefault(require("../models/User"));
const response_1 = require("../utils/response");
const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            (0, response_1.sendError)(res, 'Not authorized, no token', 401);
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded || !decoded.userId) {
            (0, response_1.sendError)(res, 'Not authorized, invalid token', 401);
            return;
        }
        const user = await User_1.default.findById(decoded.userId).select('-password');
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 401);
            return;
        }
        if (user.status === 'banned') {
            (0, response_1.sendError)(res, 'Your account has been banned', 403);
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
