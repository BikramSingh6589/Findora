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
export const processAIData = async (itemId: string, type: 'lost' | 'found'): Promise<void> => {
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
      const ocrPromises = item.images.map(async (img: string) => {
        const preprocessedImg = await preprocessImage(img);
        return extractTextFromImage(preprocessedImg);
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
      // Ensure target is processed or fallback safely
      if (!target.aiData || !target.aiData?.processed) {
        console.log(`[Matching Engine] Target item ${target._id} not processed yet. Processing on-the-fly.`);
        // Run OCR processing on target item as a fallback
        await processAIData(target._id.toString(), type === 'lost' ? 'found' : 'lost');
        // Reload target
        const reloadedTarget = type === 'lost' ? await FoundItem.findById(target._id) : await LostItem.findById(target._id);
        if (!reloadedTarget || !reloadedTarget.aiData || !reloadedTarget.aiData?.processed) continue;
      }

      const descA = sourceItem.description || '';
      const descB = target.description || '';
      const nameA = sourceItem.itemName || '';
      const nameB = target.itemName || '';

      const cleanTokens = (t: string) => t.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ').split(/\s+/).filter(Boolean);
      const wordsA = cleanTokens(`${nameA} ${descA}`);
      const wordsB = cleanTokens(`${nameB} ${descB}`);
      
      const primaryObjA = detectPrimaryObject(wordsA);
      const primaryObjB = detectPrimaryObject(wordsB);

      const matchedFields: string[] = [];
      const missingEvidence: string[] = [];

      // 1. Main Object Match (30 points)
      let objectScore = 0;
      if (primaryObjA && primaryObjB && primaryObjA === primaryObjB) {
        objectScore = 30;
        matchedFields.push('Same device type');
        if (primaryObjA === 'computer') matchedFields.push('Notebook matched Laptop');
        else if (primaryObjA === 'charger') matchedFields.push('Adapter matched Charger');
        else if (primaryObjA === 'phone') matchedFields.push('Phone matched Mobile');
        else if (primaryObjA === 'earphones') matchedFields.push('Earbuds matched Earphones');
        else if (primaryObjA === 'bag') matchedFields.push('Bag matched Backpack');
      } else if (!primaryObjA && !primaryObjB) {
        // generic category check
        if (sourceItem.category && target.category && String(sourceItem.category).trim().toLowerCase() === String(target.category).trim().toLowerCase()) {
          objectScore = 15;
          matchedFields.push('Same category');
        }
      }

      const isMismatch = (primaryObjA && primaryObjB && primaryObjA !== primaryObjB);

      // 2. Brand Match (15 points)
      let brandScore = 0;
      if (sourceItem.brand && target.brand && String(sourceItem.brand).trim().toLowerCase() === String(target.brand).trim().toLowerCase()) {
        brandScore = 15;
        matchedFields.push(`Same brand ${sourceItem.brand}`);
      }

      // 3. Color Match (10 points)
      let colorScore = 0;
      if (sourceItem.color && target.color && String(sourceItem.color).trim().toLowerCase() === String(target.color).trim().toLowerCase()) {
        colorScore = 10;
        matchedFields.push(`Same color ${sourceItem.color}`);
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

      if (semanticScore > 0 && semanticConcepts.length > 0) {
        matchedFields.push(...semanticConcepts);
      }

      // 5. Image Score (15 points max)
      const imgA = sourceItem.images?.[0];
      const imgB = target.images?.[0];
      const imgRes = await compareImages(imgA, imgB);
      const imageScore = Math.round(imgRes.score); // returns 0-15
      
      if (imageScore >= 12) {
        matchedFields.push('Similar images');
      }
      if (!imgA || !imgB) {
        missingEvidence.push('Image not available');
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
      if (matchingIds.length === 0) {
        missingEvidence.push('Receipt not available');
      }

      // Calculate initial sum
      let scoreSum = objectScore + brandScore + colorScore + semanticScore + imageScore + ocrScore;

      // Normalization and Penalties
      let finalScore = scoreSum;
      if (isMismatch) {
        // Different objects: cap at 30%
        finalScore = Math.min(finalScore, 30);
      } else {
        // Normalization checks
        const hasStrongImage = (imageScore >= 12);
        const hasStrongSerial = (ocrScore === 10);
        const hasStrongSemantic = (semanticScore >= 16);

        let strongSignalsCount = 0;
        if (hasStrongImage) strongSignalsCount++;
        if (hasStrongSerial) strongSignalsCount++;
        if (hasStrongSemantic) strongSignalsCount++;

        const sameObject = (primaryObjA && primaryObjB && primaryObjA === primaryObjB);

        if (finalScore >= 90) {
          if (!sameObject || strongSignalsCount < 2) {
            // Cap at 89% if missing proof
            finalScore = Math.min(finalScore, 89);
          }
        }
      }

      finalScore = Math.min(Math.max(Math.round(finalScore), 0), 100);

      // Generate clean aiReason sentence
      let aiReason = 'Both reports share matching characteristics.';
      if (isMismatch) {
        aiReason = 'Items have different primary object types.';
      } else if (matchingIds.length > 0) {
        aiReason = `High confidence match due to matching identifier code: ${matchingIds.join(', ')}.`;
      } else {
        const brandText = sourceItem.brand || target.brand || '';
        const objectText = primaryObjA || 'item';
        aiReason = `Both reports describe the same ${brandText} ${objectText} device with matching accessories.`.replace(/\s+/g, ' ');
      }

      const lostId = type === 'lost' ? itemId : target._id;
      const foundId = type === 'found' ? itemId : target._id;

      if (finalScore >= 40) {
        const matchData = {
          lostItem: lostId,
          foundItem: foundId,
          score: finalScore,
          matchedFields: [...new Set(matchedFields)],
          aiReason,
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
