"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
// Validation Schemas
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    studentId: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: zod_1.z.string().min(8, 'Password confirmation must be at least 8 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
});
const verifyOtpSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    otp: zod_1.z.string().length(6, 'OTP must be 6 digits'),
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: zod_1.z.string().min(8, 'Password must be at least 8 characters long'),
});
// Authentication routes
router.post('/register', (0, validate_middleware_1.validateRequest)(registerSchema), auth_controller_1.register);
router.post('/login', (0, validate_middleware_1.validateRequest)(loginSchema), auth_controller_1.login);
router.post('/verify-otp', (0, validate_middleware_1.validateRequest)(verifyOtpSchema), auth_controller_1.verifyOtp);
router.post('/admin/login', (0, validate_middleware_1.validateRequest)(loginSchema), auth_controller_1.adminLogin);
router.post('/forgot-password', (0, validate_middleware_1.validateRequest)(forgotPasswordSchema), auth_controller_1.forgotPassword);
router.post('/verify-reset-otp', (0, validate_middleware_1.validateRequest)(verifyOtpSchema), auth_controller_1.verifyForgotPasswordOtp);
router.post('/reset-password', (0, validate_middleware_1.validateRequest)(resetPasswordSchema), auth_controller_1.resetPassword);
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
router.post('/logout', auth_middleware_1.protect, auth_controller_1.logout);
exports.default = router;
