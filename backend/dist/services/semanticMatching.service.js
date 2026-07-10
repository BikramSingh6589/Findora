"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareSemanticText = exports.detectPrimaryObject = void 0;
const PRIMARY_OBJECTS = {
    'computer': ['laptop', 'notebook', 'computer', 'macbook'],
    'phone': ['phone', 'mobile', 'iphone', 'smartphone'],
    'bag': ['bag', 'backpack'],
    'bottle': ['bottle', 'flask'],
    'charger': ['charger', 'adapter', 'power supply', 'power supply adapter', 'charger brick', 'power brick'],
    'earphones': ['earbuds', 'earphones', 'headphones']
};
const STOP_WORDS = new Set([
    'lost', 'found', 'my', 'the', 'a', 'an', 'with', 'near',
    'inside', 'outside', 'item', 'thing'
]);
const BRANDS = new Set([
    'dell', 'apple', 'hp', 'samsung', 'lenovo', 'asus', 'sony', 'google',
    'acer', 'microsoft', 'lg', 'oneplus', 'xiaomi', 'huawei', 'toshiba'
]);
// Get primary object type from words
const detectPrimaryObject = (words) => {
    let primaryObj = null;
    let maxIndex = -1;
    for (const [objType, keywords] of Object.entries(PRIMARY_OBJECTS)) {
        for (const keyword of keywords) {
            const keywordWords = keyword.split(' ');
            if (keywordWords.length > 1) {
                // Multi-word search
                for (let i = 0; i <= words.length - keywordWords.length; i++) {
                    let match = true;
                    for (let j = 0; j < keywordWords.length; j++) {
                        if (words[i + j] !== keywordWords[j]) {
                            match = false;
                            break;
                        }
                    }
                    if (match && i > maxIndex) {
                        maxIndex = i;
                        primaryObj = objType;
                    }
                }
            }
            else {
                const lastIdx = words.lastIndexOf(keyword);
                if (lastIdx !== -1 && lastIdx > maxIndex) {
                    maxIndex = lastIdx;
                    primaryObj = objType;
                }
            }
        }
    }
    return primaryObj;
};
exports.detectPrimaryObject = detectPrimaryObject;
/**
 * Compares two text blocks semantically.
 * Clean stop words, detects main object, and computes brand/accessory/concept matches.
 */
const compareSemanticText = (textA, textB) => {
    if (!textA || !textB) {
        return { score: 0, matchedConcepts: [], primaryObjectA: null, primaryObjectB: null };
    }
    const cleanAndTokenize = (text) => {
        return text
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
            .split(/\s+/)
            .filter(Boolean)
            .filter(w => !STOP_WORDS.has(w));
    };
    const wordsA = cleanAndTokenize(textA);
    const wordsB = cleanAndTokenize(textB);
    if (wordsA.length === 0 || wordsB.length === 0) {
        return { score: 0, matchedConcepts: [], primaryObjectA: null, primaryObjectB: null };
    }
    // 1. Detect Primary Object
    const primaryObjA = (0, exports.detectPrimaryObject)(wordsA);
    const primaryObjB = (0, exports.detectPrimaryObject)(wordsB);
    const matchedConcepts = [];
    // Mismatch check
    if (primaryObjA && primaryObjB && primaryObjA !== primaryObjB) {
        // Return early with low score if primary objects mismatch (e.g. laptop vs bag)
        return {
            score: 0.1,
            matchedConcepts: [`Different objects (${primaryObjA} vs ${primaryObjB})`],
            primaryObjectA: primaryObjA,
            primaryObjectB: primaryObjB
        };
    }
    // Base score from object matching
    let semanticScore = 0;
    if (primaryObjA && primaryObjB && primaryObjA === primaryObjB) {
        semanticScore += 0.5; // Strong base for matching main object type
        matchedConcepts.push(`Same device type (${primaryObjA})`);
    }
    // 2. Brand Matching
    const brandsA = wordsA.filter(w => BRANDS.has(w));
    const brandsB = wordsB.filter(w => BRANDS.has(w));
    const commonBrands = brandsA.filter(b => brandsB.includes(b));
    if (commonBrands.length > 0) {
        semanticScore += 0.25;
        for (const brand of commonBrands) {
            matchedConcepts.push(`Same brand ${brand.charAt(0).toUpperCase() + brand.slice(1)}`);
        }
    }
    else if (brandsA.length > 0 && brandsB.length > 0 && brandsA[0] !== brandsB[0]) {
        // Penalty for different brands of the same object
        semanticScore -= 0.15;
    }
    // 3. Keyword / Accessory / Meaning-based word matches
    // Synonym grouping for scoring secondary words
    const SYNONYM_MAP = {
        'charger': ['charger', 'adapter', 'power supply', 'supply', 'cord', 'cable', 'wire'],
        'sleeve': ['sleeve', 'case', 'cover', 'bag', 'backpack'],
        'bottle': ['bottle', 'flask', 'thermos', 'tumbler'],
        'earphones': ['earbuds', 'earphones', 'headphones', 'airpods']
    };
    const getSecondaryConcept = (word) => {
        for (const [concept, synonyms] of Object.entries(SYNONYM_MAP)) {
            if (synonyms.includes(word))
                return concept;
        }
        return word;
    };
    const conceptsA = new Set(wordsA.map(getSecondaryConcept));
    const conceptsB = new Set(wordsB.map(getSecondaryConcept));
    const commonConcepts = [...conceptsA].filter(c => conceptsB.has(c));
    // Calculate keyword similarity excluding stop words and already matched brands/primary objects
    const ignoredForKeywords = new Set([...commonBrands, primaryObjA || '']);
    const relevantConceptMatches = commonConcepts.filter(c => !ignoredForKeywords.has(c));
    if (relevantConceptMatches.length > 0) {
        semanticScore += Math.min(relevantConceptMatches.length * 0.15, 0.4);
        for (const concept of relevantConceptMatches) {
            // Find original words
            const origA = wordsA.find(w => getSecondaryConcept(w) === concept) || concept;
            const origB = wordsB.find(w => getSecondaryConcept(w) === concept) || concept;
            if (origA === origB) {
                matchedConcepts.push(`Same ${origA.charAt(0).toUpperCase() + origA.slice(1)}`);
            }
            else {
                matchedConcepts.push(`${origA.charAt(0).toUpperCase() + origA.slice(1)} matched ${origB}`);
            }
        }
    }
    // Final check: if neither has primary object but they share words
    if (!primaryObjA && !primaryObjB) {
        const commonWords = wordsA.filter(w => wordsB.includes(w));
        const totalUnique = new Set([...wordsA, ...wordsB]).size;
        semanticScore += totalUnique > 0 ? (commonWords.length / totalUnique) * 0.5 : 0;
    }
    return {
        score: Math.min(Math.max(semanticScore, 0), 1),
        matchedConcepts: [...new Set(matchedConcepts)],
        primaryObjectA: primaryObjA,
        primaryObjectB: primaryObjB
    };
};
exports.compareSemanticText = compareSemanticText;
