"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.getMe = exports.adminLogin = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const email_service_1 = require("../services/email.service");
const uuid_1 = require("uuid");
const register = async (req, res, next) => {
    try {
        const { name, email, studentId, phone, password } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            (0, response_1.sendError)(res, 'Email already registered', 400);
            return;
        }
        if (studentId) {
            const existingStudent = await User_1.default.findOne({ studentId });
            if (existingStudent) {
                (0, response_1.sendError)(res, 'Student ID already registered', 400);
                return;
            }
        }
        const user = await User_1.default.create({
            name,
            email,
            studentId,
            phone,
            password,
        });
        const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
        // Omit password from user response object
        const userResponse = user.toObject();
        delete userResponse.password;
        (0, response_1.sendSuccess)(res, { token, user: userResponse }, 'Registration successful', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            (0, response_1.sendError)(res, 'Invalid email or password', 400);
            return;
        }
        if (user.status === 'banned') {
            (0, response_1.sendError)(res, 'Your account has been banned', 403);
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            (0, response_1.sendError)(res, 'Invalid email or password', 400);
            return;
        }
        const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
        const userResponse = user.toObject();
        delete userResponse.password;
        (0, response_1.sendSuccess)(res, { token, user: userResponse }, 'Login successful');
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            (0, response_1.sendError)(res, 'Invalid email or password', 400);
            return;
        }
        if (user.role !== 'admin') {
            (0, response_1.sendError)(res, 'Access denied. Admin role required.', 403);
            return;
        }
        if (user.status === 'banned') {
            (0, response_1.sendError)(res, 'Your account has been banned', 403);
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            (0, response_1.sendError)(res, 'Invalid email or password', 400);
            return;
        }
        const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
        const userResponse = user.toObject();
        delete userResponse.password;
        (0, response_1.sendSuccess)(res, { token, user: userResponse }, 'Admin login successful');
    }
    catch (error) {
        next(error);
    }
};
exports.adminLogin = adminLogin;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { user: req.user }, 'Profile fetched successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            // Return success response to avoid email enumeration attacks
            (0, response_1.sendSuccess)(res, {}, 'If that email exists, we have sent a password reset instructions.');
            return;
        }
        const token = (0, uuid_1.v4)();
        user.resetToken = token;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiration
        await user.save();
        await (0, email_service_1.sendResetEmail)(email, token);
        (0, response_1.sendSuccess)(res, {}, 'Password reset email sent');
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User_1.default.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: new Date() },
        });
        if (!user) {
            (0, response_1.sendError)(res, 'Invalid or expired reset token', 400);
            return;
        }
        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        (0, response_1.sendSuccess)(res, {}, 'Password reset successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const logout = async (req, res, next) => {
    try {
        // Stateless token logout is handled on client-side. We return success.
        (0, response_1.sendSuccess)(res, {}, 'Logout successful');
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
