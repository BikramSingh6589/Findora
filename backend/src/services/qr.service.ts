import QRCode from 'qrcode';
import { uploadImage } from './cloudinary.service';

/**
 * Generates a QR code image buffer, uploads it to Cloudinary, and returns the URL.
 * @param data String data to be encoded in the QR code (typically the qrToken)
 * @returns Cloudinary secure URL of the uploaded QR code image
 */
export const generateQR = async (data: string): Promise<string> => {
  try {
    const buffer = await QRCode.toBuffer(data, { width: 400 });
    const url = await uploadImage(buffer, 'qr-codes');
    return url;
  } catch (error) {
    console.error('QR Generation Service Error:', error);
    throw error;
  }
};
