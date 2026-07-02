import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import { signToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { sendOtpEmail, sendResetEmail } from '../services/email.service';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, studentId, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, 'Email already registered', 400);
      return;
    }

    if (studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        sendError(res, 'Student ID already registered', 400);
        return;
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      studentId,
      phone,
      password,
      isVerified: false,
      otp,
      otpExpiry,
    });

    await sendOtpEmail(email, otp, 'signup');

    // Omit password and OTP details from response object
    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).otp;
    delete (userResponse as any).otpExpiry;

    sendSuccess(res, { user: userResponse }, 'Registration successful. Verification OTP sent to your email.', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, 'Invalid email or password', 400);
      return;
    }

    if (user.status === 'banned') {
      sendError(res, 'Your account has been banned', 403);
      return;
    }

    if (!user.isVerified) {
      // Re-send verification code if they try to log in
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOtpEmail(email, otp, 'signup');

      sendError(res, 'Email not verified. A new verification OTP code has been sent to your email.', 401);
      return;
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 400);
      return;
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    sendSuccess(res, { token, user: userResponse }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    if (user.isVerified) {
      sendError(res, 'Email already verified', 400);
      return;
    }

    if (!user.otp || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      sendError(res, 'Invalid or expired OTP', 400);
      return;
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = signToken({ userId: user._id.toString(), role: user.role });
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    sendSuccess(res, { token, user: userResponse }, 'Email verified successfully. Login successful.');
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, 'Invalid email or password', 400);
      return;
    }

    if (user.role !== 'admin') {
      sendError(res, 'Access denied. Admin role required.', 403);
      return;
    }

    if (user.status === 'banned') {
      sendError(res, 'Your account has been banned', 403);
      return;
    }

    const isMatch = await (user as any).comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid email or password', 400);
      return;
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    sendSuccess(res, { token, user: userResponse }, 'Admin login successful');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, { user: req.user }, 'Profile fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return success response to avoid email enumeration attacks
      sendSuccess(res, {}, 'If that email exists, we have sent a password reset OTP.');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration
    await user.save();

    await sendOtpEmail(email, otp, 'reset');

    sendSuccess(res, {}, 'Password reset OTP sent to your email.');
  } catch (error) {
    next(error);
  }
};

export const verifyForgotPasswordOtp = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    if (!user.otp || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      sendError(res, 'Invalid or expired OTP', 400);
      return;
    }

    const resetToken = uuidv4();
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiration
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    sendSuccess(res, { resetToken }, 'OTP verified. You can now reset your password.');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      sendError(res, 'Invalid or expired reset token', 400);
      return;
    }

    user.password = newPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    sendSuccess(res, {}, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Stateless token logout is handled on client-side. We return success.
    sendSuccess(res, {}, 'Logout successful');
  } catch (error) {
    next(error);
  }
};
