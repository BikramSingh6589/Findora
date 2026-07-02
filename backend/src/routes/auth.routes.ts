import { Router } from 'express';
import { z } from 'zod';
import {
  register,
  login,
  adminLogin,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  verifyOtp,
  verifyForgotPasswordOtp
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// Validation Schemas
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Password confirmation must be at least 8 characters long'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
});

// Authentication routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/verify-otp', validateRequest(verifyOtpSchema), verifyOtp);
router.post('/admin/login', validateRequest(loginSchema), adminLogin);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/verify-reset-otp', validateRequest(verifyOtpSchema), verifyForgotPasswordOtp);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
