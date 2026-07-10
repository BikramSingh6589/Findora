"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareImages = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
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
        console.error(`[Image Matching] Failed to load image buffer from ${imagePath}:`, error);
        return null;
    }
};
/**
 * Compares two images and returns a score between 0 and 15.
 * Handles missing images cases to correctly adjust match confidence.
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
        // CASE 1: Both lost and found items have images
        console.log(`[Image Matching] Case 1: Analyzing and comparing visual buffers: "${lostImage}" vs "${foundImage}"`);
        const bufferLost = await getImageBuffer(lostImage);
        const bufferFound = await getImageBuffer(foundImage);
        if (!bufferLost || !bufferFound) {
            return { score: 2, reason: 'Failed to retrieve visual features for comparison' };
        }
        // Extract visual structure / layout using sharp metadata
        const lostMeta = await (0, sharp_1.default)(bufferLost).metadata();
        const foundMeta = await (0, sharp_1.default)(bufferFound).metadata();
        // Resize images to a tiny 8x8 space to extract and compare average visual / color features
        const lostRaw = await (0, sharp_1.default)(bufferLost).resize(8, 8, { fit: 'fill' }).raw().toBuffer();
        const foundRaw = await (0, sharp_1.default)(bufferFound).resize(8, 8, { fit: 'fill' }).raw().toBuffer();
        let totalDiff = 0;
        const length = Math.min(lostRaw.length, foundRaw.length);
        for (let i = 0; i < length; i++) {
            totalDiff += Math.abs(lostRaw[i] - foundRaw[i]);
        }
        const avgDiff = totalDiff / length; // color difference metric from 0 to 255
        const colorSimilarity = 1 - avgDiff / 255;
        // Aspect ratio similarity
        const lostRatio = (lostMeta.width || 1) / (lostMeta.height || 1);
        const foundRatio = (foundMeta.width || 1) / (foundMeta.height || 1);
        const ratioSimilarity = 1 - Math.min(Math.abs(lostRatio - foundRatio) / Math.max(lostRatio, foundRatio), 1);
        // Dynamic visual similarity formula
        const visualSimilarity = colorSimilarity * 0.7 + ratioSimilarity * 0.3;
        let score = 0;
        let reason = 'Low visual similarity';
        if (visualSimilarity > 0.85) {
            score = 13 + Math.round((visualSimilarity - 0.85) * 13.3); // 13-15 points
            reason = 'Strong visual similarity and matching color tones';
        }
        else if (visualSimilarity > 0.6) {
            score = 6 + Math.round((visualSimilarity - 0.6) * 24); // 6-12 points
            reason = 'Moderate visual similarity';
        }
        else {
            score = Math.round(visualSimilarity * 10); // 0-3 points
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
