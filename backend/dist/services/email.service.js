"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendClaimRejectedEmail = exports.sendClaimApprovedEmail = exports.sendResetEmail = exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOtpEmail = async (to, otp, purpose) => {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const user = process.env.EMAIL_USER || 'placeholder@gmail.com';
    const pass = process.env.EMAIL_PASS || 'placeholder_pass';
    console.log(`Email Service: Preparing to send OTP (${otp}) for ${purpose} to ${to}`);
    const transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
    const mailOptions = {
        from: `"Campus Lost & Found" <${user}>`,
        to,
        subject: purpose === 'signup' ? 'Verify Your Email Address' : 'Password Reset OTP Code',
        text: purpose === 'signup'
            ? `Welcome to Campus Lost & Found! Your verification code is: ${otp}. It is valid for 10 minutes.`
            : `Your password reset code is: ${otp}. It is valid for 10 minutes.`,
        html: purpose === 'signup'
            ? `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
          <h2 style="color: #4F46E5;">Welcome to Campus Lost & Found!</h2>
          <p>Please use the following 6-digit One-Time Password (OTP) to verify your email address:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #F3F4F6; padding: 10px 20px; display: inline-block; letter-spacing: 4px; border-radius: 5px; color: #1F2937;">${otp}</div>
          <p style="margin-top: 20px; font-size: 14px; color: #6B7280;">This code is valid for 10 minutes. If you did not sign up for an account, please ignore this email.</p>
        </div>`
            : `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Please use the following 6-digit One-Time Password (OTP) to reset your password:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #F3F4F6; padding: 10px 20px; display: inline-block; letter-spacing: 4px; border-radius: 5px; color: #1F2937;">${otp}</div>
          <p style="margin-top: 20px; font-size: 14px; color: #6B7280;">This code is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email Service: OTP email successfully sent to ${to}`);
    }
    catch (error) {
        console.error('Email Service Error sending OTP mail:', error);
    }
};
exports.sendOtpEmail = sendOtpEmail;
const sendResetEmail = async (to, token) => {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const user = process.env.EMAIL_USER || 'placeholder@gmail.com';
    const pass = process.env.EMAIL_PASS || 'placeholder_pass';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Using a stub/mock setup if credentials are defaults
    console.log(`Email Service: Preparing to send reset email to ${to}`);
    console.log(`Email Service: Reset Link is ${frontendUrl}/reset-password?token=${token}`);
    const transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
    const mailOptions = {
        from: `"Campus Lost & Found" <${user}>`,
        to,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please click on the link to reset your password: ${frontendUrl}/reset-password?token=${token}\nThis token is valid for 1 hour.`,
        html: `<p>You requested a password reset.</p><p>Please click <a href="${frontendUrl}/reset-password?token=${token}">here</a> to reset your password.</p><p>This link is valid for 1 hour.</p>`,
    };
    // Do not crash the app if mailing configuration isn't verified or fails.
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email Service: Password reset email successfully sent to ${to}`);
    }
    catch (error) {
        console.error('Email Service Error sending mail:', error);
    }
};
exports.sendResetEmail = sendResetEmail;
/**
 * Sends an email to the claimant when their claim has been approved.
 */
const sendClaimApprovedEmail = async (to, claimantName, itemName) => {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const user = process.env.EMAIL_USER || 'placeholder@gmail.com';
    const pass = process.env.EMAIL_PASS || 'placeholder_pass';
    console.log(`Email Service: Preparing to send claim approved email to ${to} for item: ${itemName}`);
    const transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
    const mailOptions = {
        from: `"Campus Lost & Found" <${user}>`,
        to,
        subject: 'Your Claim Has Been Approved! 🎉',
        text: `Hi ${claimantName},\n\nGreat news! Your claim for "${itemName}" has been approved by the Admin. Please come to the Lost and Found desk to collect your product.\n\nHappy finding!\nThe Campus Lost & Found Team`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
      <h2 style="color: #4F46E5;">Great news, ${claimantName}! 🎉</h2>
      <p>Your claim for the item <strong>"${itemName}"</strong> has been approved by the Admin.</p>
      <p>Please come to the Lost & Found desk to collect your product.</p>
      <p style="margin-top: 20px; font-size: 14px; color: #6B7280;">See you soon!<br/>The Campus Lost & Found Team</p>
    </div>`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email Service: Claim approved email successfully sent to ${to}`);
    }
    catch (error) {
        console.error('Email Service Error sending claim approved email:', error);
    }
};
exports.sendClaimApprovedEmail = sendClaimApprovedEmail;
/**
 * Sends an email to the claimant when their claim has been rejected.
 */
const sendClaimRejectedEmail = async (to, claimantName, itemName, reason) => {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const user = process.env.EMAIL_USER || 'placeholder@gmail.com';
    const pass = process.env.EMAIL_PASS || 'placeholder_pass';
    console.log(`Email Service: Preparing to send claim rejected email to ${to} for item: ${itemName}`);
    const transporter = nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    });
    const mailOptions = {
        from: `"Campus Lost & Found" <${user}>`,
        to,
        subject: 'Claim Update: More information needed ⚠️',
        text: `Hi ${claimantName},\n\nWe reviewed your claim for "${itemName}" but could not verify ownership.\n\nReason: ${reason || 'No specific reason provided.'}\n\nPlease try again or contact the administrator for assistance.\n\nBest regards,\nThe Campus Lost & Found Team`,
        html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
      <h2 style="color: #EF4444;">Claim Update: More information needed ⚠️</h2>
      <p>Hi ${claimantName},</p>
      <p>We reviewed your claim for the item <strong>"${itemName}"</strong> but could not verify ownership at this time.</p>
      <p><strong>Reason provided:</strong> ${reason || 'No specific reason provided.'}</p>
      <p>You can submit a new claim with additional proof or contact the administrator for support.</p>
      <p style="margin-top: 20px; font-size: 14px; color: #6B7280;">Best regards,<br/>The Campus Lost & Found Team</p>
    </div>`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email Service: Claim rejected email successfully sent to ${to}`);
    }
    catch (error) {
        console.error('Email Service Error sending claim rejected email:', error);
    }
};
exports.sendClaimRejectedEmail = sendClaimRejectedEmail;
