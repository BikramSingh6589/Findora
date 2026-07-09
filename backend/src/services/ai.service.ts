import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import AIMatch from '../models/AIMatch';
import { createNotification } from './notification.service';
import { textSimilarity } from '../utils/textSimilarity';
import { extractTextFromImage, extractIdentifiers, preprocessImage } from './ocr.service';
import { compareImages } from './imageMatching.service';
import { compareSemanticText } from './semanticMatching.service';

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

      const matchedFields: string[] = [];

      // 1. Category Score (15 points)
      let categoryScore = 0;
      if (sourceItem.category && target.category && String(sourceItem.category).trim().toLowerCase() === String(target.category).trim().toLowerCase()) {
        categoryScore = 15;
        matchedFields.push('Same category');
      }

      // 2. Brand Score (15 points)
      let brandScore = 0;
      if (sourceItem.brand && target.brand && String(sourceItem.brand).trim().toLowerCase() === String(target.brand).trim().toLowerCase()) {
        brandScore = 15;
        matchedFields.push(`Same ${sourceItem.brand} brand`);
      }

      // 3. Color Score (10 points)
      let colorScore = 0;
      if (sourceItem.color && target.color && String(sourceItem.color).trim().toLowerCase() === String(target.color).trim().toLowerCase()) {
        colorScore = 10;
        matchedFields.push(`Same ${sourceItem.color} color`);
      }

      // 4. Semantic Description Score (20 points) with Jaccard Fallback
      let semanticScore = 0;
      let semanticConcepts: string[] = [];
      const descA = sourceItem.description || '';
      const descB = target.description || '';

      try {
        const semResult = compareSemanticText(descA, descB);
        semanticScore = Math.round(semResult.score * 20);
        semanticConcepts = semResult.matchedConcepts;
      } catch (err) {
        console.error(`[Matching Engine] Semantic match failed, falling back:`, err);
        const fallbackSimilarity = textSimilarity(descA, descB);
        semanticScore = Math.round(fallbackSimilarity * 20);
      }

      // Append semantic concepts to matchedFields
      if (semanticScore > 0 && semanticConcepts.length > 0) {
        matchedFields.push(...semanticConcepts);
      } else if (semanticScore > 0) {
        matchedFields.push('Similar description');
      }

      // 5. OCR Similarity Score (20 points)
      const ocrA = sourceItem.aiData?.extractedText || '';
      const ocrB = target.aiData?.extractedText || '';
      const ocrSimilarity = textSimilarity(ocrA, ocrB);
      let ocrScore = Math.round(ocrSimilarity * 20);

      if (ocrSimilarity > 0) {
        matchedFields.push('Similar receipt/label text');
      }

      // 6. Image Match Score (20 points)
      let maxImageScore = 0;
      if (sourceItem.images && sourceItem.images.length > 0 && target.images && target.images.length > 0) {
        for (const imgA of sourceItem.images) {
          for (const imgB of target.images) {
            const imgRes = await compareImages(imgA, imgB);
            if (imgRes.score > maxImageScore) {
              maxImageScore = imgRes.score;
            }
          }
        }
      }
      let imageScore = Math.round(maxImageScore * 20);
      if (imageScore > 10) {
        matchedFields.push('Similar images');
      }

      // Calculate base score
      let scoreSum = categoryScore + brandScore + colorScore + semanticScore + ocrScore + imageScore;

      // 7. Identifier Match Boost (+30 points)
      const sourceIds = sourceItem.aiData?.identifiers || [];
      const targetIds = target.aiData?.identifiers || [];
      const matchingIds = sourceIds.filter((id: string) => targetIds.includes(id));

      if (matchingIds.length > 0) {
        console.log(`[Matching Engine] Identifier matched: ${matchingIds}. Applying +30 boost.`);
        scoreSum += 30;
        matchedFields.push(`Matching Identifier (${matchingIds.join(', ')})`);
      }

      // Cap final score at 100
      const finalScore = Math.min(Math.round(scoreSum), 100);

      // Generate clean aiReason sentence
      let aiReason = 'Both reports share matching characteristics.';
      if (matchingIds.length > 0) {
        aiReason = `High confidence match due to matching identifier code: ${matchingIds.join(', ')}.`;
      } else if (categoryScore > 0 && brandScore > 0) {
        aiReason = `Both reports describe the same ${sourceItem.brand || ''} ${sourceItem.category} device with matching accessories.`;
      } else if (categoryScore > 0) {
        aiReason = `Both reports describe items in the same "${sourceItem.category}" category with similar details.`;
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
          breakdown: {
            categoryScore,
            brandScore,
            colorScore,
            semanticScore,
            ocrScore,
            imageScore,
            textScore: semanticScore, // fallback compatibility
            metadataScore: categoryScore + brandScore + colorScore // fallback compatibility
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
