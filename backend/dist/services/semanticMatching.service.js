"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareSemanticText = void 0;
const SYNONYMS = {
    'computer': ['laptop', 'notebook', 'macbook', 'computer', 'pc', 'netbook'],
    'power': ['charger', 'adapter', 'power', 'charging', 'power adapter', 'charger brick'],
    'cable': ['cable', 'wire', 'cord'],
    'mobile': ['phone', 'mobile', 'smartphone', 'iphone', 'android'],
    'audio': ['earphones', 'earbuds', 'headphones', 'airpods', 'headset'],
    'carrier': ['bag', 'backpack', 'bagpack', 'knapsack', 'purse', 'handbag', 'briefcase'],
    'key': ['key', 'keys', 'fob', 'keyfob'],
    'identity': ['id', 'card', 'badge', 'pass', 'license'],
    'bottle': ['bottle', 'flask', 'thermos', 'tumbler', 'hydroflask', 'canteen'],
    'clothing': ['jacket', 'hoodie', 'sweater', 'coat', 'shirt', 'cap', 'hat'],
    'wallet': ['wallet', 'pouch', 'billfold', 'cardholder'],
};
/**
 * Compares two text blocks semantically using concept groups.
 * Ready for future OpenAI vision embeddings or sentence-transformers.
 */
const compareSemanticText = (textA, textB) => {
    if (!textA || !textB) {
        return { score: 0, matchedConcepts: [] };
    }
    const cleanWords = (text) => {
        return text
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);
    };
    const wordsA = cleanWords(textA);
    const wordsB = cleanWords(textB);
    if (wordsA.length === 0 || wordsB.length === 0) {
        return { score: 0, matchedConcepts: [] };
    }
    // Get concept root group for a word
    const getConcept = (word) => {
        for (const [concept, synonyms] of Object.entries(SYNONYMS)) {
            if (synonyms.includes(word)) {
                return concept;
            }
        }
        return word; // fallback to exact word
    };
    const conceptsA = wordsA.map(getConcept);
    const conceptsB = wordsB.map(getConcept);
    const conceptSetA = new Set(conceptsA);
    const conceptSetB = new Set(conceptsB);
    const commonConcepts = [...conceptSetA].filter(c => conceptSetB.has(c));
    const maxConcepts = Math.max(conceptSetA.size, conceptSetB.size);
    const score = maxConcepts > 0 ? commonConcepts.length / maxConcepts : 0;
    // Generate matched fields / concepts like "notebook matched laptop"
    const matchedConcepts = [];
    for (const concept of commonConcepts) {
        const originalWordsA = wordsA.filter(w => getConcept(w) === concept);
        const originalWordsB = wordsB.filter(w => getConcept(w) === concept);
        let isSynonymMatch = false;
        for (const wa of originalWordsA) {
            for (const wb of originalWordsB) {
                if (wa !== wb) {
                    // Capitalize first letter
                    const formattedA = wa.charAt(0).toUpperCase() + wa.slice(1);
                    matchedConcepts.push(`${formattedA} matched ${wb}`);
                    isSynonymMatch = true;
                    break;
                }
            }
            if (isSynonymMatch)
                break;
        }
        // If it's a direct exact word match and not just a filler word, add it
        if (!isSynonymMatch && originalWordsA.length > 0) {
            const word = originalWordsA[0];
            const fillerWords = ['with', 'and', 'the', 'for', 'this', 'that', 'from', 'near', 'have'];
            if (!fillerWords.includes(word) && word.length > 2) {
                const formattedWord = word.charAt(0).toUpperCase() + word.slice(1);
                matchedConcepts.push(`Same ${formattedWord}`);
            }
        }
    }
    return {
        score,
        matchedConcepts
    };
};
exports.compareSemanticText = compareSemanticText;
