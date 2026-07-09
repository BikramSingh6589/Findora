"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareImages = void 0;
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
            return { score: 0 };
        }
        // CASE 2: Only one item has an image
        if (!hasLostImg || !hasFoundImg) {
            console.log('[Image Matching] Case 2: Only one item has an image. Score: 4');
            return { score: 4 };
        }
        // CASE 1: Both lost and found items have images
        console.log(`[Image Matching] Case 1: Comparing images: "${lostImage}" vs "${foundImage}"`);
        // In future: hook up CLIP embeddings/Vision API.
        // For now, evaluate similarity deterministically based on image URL matching.
        if (lostImage === foundImage) {
            return { score: 15 }; // Same laptop / exact same image
        }
        // Check if both images have same file name extension or patterns indicating similarity
        const lostName = lostImage.split('/').pop() || '';
        const foundName = foundImage.split('/').pop() || '';
        if (lostName.length > 0 && lostName === foundName) {
            return { score: 14 };
        }
        // Heuristic: if URLs both contain category keywords indicating same type
        const computerKeywords = ['laptop', 'notebook', 'macbook', 'pc', 'computer'];
        const bagKeywords = ['bag', 'backpack'];
        const containsKeyword = (url, keywords) => keywords.some(k => url.toLowerCase().includes(k));
        if (containsKeyword(lostImage, computerKeywords) && containsKeyword(foundImage, computerKeywords)) {
            return { score: 13 }; // similar laptop image
        }
        if (containsKeyword(lostImage, bagKeywords) && containsKeyword(foundImage, bagKeywords)) {
            return { score: 13 }; // similar bag image
        }
        // Different objects
        return { score: 1.5 }; // Different objects image score (0-3 range)
    }
    catch (error) {
        console.error('[Image Matching] Error comparing images:', error);
        return { score: 1 };
    }
};
exports.compareImages = compareImages;
