export interface SemanticMatchingResult {
  score: number; // between 0 and 1
  matchedConcepts: string[];
  primaryObjectA: string | null;
  primaryObjectB: string | null;
}

const PRIMARY_OBJECTS: { [key: string]: string[] } = {
  'computer': ['laptop', 'notebook', 'macbook', 'computer', 'pc'],
  'phone': ['phone', 'mobile', 'iphone', 'smartphone'],
  'charger': ['adapter', 'power brick', 'charger'],
  'bag': ['backpack', 'bag']
};

const STOP_WORDS = new Set([
  'lost', 'found', 'my', 'the', 'a', 'an', 'with', 'near',
  'inside', 'outside', 'item', 'thing', 'please', 'help'
]);

const BRANDS = new Set([
  'dell', 'apple', 'hp', 'samsung', 'lenovo', 'asus', 'sony', 'google',
  'acer', 'microsoft', 'lg', 'oneplus', 'xiaomi', 'huawei', 'toshiba'
]);

// Dynamic main object extraction (Task 2)
export const extractMainObject = (text: string): string | null => {
  if (!text) return null;

  // 1. Convert to lowercase and clean punctuation
  const cleanText = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;

  // Define lists of words to remove / stop words
  const stopWords = new Set([
    'lost', 'found', 'my', 'the', 'a', 'an', 'item', 'thing', 'please', 'help'
  ]);
  const cutOffWords = new Set([
    'with', 'near', 'inside', 'outside', 'in', 'on', 'at', 'under', 'for', 'from'
  ]);
  const properties = new Set([
    'black', 'white', 'red', 'blue', 'green', 'brown', 'yellow', 'grey', 'gray',
    'small', 'large', 'big',
    'new', 'old',
    'leather', 'plastic', 'metal'
  ]);
  const brands = new Set([
    'dell', 'apple', 'hp', 'samsung', 'lenovo', 'asus', 'sony', 'google',
    'acer', 'microsoft', 'lg', 'oneplus', 'xiaomi', 'huawei', 'toshiba'
  ]);

  // Synonym dictionary mapping (Task 3)
  const SYNONYM_MAP: { [key: string]: string[] } = {
    'computer': ['laptop', 'notebook', 'macbook'],
    'phone': ['mobile', 'smartphone', 'iphone'],
    'charger': ['adapter', 'power brick'],
    'bag': ['backpack']
  };

  const computerIndicators = ['dell', 'hp', 'lenovo', 'macbook', 'asus', 'acer', 'computer', 'charger', 'adapter'];

  // Check synonym dictionary first
  for (const word of words) {
    for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (synonyms.includes(word)) {
        if (word === 'notebook') {
          // Resolve notebook ambiguity
          const isComputer = words.some(w => computerIndicators.includes(w) || brands.has(w));
          if (isComputer) {
            return 'computer';
          }
          continue; // Let it fall through to dynamic extraction as 'notebook'
        }
        return key;
      }
      if (key === word) {
        return key;
      }
    }
  }

  // If no synonym found, extract dynamically:
  const dynamicWords: string[] = [];
  for (const word of words) {
    if (cutOffWords.has(word)) {
      break; // stop processing after cutoff words (near, inside, outside, with)
    }
    if (stopWords.has(word) || properties.has(word) || brands.has(word)) {
      continue;
    }
    // Also ignore short/noise tokens
    if (word.length < 2 || /^\d+$/.test(word)) {
      continue;
    }
    dynamicWords.push(word);
  }

  if (dynamicWords.length > 0) {
    return dynamicWords[dynamicWords.length - 1]; // last word is the head noun
  }

  return null;
};

// Get primary object type from words list
export const detectPrimaryObject = (words: string[]): string | null => {
  return extractMainObject(words.join(' '));
};

/**
 * Compares two text blocks semantically.
 * Clean stop words, detects main object, and computes brand/accessory/concept matches.
 */
export const compareSemanticText = (textA: string, textB: string): SemanticMatchingResult => {
  if (!textA || !textB) {
    return { score: 0, matchedConcepts: [], primaryObjectA: null, primaryObjectB: null };
  }

  const cleanAndTokenize = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter(w => w.length >= 3)
      .filter(w => !['a', 'n', 'x'].includes(w))
      .filter(w => !STOP_WORDS.has(w));
  };

  const wordsA = cleanAndTokenize(textA);
  const wordsB = cleanAndTokenize(textB);

  // 1. Detect Primary Object using the new extractMainObject
  const primaryObjA = extractMainObject(textA);
  const primaryObjB = extractMainObject(textB);

  if (wordsA.length === 0 || wordsB.length === 0) {
    return { score: 0, matchedConcepts: [], primaryObjectA: primaryObjA, primaryObjectB: primaryObjB };
  }

  const matchedConcepts: string[] = [];

  // Mismatch check
  const isMismatch = primaryObjA && primaryObjB && primaryObjA !== primaryObjB;
  if (isMismatch) {
    return {
      score: 0.05, // very low score for mismatched items
      matchedConcepts: [], // no matches
      primaryObjectA: primaryObjA,
      primaryObjectB: primaryObjB
    };
  }

  // Base score from object matching
  let semanticScore = 0;
  if (primaryObjA && primaryObjB && primaryObjA === primaryObjB) {
    semanticScore += 0.5; // Strong base for matching main object type
    // Note: Do NOT push "Same item type" here, ai.service.ts will handle it
  }

  // 2. Brand Matching
  const brandsA = wordsA.filter(w => BRANDS.has(w));
  const brandsB = wordsB.filter(w => BRANDS.has(w));
  const commonBrands = brandsA.filter(b => brandsB.includes(b));
  
  if (commonBrands.length > 0) {
    semanticScore += 0.25;
    for (const brand of commonBrands) {
      matchedConcepts.push(`Same brand: ${brand.charAt(0).toUpperCase() + brand.slice(1)}`);
    }
  } else if (brandsA.length > 0 && brandsB.length > 0 && brandsA[0] !== brandsB[0]) {
    semanticScore -= 0.15;
  }

  // 3. Keyword / Accessory / Meaning-based word matches
  const SYNONYM_MAP: { [key: string]: string[] } = {
    'charger': ['charger', 'adapter', 'power supply', 'supply', 'cord', 'cable', 'wire'],
    'sleeve': ['sleeve', 'case', 'cover', 'bag', 'backpack'],
    'bottle': ['bottle', 'flask', 'thermos', 'tumbler'],
    'earphones': ['earbuds', 'earphones', 'headphones', 'airpods'],
    'purse': ['purse', 'wallet', 'cardholder', 'pouch'],
    'identity': ['id', 'card', 'badge', 'pass', 'license']
  };

  const getSecondaryConcept = (word: string): string => {
    for (const [concept, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (synonyms.includes(word)) return concept;
    }
    return word;
  };

  const conceptsA = new Set(wordsA.map(getSecondaryConcept));
  const conceptsB = new Set(wordsB.map(getSecondaryConcept));

  const commonConcepts = [...conceptsA].filter(c => conceptsB.has(c));
  
  // Calculate keyword similarity excluding stop words and already matched brands/primary objects
  const ignoredForKeywords = new Set([
    ...commonBrands, 
    primaryObjA || '', 
    // Also ignore synonyms of primaryObjA to prevent duplicate concept output
    ...(primaryObjA === 'computer' ? ['laptop', 'notebook', 'macbook', 'computer'] : []),
    ...(primaryObjA === 'phone' ? ['phone', 'mobile', 'iphone', 'smartphone'] : []),
    ...(primaryObjA === 'charger' ? ['charger', 'adapter', 'power brick'] : []),
    ...(primaryObjA === 'bag' ? ['bag', 'backpack'] : []),
    // also ignore primaryObjA directly as lowercase
    ...(primaryObjA ? [primaryObjA.toLowerCase()] : [])
  ]);
  
  const relevantConceptMatches = commonConcepts.filter(c => !ignoredForKeywords.has(c));

  if (relevantConceptMatches.length > 0) {
    semanticScore += Math.min(relevantConceptMatches.length * 0.15, 0.4);
    for (const concept of relevantConceptMatches) {
      const origA = wordsA.find(w => getSecondaryConcept(w) === concept) || concept;
      const origB = wordsB.find(w => getSecondaryConcept(w) === concept) || concept;
      if (origA === origB) {
        matchedConcepts.push(`Same ${origA.charAt(0).toUpperCase() + origA.slice(1)}`);
      } else {
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
