"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQR = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const cloudinary_service_1 = require("./cloudinary.service");
/**
 * Generates a QR code image buffer, uploads it to Cloudinary, and returns the URL.
 * @param data String data to be encoded in the QR code (typically the qrToken)
 * @returns Cloudinary secure URL of the uploaded QR code image
 */
const generateQR = async (data) => {
    try {
        const buffer = await qrcode_1.default.toBuffer(data, { width: 400 });
        const url = await (0, cloudinary_service_1.uploadImage)(buffer, 'qr-codes');
        return url;
    }
    catch (error) {
        console.error('QR Generation Service Error:', error);
        throw error;
    }
};
exports.generateQR = generateQR;
