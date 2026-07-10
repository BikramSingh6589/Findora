"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareImages = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
// Helper to convert RGB to HSL for lighting-robust color comparison
const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h * 360, s, l];
};
// Download or read local file helper
const getImageBuffer = async (imagePath) => {
    try {
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            const response = await axios_1.default.get(imagePath, { responseType: 'arraybuffer', timeout: 5000 });
            return Buffer.from(response.data);
        }
        else if (fs_1.default.existsSync(imagePath)) {
            return await fs_1.default.promises.readFile(imagePath);
        }
        return null;
    }
    catch (error) {
        console.error(`[Image Matching] Failed to load image buffer from ${imagePath}:`, error);
        return null;
    }
};
/**
 * Compares two images and returns a score between 0 and 15.
 * Uses average hash (aHash), difference hash (dHash), and lighting-resilient HSL palette comparison.
 */
const compareImages = async (lostImage, foundImage) => {
    try {
        const hasLostImg = !!lostImage && lostImage.trim().length > 0;
        const hasFoundImg = !!foundImage && foundImage.trim().length > 0;
        // CASE 3: Both items have no image
        if (!hasLostImg && !hasFoundImg) {
            console.log('[Image Matching] Case 3: Neither item has an image. Score: 0');
            return { score: 0, reason: 'Both images missing' };
        }
        // CASE 2: Only one item has an image
        if (!hasLostImg || !hasFoundImg) {
            console.log('[Image Matching] Case 2: Only one item has an image. Score: 4');
            return { score: 4, reason: 'One image missing' };
        }
        console.log(`[Image Matching] Case 1: Analyzing and comparing visual buffers: "${lostImage}" vs "${foundImage}"`);
        const bufferLost = await getImageBuffer(lostImage);
        const bufferFound = await getImageBuffer(foundImage);
        if (!bufferLost || !bufferFound) {
            return { score: 2, reason: 'Failed to retrieve visual features for comparison' };
        }
        // 1. Aspect Ratio similarity
        const lostMeta = await (0, sharp_1.default)(bufferLost).metadata();
        const foundMeta = await (0, sharp_1.default)(bufferFound).metadata();
        const lostRatio = (lostMeta.width || 1) / (lostMeta.height || 1);
        const foundRatio = (foundMeta.width || 1) / (foundMeta.height || 1);
        const ratioSimilarity = 1 - Math.min(Math.abs(lostRatio - foundRatio) / Math.max(lostRatio, foundRatio), 1);
        // 2. Compute aHash (8x8 grayscale, resize robust to scale/noise)
        const lostAHashRaw = await (0, sharp_1.default)(bufferLost).resize(8, 8, { fit: 'fill' }).grayscale().raw().toBuffer();
        const foundAHashRaw = await (0, sharp_1.default)(bufferFound).resize(8, 8, { fit: 'fill' }).grayscale().raw().toBuffer();
        const getAHashBits = (raw) => {
            let sum = 0;
            for (let i = 0; i < 64; i++)
                sum += raw[i];
            const avg = sum / 64;
            const bits = [];
            for (let i = 0; i < 64; i++)
                bits.push(raw[i] >= avg);
            return bits;
        };
        const bitsLostA = getAHashBits(lostAHashRaw);
        const bitsFoundA = getAHashBits(foundAHashRaw);
        let diffCountA = 0;
        for (let i = 0; i < 64; i++) {
            if (bitsLostA[i] !== bitsFoundA[i])
                diffCountA++;
        }
        const aHashSimilarity = 1 - diffCountA / 64;
        // 3. Compute dHash (9x8 grayscale, horizontal difference robust to lighting/brightness/contrast/scale)
        const lostDHashRaw = await (0, sharp_1.default)(bufferLost).resize(9, 8, { fit: 'fill' }).grayscale().raw().toBuffer();
        const foundDHashRaw = await (0, sharp_1.default)(bufferFound).resize(9, 8, { fit: 'fill' }).grayscale().raw().toBuffer();
        const getDHashBits = (raw) => {
            const bits = [];
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const idx = row * 9 + col;
                    bits.push(raw[idx] > raw[idx + 1]);
                }
            }
            return bits;
        };
        const bitsLostD = getDHashBits(lostDHashRaw);
        const bitsFoundD = getDHashBits(foundDHashRaw);
        let diffCountD = 0;
        for (let i = 0; i < 64; i++) {
            if (bitsLostD[i] !== bitsFoundD[i])
                diffCountD++;
        }
        const dHashSimilarity = 1 - diffCountD / 64;
        // 4. HSL dominant color palette and grid structure comparison (4x4 color grid)
        const lostColorRaw = await (0, sharp_1.default)(bufferLost).resize(4, 4, { fit: 'fill' }).raw().toBuffer();
        const foundColorRaw = await (0, sharp_1.default)(bufferFound).resize(4, 4, { fit: 'fill' }).raw().toBuffer();
        const extractHslVectors = (raw) => {
            const hslVectors = [];
            for (let i = 0; i < 16; i++) {
                hslVectors.push(rgbToHsl(raw[i * 3], raw[i * 3 + 1], raw[i * 3 + 2]));
            }
            return hslVectors;
        };
        const hslLost = extractHslVectors(lostColorRaw);
        const hslFound = extractHslVectors(foundColorRaw);
        // A. Structural Grid Color Similarity (center-weighted to focus on primary item over background)
        let weightedDiffSum = 0;
        let totalWeight = 0;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const idx = r * 4 + c;
                const isCenter = r >= 1 && r <= 2 && c >= 1 && c <= 2;
                const weight = isCenter ? 2.5 : 1.0;
                const [h1, s1, l1] = hslLost[idx];
                const [h2, s2, l2] = hslFound[idx];
                const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
                const satDiff = Math.abs(s1 - s2);
                const ligDiff = Math.abs(l1 - l2);
                // Saturation & Lightness weight colors more when saturation is high
                const colorWeight = (s1 + s2) / 2;
                const cellDiff = (hueDiff * 0.5 * colorWeight) + (satDiff * 0.25) + (ligDiff * 0.25);
                weightedDiffSum += cellDiff * weight;
                totalWeight += weight;
            }
        }
        const structuralColorSimilarity = 1 - (weightedDiffSum / totalWeight);
        // B. Palette Color Similarity (Position-invariant color check: sort vectors to compare matching palettes)
        const sortedLost = [...hslLost].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
        const sortedFound = [...hslFound].sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
        let paletteDiffSum = 0;
        for (let i = 0; i < 16; i++) {
            const [h1, s1, l1] = sortedLost[i];
            const [h2, s2, l2] = sortedFound[i];
            const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
            const satDiff = Math.abs(s1 - s2);
            const ligDiff = Math.abs(l1 - l2);
            const colorWeight = (s1 + s2) / 2;
            paletteDiffSum += (hueDiff * 0.5 * colorWeight) + (satDiff * 0.25) + (ligDiff * 0.25);
        }
        const paletteColorSimilarity = 1 - (paletteDiffSum / 16);
        const colorSimilarity = (structuralColorSimilarity * 0.4) + (paletteColorSimilarity * 0.6);
        // 5. Final Visual Similarity blending (dHash = 35%, aHash = 35%, HSL color = 20%, Ratio = 10%)
        const visualSimilarity = (dHashSimilarity * 0.35) + (aHashSimilarity * 0.35) + (colorSimilarity * 0.20) + (ratioSimilarity * 0.10);
        let score = 0;
        let reason = 'Low visual similarity';
        if (visualSimilarity > 0.82) {
            score = 13 + Math.round((visualSimilarity - 0.82) * 11.1); // 13-15 points
            reason = 'Strong visual similarity and matching color tones';
        }
        else if (visualSimilarity > 0.55) {
            score = 6 + Math.round((visualSimilarity - 0.55) * 22.2); // 6-12 points
            reason = 'Moderate visual similarity';
        }
        else {
            score = Math.round(visualSimilarity * 10); // 0-5 points
            reason = 'Different visual structure and colors';
        }
        score = Math.min(Math.max(score, 0), 15);
        return { score, reason };
    }
    catch (error) {
        console.error('[Image Matching] Error in visual feature analysis pipeline:', error);
        return { score: 1.5, reason: 'Error during visual features extraction' };
    }
};
exports.compareImages = compareImages;
