export interface SemanticMatchingResult {
  score: number; // between 0 and 1
  matchedConcepts: string[];
  primaryObjectA: string | null;
  primaryObjectB: string | null;
}

const PRIMARY_OBJECTS: { [key: string]: string[] } = {
  'computer': ['laptop', 'macbook', 'computer', 'pc', 'notebook'],
  'phone': ['phone', 'mobile', 'iphone', 'smartphone'],
  'wallet': ['wallet', 'purse', 'card holder', 'billfold', 'cardholder'],
  'id': ['id card', 'identity card', 'college id', 'student card', 'badge', 'pass', 'license'],
  'keys': ['key', 'keys', 'keychain', 'fob', 'keyfob'],
  'books': ['book', 'textbook', 'copy', 'notebook'],
  'documents': ['document', 'file', 'certificate', 'paper'],
  'accessories': ['watch', 'smartwatch', 'band', 'earphones', 'headphones', 'earbuds', 'airpods', 'headset'],
  'bottle': ['bottle', 'flask', 'thermos', 'tumbler'],
  'bag': ['bag', 'backpack', 'knapsack', 'handbag', 'briefcase'],
  'electronics': ['calculator', 'mouse', 'keyboard', 'tablet'],
  'clothing': ['jacket', 'shirt', 'hoodie', 'sweater', 'coat', 'cap', 'hat'],
  'storage': ['pendrive', 'usb', 'flash drive', 'hard disk', 'hdd', 'ssd', 'hard drive'],
  'umbrella': ['umbrella'],
  'jewelry': ['ring', 'chain', 'bracelet', 'necklace'],
  'eyewear': ['glasses', 'spectacles', 'eyeglasses'],
  'vehicle': ['cycle', 'bicycle', 'bike']
};

const STOP_WORDS = new Set([
  'lost', 'found', 'my', 'the', 'a', 'an', 'with', 'near',
  'inside', 'outside', 'item', 'thing'
]);

const BRANDS = new Set([
  'dell', 'apple', 'hp', 'samsung', 'lenovo', 'asus', 'sony', 'google',
  'acer', 'microsoft', 'lg', 'oneplus', 'xiaomi', 'huawei', 'toshiba'
]);

// Get primary object type from words list
export const detectPrimaryObject = (words: string[]): string | null => {
  let primaryObj: string | null = null;
  let maxIndex = -1;

  // Pre-process context for "notebook" to resolve study vs laptop laptop ambiguity
  const hasNotebook = words.includes('notebook');
  let notebookCategory: string | null = null;
  if (hasNotebook) {
    const computerIndicators = ['dell', 'hp', 'lenovo', 'macbook', 'asus', 'acer', 'computer', 'charger', 'adapter'];
    const studyIndicators = ['math', 'class', 'subject', 'notes', 'pages', 'spiral', 'study', 'ruled', 'writing', 'physics', 'chemistry'];
    
    const isComputer = words.some(w => computerIndicators.includes(w));
    const isStudy = words.some(w => studyIndicators.includes(w));

    if (isComputer) {
      notebookCategory = 'computer';
    } else if (isStudy) {
      notebookCategory = 'books';
    } else {
      notebookCategory = 'books'; // Default stationery unless computer context indicators present
    }
  }

  for (const [objType, keywords] of Object.entries(PRIMARY_OBJECTS)) {
    for (const keyword of keywords) {
      if (keyword === 'notebook') {
        if (notebookCategory === objType) {
          const lastIdx = words.lastIndexOf('notebook');
          if (lastIdx !== -1 && lastIdx > maxIndex) {
            maxIndex = lastIdx;
            primaryObj = objType;
          }
        }
        continue;
      }

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
      } else {
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
      .filter(w => !STOP_WORDS.has(w));
  };

  const wordsA = cleanAndTokenize(textA);
  const wordsB = cleanAndTokenize(textB);

  if (wordsA.length === 0 || wordsB.length === 0) {
    return { score: 0, matchedConcepts: [], primaryObjectA: null, primaryObjectB: null };
  }

  // 1. Detect Primary Object
  const primaryObjA = detectPrimaryObject(wordsA);
  const primaryObjB = detectPrimaryObject(wordsB);

  const matchedConcepts: string[] = [];

  // Mismatch check
  if (primaryObjA && primaryObjB && primaryObjA !== primaryObjB) {
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
    matchedConcepts.push(`Same item type`);
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
  const ignoredForKeywords = new Set([...commonBrands, primaryObjA || '']);
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
