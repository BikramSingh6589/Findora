import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import AIMatch from '../models/AIMatch';
import { createNotification } from './notification.service';
import { textSimilarity } from '../utils/textSimilarity';
import { extractTextFromImage, extractIdentifiers, preprocessImage } from './ocr.service';
import { compareImages } from './imageMatching.service';
import { compareSemanticText, detectPrimaryObject } from './semanticMatching.service';

/**
 * Process AI data extraction (OCR, keywords, identifiers) and store it.
 * This separates ingestion from similarity scanning.
 */
export const processAIData = async (itemId: string, type: 'lost' | 'found', isWorkerJob = false): Promise<void> => {
  // If not called within background worker, check if BullMQ queue is active and dispatch
  if (!isWorkerJob) {
    try {
      const { isQueueActive, dispatchAIMatchingJob } = require('../workers/ai.worker');
      if (isQueueActive()) {
        await dispatchAIMatchingJob(itemId, type);
        return;
      }
    } catch (err) {
      console.warn('[AI Service] Failed to dispatch via BullMQ. Falling back to direct execution.', err);
    }
  }

  try {
    const item = type === 'lost' ? await LostItem.findById(itemId) : await FoundItem.findById(itemId);
    if (!item) return;

    if (item.aiData && item.aiData.processed) {
      // If already processed, just trigger matching directly
      await triggerMatching(itemId, type);
      return;
    }

    console.log(`[AI Data Ingestion] Processing ${type} item ${itemId}`);

    // Preprocess images and extract text
    let extractedText = '';
    if (item.images && item.images.length > 0) {
      const context = `${item.itemName || ''} ${item.description || ''}`;
      const ocrPromises = item.images.map(async (img: string) => {
        const preprocessedImg = await preprocessImage(img);
        return extractTextFromImage(preprocessedImg, context);
      });
      const ocrResults = await Promise.all(ocrPromises);
      extractedText = ocrResults
        .map(res => res?.extractedText)
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    // Generate keywords
    const textToExtractKeywords = `${item.itemName || ''} ${item.description || ''} ${extractedText}`;
    const cleanWords = textToExtractKeywords
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2); // only keywords > 2 chars
    const keywords = [...new Set(cleanWords)];

    // Extract identifiers (serial numbers, IMEI, model numbers, invoice IDs)
    const identifiers = extractIdentifiers(textToExtractKeywords);

    // Save AI Metadata directly to item
    item.aiData = {
      extractedText,
      keywords,
      identifiers,
      processed: true
    };

    await item.save();
    console.log(`[AI Data Ingestion] Completed processing for ${type} item ${itemId}. Identifiers: ${identifiers}`);

    // Trigger Matching
    await triggerMatching(itemId, type);
  } catch (error) {
    console.error(`[AI Data Ingestion] Error processing AI data for item ${itemId}:`, error);
  }
};

/**
 * Trigger AI matching calculations. Reads already processed AI data.
 */
export const triggerMatching = async (itemId: string, type: 'lost' | 'found'): Promise<number> => {
  try {
    const sourceItem = type === 'lost' ? await LostItem.findById(itemId) : await FoundItem.findById(itemId);
    if (!sourceItem || !sourceItem.aiData || !sourceItem.aiData?.processed) {
      console.log(`[Matching Engine] Item ${itemId} has not been processed for AI data yet.`);
      return 0;
    }

    const targets = type === 'lost'
      ? await FoundItem.find({ status: 'active' })
      : await LostItem.find({ status: 'active' });

    let count = 0;

    for (const target of targets) {
      // Ensure target is processed. Skip to prevent request thread blocking, processing asynchronously in bg.
      if (!target.aiData || !target.aiData?.processed) {
        console.log(`[Matching Engine] Target item ${target._id} not processed yet. Skipping active comparison, queueing background processing.`);
        processAIData(target._id.toString(), type === 'lost' ? 'found' : 'lost').catch(console.error);
        continue;
      }

      const descA = sourceItem.description || '';
      const descB = target.description || '';
      const nameA = sourceItem.itemName || '';
      const nameB = target.itemName || '';

      const cleanTokens = (t: string) => t.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .filter(w => w.length >= 3)
        .filter(w => !['a', 'n', 'x'].includes(w));
      const wordsA = cleanTokens(`${nameA} ${descA}`);
      const wordsB = cleanTokens(`${nameB} ${descB}`);
      
      const primaryObjA = detectPrimaryObject(wordsA);
      const primaryObjB = detectPrimaryObject(wordsB);

      const negativeSignals: string[] = [];
      
      // A. Color conflict
      let hasColorConflict = false;
      const colorConflictDetail = checkColorConflict(sourceItem.color || '', target.color || '');
      if (colorConflictDetail) {
        hasColorConflict = true;
        negativeSignals.push(`Color mismatch: ${colorConflictDetail}`);
      }
      
      // B. Brand conflict
      let hasBrandConflict = false;
      const brandConflictDetail = checkBrandConflict(sourceItem.brand || '', target.brand || '');
      if (brandConflictDetail) {
        hasBrandConflict = true;
        negativeSignals.push(`Brand mismatch: ${brandConflictDetail}`);
      }
      
      // C. Model conflict
      let hasModelConflict = false;
      const modelConflictDetail = checkModelConflict(`${nameA} ${descA}`, `${nameB} ${descB}`);
      if (modelConflictDetail) {
        hasModelConflict = true;
        negativeSignals.push(`Different model detected: ${modelConflictDetail}`);
      }

      // D. Material/Size conflict
      const materialConflictDetail = checkMaterialConflict(`${nameA} ${descA}`, `${nameB} ${descB}`);
      if (materialConflictDetail) {
        negativeSignals.push(`Material mismatch: ${materialConflictDetail}`);
      }
      const sizeConflictDetail = checkSizeConflict(`${nameA} ${descA}`, `${nameB} ${descB}`);
      if (sizeConflictDetail) {
        negativeSignals.push(`Size mismatch: ${sizeConflictDetail}`);
      }

      const matchedFields: string[] = [];

      // 1. Main Object Match (30 points)
      let objectScore = 0;
      const isMismatch = !!(primaryObjA && primaryObjB && primaryObjA !== primaryObjB);

      if (primaryObjA && primaryObjB && primaryObjA === primaryObjB) {
        objectScore = 30;
        matchedFields.push(`Same item type: ${primaryObjA.charAt(0).toUpperCase() + primaryObjA.slice(1)}`);
      } else if (!primaryObjA && !primaryObjB) {
        // generic category check
        if (sourceItem.category && target.category && String(sourceItem.category).trim().toLowerCase() === String(target.category).trim().toLowerCase()) {
          objectScore = 15;
          matchedFields.push('Same category');
        }
      }

      if (isMismatch) {
        negativeSignals.push(`Object mismatch: ${primaryObjA} vs ${primaryObjB}`);
      }

      // 2. Brand Match (15 points)
      let brandScore = 0;
      if (sourceItem.brand && target.brand && String(sourceItem.brand).trim().toLowerCase() === String(target.brand).trim().toLowerCase() && !hasBrandConflict) {
        brandScore = 15;
        matchedFields.push(`Same brand: ${sourceItem.brand}`);
      }

      // 3. Color Match (10 points)
      let colorScore = 0;
      if (sourceItem.color && target.color && String(sourceItem.color).trim().toLowerCase() === String(target.color).trim().toLowerCase() && !hasColorConflict) {
        colorScore = 10;
        matchedFields.push(`Same color: ${sourceItem.color}`);
      }

      // 4. Semantic Description Score (20 points)
      let semanticScore = 0;
      let semanticConcepts: string[] = [];
      try {
        const semResult = compareSemanticText(`${nameA} ${descA}`, `${nameB} ${descB}`);
        semanticScore = Math.round(semResult.score * 20);
        semanticConcepts = semResult.matchedConcepts;
      } catch (err) {
        console.error(`[Matching Engine] Semantic match failed, falling back:`, err);
        const fallbackSimilarity = textSimilarity(descA, descB);
        semanticScore = Math.round(fallbackSimilarity * 20);
      }

      // Filter duplicate semantic concepts
      const cleanSemanticConcepts = semanticConcepts.filter(concept => {
        const conceptLower = concept.toLowerCase();
        if (primaryObjA && (conceptLower.includes(primaryObjA.toLowerCase()) || primaryObjA.toLowerCase().includes(conceptLower))) {
          return false;
        }
        if (conceptLower.includes('same item type') || conceptLower.includes('same category')) {
          return false;
        }
        if (conceptLower.includes('same brand') || conceptLower.includes('same color')) {
          return false;
        }
        return true;
      });

      if (semanticScore > 0 && cleanSemanticConcepts.length > 0) {
        matchedFields.push(...cleanSemanticConcepts);
      }

      // 5. Image Score (15 points max)
      const imgA = sourceItem.images?.[0];
      const imgB = target.images?.[0];
      const imgRes = await compareImages(imgA, imgB);
      const imageScore = Math.round(imgRes.score); // returns 0-15
      
      if (imageScore >= 12) {
        matchedFields.push('Similar images');
      }

      // 6. OCR / Identifier Score (10 points max)
      const sourceIds = sourceItem.aiData?.identifiers || [];
      const targetIds = target.aiData?.identifiers || [];
      const matchingIds = sourceIds.filter((id: string) => targetIds.includes(id));
      
      let ocrScore = 0;
      if (matchingIds.length > 0) {
        ocrScore = 10;
        matchedFields.push(`Matching Identifier (${matchingIds.join(', ')})`);
      } else {
        const ocrA = sourceItem.aiData?.extractedText || '';
        const ocrB = target.aiData?.extractedText || '';
        const ocrSimilarity = textSimilarity(ocrA, ocrB);
        ocrScore = Math.min(Math.round(ocrSimilarity * 2), 2); // max 2 points
      }

      // Calculate missing evidence
      const missingEvidence: string[] = [];
      if (!imgA || !imgB) {
        missingEvidence.push('No image available');
      }
      
      const hasOcrA = !!sourceItem.aiData?.extractedText?.trim();
      const hasOcrB = !!target.aiData?.extractedText?.trim();
      
      if (!hasOcrA || !hasOcrB) {
        missingEvidence.push('No receipt or text image uploaded');
      } else if (matchingIds.length === 0) {
        missingEvidence.push('No matching identifier found');
      }

      // Calculate initial sum
      let scoreSum = objectScore + brandScore + colorScore + semanticScore + imageScore + ocrScore;

      // Normalization and Penalties
      let finalScore = scoreSum;
      
      // Apply penalties after base calculation
      if (hasColorConflict) {
        finalScore -= 10;
      }
      if (hasBrandConflict) {
        finalScore -= 15;
      }
      if (hasModelConflict) {
        finalScore -= 15;
      }

      if (isMismatch) {
        // Different objects: cap strictly below 30
        finalScore = Math.min(finalScore, 20);
      } else {
        // Text-only checks and boosts (Task 10)
        const isTextOnly = !imgA && !imgB && matchingIds.length === 0;
        
        if (isTextOnly) {
          const hasConflicts = hasColorConflict || hasBrandConflict || hasModelConflict;
          if (!hasConflicts) {
            if (objectScore === 30 && (brandScore > 0 || colorScore > 0)) {
              // Text + object + semantic property match: boost to 70-80%
              finalScore = Math.max(finalScore + 15, 70);
              finalScore = Math.min(finalScore, 80);
            } else if (objectScore === 30) {
              // Just same object type, no other property match, e.g. helmet vs helmet: cap at 55%
              finalScore = Math.min(finalScore, 55);
            }
          }
        } else {
          // With images or OCR, can reach 90%+
          if (matchingIds.length > 0) {
            finalScore = Math.max(finalScore + 35, 95);
          } else {
            if (finalScore >= 90) {
              const sameObject = (primaryObjA && primaryObjB && primaryObjA === primaryObjB);
              const hasStrongImage = (imageScore >= 12);
              const hasStrongSemantic = (semanticScore >= 16);
              const hasStrongEvidence = hasStrongImage || hasStrongSemantic;
              if (!sameObject || !hasStrongEvidence) {
                finalScore = Math.min(finalScore, 89);
              }
            }
          }
        }
        
        // Ensure finalScore is at least 40% if the primary object matches and there isn't multiple conflicts
        if (objectScore === 30) {
          finalScore = Math.max(finalScore, 40);
        }
      }

      finalScore = Math.min(Math.max(Math.round(finalScore), 0), 100);

      // Generate clean context-aware aiReason sentence (Task 13)
      let aiReason = 'Both reports share matching characteristics.';
      if (isMismatch) {
        aiReason = 'Items have different primary object types.';
      } else if (matchingIds.length > 0) {
        aiReason = `High confidence match due to matching identifier code: ${matchingIds.join(', ')}.`;
      } else if (primaryObjA && primaryObjA === primaryObjB) {
        if (negativeSignals.length > 0) {
          aiReason = `Both reports describe a ${primaryObjA}, but some details are different.`;
        } else {
          const brandText = sourceItem.brand || target.brand || '';
          const brandStr = brandText ? `${brandText.charAt(0).toUpperCase() + brandText.slice(1)} ` : '';
          aiReason = `Both reports describe a similar ${brandStr}${primaryObjA} item.`;
        }
      }
      aiReason = aiReason.replace(/\s+/g, ' ');

      const lostId = type === 'lost' ? itemId : target._id;
      const foundId = type === 'found' ? itemId : target._id;

      if (finalScore >= 40) {
        const matchData = {
          lostItem: lostId,
          foundItem: foundId,
          score: finalScore,
          matchedFields: [...new Set(matchedFields)],
          aiReason,
          negativeSignals: [...new Set(negativeSignals)],
          missingEvidence,
          breakdown: {
            objectScore,
            brandScore,
            colorScore,
            semanticScore,
            imageScore,
            ocrScore,
            categoryScore: objectScore, // legacy fallback
            textScore: semanticScore, // legacy fallback
            metadataScore: brandScore + colorScore // legacy fallback
          }
        };

        const existing = await AIMatch.findOne({ lostItem: lostId, foundItem: foundId });
        if (!existing) {
          await AIMatch.create({
            ...matchData,
            status: 'new'
          });
          count++;

          if (finalScore >= 80) {
            const ownerId = type === 'lost' ? (sourceItem as any).owner : (target as any).owner;
            if (ownerId) {
              const matchingFoundItemId = type === 'lost' ? target._id.toString() : itemId;
              await createNotification(
                String(ownerId),
                'match',
                'Potential Match Found!',
                'We found a potential match for your lost item.',
                matchingFoundItemId
              );
            }
          }
        } else {
          // Update details, preserve status
          existing.score = finalScore;
          existing.matchedFields = matchData.matchedFields;
          existing.aiReason = aiReason;
          existing.negativeSignals = matchData.negativeSignals;
          existing.missingEvidence = missingEvidence;
          existing.breakdown = matchData.breakdown;
          await existing.save();
        }
      }
    }

    return count;
  } catch (error) {
    console.error('AI Matching Service error:', error);
    return 0;
  }
};

// Helper conflict checks (Task 6)
const checkColorConflict = (strA: string, strB: string): string | null => {
  const cleanA = strA.toLowerCase();
  const cleanB = strB.toLowerCase();
  const COLORS_LIST = ['black', 'white', 'red', 'blue', 'green', 'brown', 'yellow', 'grey', 'gray', 'silver', 'gold', 'pink', 'purple', 'orange'];
  
  const colorsA = COLORS_LIST.filter(c => cleanA.includes(c));
  const colorsB = COLORS_LIST.filter(c => cleanB.includes(c));
  
  if (colorsA.length > 0 && colorsB.length > 0) {
    const shareColor = colorsA.some(c => colorsB.includes(c) || (c === 'grey' && colorsB.includes('gray')) || (c === 'gray' && colorsB.includes('grey')));
    if (!shareColor) {
      return `${colorsA.join('/')} vs ${colorsB.join('/')}`;
    }
  }
  return null;
};

const checkBrandConflict = (brandA: string, brandB: string): string | null => {
  const bA = brandA.trim().toLowerCase();
  const bB = brandB.trim().toLowerCase();
  const ignoreList = ['', 'unknown', 'none', 'other', 'n/a', 'na'];
  if (ignoreList.includes(bA) || ignoreList.includes(bB)) {
    return null;
  }
  if (bA !== bB) {
    return `${brandA} vs ${brandB}`;
  }
  return null;
};

const checkModelConflict = (textA: string, textB: string): string | null => {
  const wordsA = textA.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').split(/\s+/).filter(Boolean);
  const wordsB = textB.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').split(/\s+/).filter(Boolean);
  
  const brandsAndProducts = [
    'dell', 'apple', 'hp', 'samsung', 'lenovo', 'asus', 'sony', 'google', 
    'acer', 'microsoft', 'lg', 'oneplus', 'xiaomi', 'huawei', 'toshiba',
    'iphone', 'ipad', 'macbook', 'galaxy', 'pixel', 'playstation', 'xbox', 'nintendo'
  ];
  
  const stopWords = new Set(['lost', 'found', 'my', 'the', 'a', 'an', 'with', 'near', 'inside', 'outside', 'item', 'thing', 'please', 'help']);
  const properties = new Set([
    'black', 'white', 'red', 'blue', 'green', 'brown', 'yellow', 'grey', 'gray', 'silver', 'gold',
    'small', 'large', 'big', 'new', 'old', 'leather', 'plastic', 'metal'
  ]);

  for (const key of brandsAndProducts) {
    const idxA = wordsA.indexOf(key);
    const idxB = wordsB.indexOf(key);
    if (idxA !== -1 && idxB !== -1) {
      const nextWordA = wordsA[idxA + 1];
      const nextWordB = wordsB[idxB + 1];
      if (nextWordA && nextWordB) {
        if (!stopWords.has(nextWordA) && !properties.has(nextWordA) &&
            !stopWords.has(nextWordB) && !properties.has(nextWordB)) {
          if (nextWordA !== nextWordB) {
            const keyCap = key.charAt(0).toUpperCase() + key.slice(1);
            return `${keyCap} ${nextWordA} vs ${keyCap} ${nextWordB}`;
          }
        }
      }
    }
  }
  return null;
};

const checkMaterialConflict = (textA: string, textB: string): string | null => {
  const materials = ['leather', 'plastic', 'metal', 'fabric', 'rubber', 'silicon', 'wooden', 'glass'];
  const cleanA = textA.toLowerCase();
  const cleanB = textB.toLowerCase();
  
  const matA = materials.find(m => cleanA.includes(m));
  const matB = materials.find(m => cleanB.includes(m));
  
  if (matA && matB && matA !== matB) {
    return `${matA} vs ${matB}`;
  }
  return null;
};

const checkSizeConflict = (textA: string, textB: string): string | null => {
  const sizes = ['small', 'medium', 'large', 'big', 'tiny', 'huge'];
  const cleanA = textA.toLowerCase();
  const cleanB = textB.toLowerCase();
  
  const sizeA = sizes.find(s => cleanA.includes(s));
  const sizeB = sizes.find(s => cleanB.includes(s));
  
  if (sizeA && sizeB && sizeA !== sizeB) {
    if ((sizeA === 'big' && sizeB === 'large') || (sizeA === 'large' && sizeB === 'big')) {
      return null;
    }
    return `${sizeA} vs ${sizeB}`;
  }
  return null;
};
