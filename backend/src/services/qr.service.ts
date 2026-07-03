import QRCode from 'qrcode';
import { uploadImage } from './cloudinary.service';

/**
 * Generates a QR code image buffer, uploads it to Cloudinary, and returns the URL.
 * Falls back to local Base64 Data URL if Cloudinary upload fails.
 * @param data String data to be encoded in the QR code (typically the qrToken)
 * @returns Cloudinary secure URL or locally generated base64 Data URL
 */
export const generateQR = async (data: string): Promise<string> => {
  try {
    const buffer = await QRCode.toBuffer(data, { width: 400 });
    try {
      const url = await uploadImage(buffer, 'qr-codes');
      return url;
    } catch (uploadError) {
      console.warn('Cloudinary upload failed for QR, falling back to local base64 Data URL:', uploadError);
      // Fallback: Generate Base64 Data URL locally
      const base64Url = await QRCode.toDataURL(data, { width: 400 });
      return base64Url;
    }
  } catch (error) {
    console.error('QR Generation Service Error:', error);
    throw error;
  }
};
