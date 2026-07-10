"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIdentifiers = exports.extractTextFromImage = exports.isLikelyTextImage = exports.preprocessImage = exports.preprocessImageBuffer = void 0;
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
 * Detects if an image is likely to contain text (e.g. receipt, bill, invoice, label, ID card)
 * to skip OCR processing for normal photos and save resources.
 */
const isLikelyTextImage = async (buffer, itemContext) => {
    // 1. Context check: if keywords exist in description/name
    if (itemContext) {
        const textKeywords = [
            'receipt', 'bill', 'invoice', 'warranty', 'label', 'card', 'id', 'serial',
            'code', 'document', 'ticket', 'license', 'paper', 'certificate', 'sn', 's/n',
            'imei', 'number', 'slip', 'statement', 'passbook'
        ];
        const cleanContext = itemContext.toLowerCase();
        if (textKeywords.some(kw => cleanContext.includes(kw))) {
            console.log(`[OCR Optimization] Context match found for text keywords in: "${itemContext}". Prioritizing OCR.`);
            return true;
        }
    }
    try {
        // 2. Visual analysis: check for high edge gradients (text characters create high frequency transitions)
        const { data, info } = await (0, sharp_1.default)(buffer)
            .grayscale()
            .resize(64, 64, { fit: 'fill' })
            .raw()
            .toBuffer({ resolveWithObject: true });
        let edgeEnergy = 0;
        const width = info.width;
        const height = info.height;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                const current = data[idx];
                // Horizontal gradient difference
                if (x < width - 1) {
                    edgeEnergy += Math.abs(current - data[idx + 1]);
                }
                // Vertical gradient difference
                if (y < height - 1) {
                    edgeEnergy += Math.abs(current - data[idx + width]);
                }
            }
        }
        const normEdgeEnergy = edgeEnergy / (width * height);
        // 3. Document-like color saturation check: documents are typically grayscale/white/beige (low saturation)
        const rgbData = await (0, sharp_1.default)(buffer)
            .resize(16, 16, { fit: 'fill' })
            .raw()
            .toBuffer();
        let totalSaturation = 0;
        for (let i = 0; i < rgbData.length; i += 3) {
            const r = rgbData[i];
            const g = rgbData[i + 1];
            const b = rgbData[i + 2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            totalSaturation += saturation;
        }
        const avgSaturation = totalSaturation / (rgbData.length / 3);
        console.log(`[OCR Optimization] Image visual metrics - Edge Energy: ${normEdgeEnergy.toFixed(2)}, Avg Saturation: ${avgSaturation.toFixed(2)}`);
        // High edge energy means high contrast detail (likely text outlines)
        if (normEdgeEnergy > 28) {
            console.log('[OCR Optimization] High edge energy detected. Running OCR.');
            return true;
        }
        // Moderate edge energy + low saturation (like black text on white paper receipts/invoices)
        if (normEdgeEnergy > 15 && avgSaturation < 0.18) {
            console.log('[OCR Optimization] High contrast, low saturation (monochrome paper/receipt characteristics). Running OCR.');
            return true;
        }
        console.log('[OCR Optimization] Image is unlikely to contain text. Skipping OCR.');
        return false;
    }
    catch (err) {
        console.error('[OCR Optimization] Visual feature extraction failed. Defaulting to running OCR:', err);
        return true; // Fallback to safe OCR processing
    }
};
exports.isLikelyTextImage = isLikelyTextImage;
/**
 * OCR service to extract text from images.
 */
const extractTextFromImage = async (imagePathOrUrl, itemContext) => {
    if (!imagePathOrUrl) {
        return { extractedText: '' };
    }
    try {
        const rawBuffer = await getImageBuffer(imagePathOrUrl);
        if (!rawBuffer) {
            return { extractedText: '' };
        }
        // Run likely text image check before processing
        const textCheck = await (0, exports.isLikelyTextImage)(rawBuffer, itemContext);
        if (!textCheck) {
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
 * Safely extracts important identifiers (serial numbers, IMEI, model numbers, invoice/bill IDs, roll numbers, ID numbers).
 */
const extractIdentifiers = (text) => {
    if (!text)
        return [];
    const identifiers = [];
    const patterns = [
        // Serial numbers: SN12345, S/N: 12345, Serial: ABC123, Serial No: DL56789
        /(?:sn|s\/n|serial|serial\s+no|ser|serial\s+number)[:\s]*([a-z0-9-]+)/gi,
        // IMEI: IMEI 123456789012345 or IMEI: 12-345678-901234-5
        /(?:imei)[:\s]*([0-9\s-]{15,20})/gi,
        // Model numbers: Model: XY-100, Model No: 123-A, SKU: 123
        /(?:model|model\s+no|mod|sku)[:\s]*([a-z0-9-]+)/gi,
        // Invoice / Bill / Receipt: Invoice No: INV-98765, Invoice ID: 123456
        /(?:invoice|inv|bill|receipt|receipt\s+no|transaction)[:\s]*([a-z0-9-]+)/gi,
        // Roll numbers: Roll No: 23CSE012, Roll: 12345
        /(?:roll|roll\s+no|roll\s+number)[:\s]*([a-z0-9-]+)/gi,
        // ID numbers: Student ID: 2021-1234, ID Card: 56789
        /(?:student\s+id|id\s+no|id\s+number|identity\s+no|card\s+no)[:\s]*([a-z0-9-]+)/gi
    ];
    for (const pattern of patterns) {
        let match;
        pattern.lastIndex = 0;
        while ((match = pattern.exec(text)) !== null) {
            if (match[1]) {
                let cleanedId = match[1].replace(/[^a-z0-9-]/gi, '').trim().toUpperCase();
                // Special case for IMEI (extract exactly 15 digits)
                if (pattern.toString().includes('imei')) {
                    const digitsOnly = match[1].replace(/[^0-9]/g, '');
                    if (digitsOnly.length === 15) {
                        cleanedId = digitsOnly;
                    }
                }
                if (cleanedId && cleanedId.length >= 3) {
                    identifiers.push(cleanedId);
                }
            }
        }
    }
    // Generic alphanumeric code finder (codes with mixed letters and numbers, length 5-15)
    // e.g. DL56789, SN12345, ABC123, 23CSE012
    const codePattern = /\b([a-z]+[0-9]+|[0-9]+[a-z]+)[a-z0-9-]*\b/gi;
    let match;
    while ((match = codePattern.exec(text)) !== null) {
        const cleaned = match[0].replace(/[^a-z0-9-]/gi, '').trim().toUpperCase();
        if (cleaned.length >= 5 && cleaned.length <= 15) {
            identifiers.push(cleaned);
        }
    }
    // Also support 15 digit clean numbers directly (unlabeled IMEI)
    const imeiPattern = /\b([0-9]{15})\b/g;
    while ((match = imeiPattern.exec(text)) !== null) {
        identifiers.push(match[1]);
    }
    return [...new Set(identifiers)];
};
exports.extractIdentifiers = extractIdentifiers;
