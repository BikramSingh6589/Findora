"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textSimilarity = void 0;
/**
 * Compares two texts to determine their similarity ratio based on Jaccard similarity.
 *
 * Formula: common words / max(words in text A, words in text B)
 */
const textSimilarity = (textA, textB) => {
    if (!textA || !textB)
        return 0;
    const cleanWords = (text) => {
        return text
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);
    };
    const wordsA = cleanWords(textA);
    const wordsB = cleanWords(textB);
    if (wordsA.length === 0 || wordsB.length === 0)
        return 0;
    const setA = new Set(wordsA);
    const setB = new Set(wordsB);
    const common = [...setA].filter(w => setB.has(w));
    return common.length / Math.max(setA.size, setB.size);
};
exports.textSimilarity = textSimilarity;
