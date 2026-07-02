"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.verifyForgotPasswordOtp = exports.forgotPassword = exports.getMe = exports.adminLogin = exports.verifyOtp = exports.login = exports.register = void 0;
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
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        const user = await User_1.default.create({
            name,
            email,
            studentId,
            phone,
            password,
            isVerified: false,
            otp,
            otpExpiry,
        });
        await (0, email_service_1.sendOtpEmail)(email, otp, 'signup');
        // Omit password and OTP details from response object
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.otpExpiry;
        (0, response_1.sendSuccess)(res, { user: userResponse }, 'Registration successful. Verification OTP sent to your email.', 201);
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
        if (!user.isVerified) {
            // Re-send verification code if they try to log in
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
            await user.save();
            await (0, email_service_1.sendOtpEmail)(email, otp, 'signup');
            (0, response_1.sendError)(res, 'Email not verified. A new verification OTP code has been sent to your email.', 401);
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
const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        if (user.isVerified) {
            (0, response_1.sendError)(res, 'Email already verified', 400);
            return;
        }
        if (!user.otp || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            (0, response_1.sendError)(res, 'Invalid or expired OTP', 400);
            return;
        }
        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        const token = (0, jwt_1.signToken)({ userId: user._id.toString(), role: user.role });
        const userResponse = user.toObject();
        delete userResponse.password;
        (0, response_1.sendSuccess)(res, { token, user: userResponse }, 'Email verified successfully. Login successful.');
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
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
            (0, response_1.sendSuccess)(res, {}, 'If that email exists, we have sent a password reset OTP.');
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration
        await user.save();
        await (0, email_service_1.sendOtpEmail)(email, otp, 'reset');
        (0, response_1.sendSuccess)(res, {}, 'Password reset OTP sent to your email.');
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const verifyForgotPasswordOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        if (!user.otp || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            (0, response_1.sendError)(res, 'Invalid or expired OTP', 400);
            return;
        }
        const resetToken = (0, uuid_1.v4)();
        user.resetToken = resetToken;
        user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiration
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        (0, response_1.sendSuccess)(res, { resetToken }, 'OTP verified. You can now reset your password.');
    }
    catch (error) {
        next(error);
    }
};
exports.verifyForgotPasswordOtp = verifyForgotPasswordOtp;
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
