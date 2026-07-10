"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIdentifiers = exports.extractTextFromImage = exports.preprocessImage = exports.preprocessImageBuffer = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const tesseract_js_1 = __importDefault(require("tesseract.js"));
// Download or read local file helper
const getImageBuffer = async (imagePath) => {
    try {
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            const response = await axios_1.default.get(imagePath, { responseType: 'arraybuffer' });
            return Buffer.from(response.data);
        }
        else if (fs_1.default.existsSync(imagePath)) {
            return await fs_1.default.promises.readFile(imagePath);
        }
        return null;
    }
    catch (error) {
        console.error(`[OCR Preprocessing] Failed to load image buffer from ${imagePath}:`, error);
        return null;
    }
};
/**
 * Preprocesses image buffer (resizing, grayscaling, contrast correction)
 * to improve Tesseract OCR recognition accuracy.
 */
const preprocessImageBuffer = async (imageBuffer) => {
    try {
        console.log('[OCR Preprocessing] Grayscaling, contrast boosting, normalising, and sharpening applied to visual source');
        const processed = await (0, sharp_1.default)(imageBuffer)
            .grayscale()
            .resize({ width: 1600, withoutEnlargement: true }) // optimized width for characters readability
            .normalize() // stretches luminance to max range (improves contrast)
            .sharpen({ sigma: 1.2, m1: 1.0, m2: 2.0 }) // sharpens text outlines
            .linear(1.3, -15) // multiplies pixels to drop gray background and highlight black text
            .toBuffer();
        return processed;
    }
    catch (error) {
        console.error('[OCR Preprocessing] Sharp transformation failed, using fallback:', error);
        return imageBuffer;
    }
};
exports.preprocessImageBuffer = preprocessImageBuffer;
/**
 * Simulates preprocess path for legacy import compatibility if needed, but returns the buffer instead.
 */
const preprocessImage = async (imagePathOrUrl) => {
    const raw = await getImageBuffer(imagePathOrUrl);
    if (!raw)
        return imagePathOrUrl;
    return (0, exports.preprocessImageBuffer)(raw);
};
exports.preprocessImage = preprocessImage;
/**
 * OCR service to extract text from images.
 */
const extractTextFromImage = async (imagePathOrUrl) => {
    if (!imagePathOrUrl) {
        return { extractedText: '' };
    }
    try {
        const rawBuffer = await getImageBuffer(imagePathOrUrl);
        if (!rawBuffer) {
            return { extractedText: '' };
        }
        const preprocessedBuffer = await (0, exports.preprocessImageBuffer)(rawBuffer);
        const { data: { text } } = await tesseract_js_1.default.recognize(preprocessedBuffer, 'eng');
        // Clean up extracted text: replace newlines with space, normalize spaces
        const cleanedText = text
            .replace(/[\r\n]+/g, ' ')
            .replace(/[^\w\s-]/g, ' ') // preserve dashes for serial numbers
            .replace(/\s+/g, ' ')
            .trim();
        return { extractedText: cleanedText };
    }
    catch (error) {
        console.error('OCR Service error:', error);
        return { extractedText: '' };
    }
};
exports.extractTextFromImage = extractTextFromImage;
/**
 * Safely extracts important identifiers (serial numbers, IMEI, model numbers, invoice/bill IDs).
 */
const extractIdentifiers = (text) => {
    if (!text)
        return [];
    const identifiers = [];
    const patterns = [
        // Serial numbers: SN12345, S/N: 12345, Serial: ABC123, Serial No: DL56789
        /(?:sn|s\/n|serial|serial\s+no|ser|serial\s+number)[:\s]*([a-z0-9-]+)/gi,
        // IMEI: IMEI 123456789012345 or IMEI: 123456789012345
        /(?:imei)[:\s]*([0-9]{15})/gi,
        // Model numbers: Model: XY-100, Model No: 123-A
        /(?:model|model\s+no|mod)[:\s]*([a-z0-9-]+)/gi,
        // Invoice IDs: Invoice No: INV-98765, Invoice ID: 123456
        /(?:invoice|inv|bill|receipt)[:\s]*([a-z0-9-]+)/gi
    ];
    for (const pattern of patterns) {
        let match;
        pattern.lastIndex = 0;
        while ((match = pattern.exec(text)) !== null) {
            if (match[1]) {
                const cleanedId = match[1].replace(/[^a-z0-9-]/gi, '').trim().toUpperCase();
                if (cleanedId && cleanedId.length > 2) {
                    identifiers.push(cleanedId);
                }
            }
        }
    }
    // Generic alphanumeric code finder (codes with mixed letters and numbers, length 5-15)
    // e.g. DL56789, SN12345, ABC123
    const codePattern = /\b([A-Z]+[0-9]+|[0-9]+[A-Z]+)[A-Z0-9-]*\b/gi;
    let match;
    while ((match = codePattern.exec(text)) !== null) {
        const cleaned = match[0].trim().toUpperCase();
        if (cleaned.length >= 5 && cleaned.length <= 15) {
            identifiers.push(cleaned);
        }
    }
    return [...new Set(identifiers)];
};
exports.extractIdentifiers = extractIdentifiers;
