import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import AIMatch from '../models/AIMatch';
import { createNotification } from './notification.service';
import { textSimilarity } from '../utils/textSimilarity';
import { extractTextFromImage } from './ocr.service';
import { compareImages } from './imageMatching.service';

/**
 * Process OCR text extraction and keyword generation for an item.
 */
const processItemOCR = async (item: any): Promise<void> => {
  if (item.aiData && item.aiData.processed) {
    return;
  }

  try {
    let extractedText = '';
    if (item.images && item.images.length > 0) {
      const ocrPromises = item.images.map((img: string) => extractTextFromImage(img));
      const ocrResults = await Promise.all(ocrPromises);
      extractedText = ocrResults
        .map(res => res?.extractedText)
        .filter(Boolean)
        .join(' ')
        .trim();
    }

    // Extract keywords
    const textToExtractKeywords = `${item.itemName || ''} ${item.description || ''} ${extractedText}`;
    const cleanWords = textToExtractKeywords
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2); // only keep keywords > 2 chars
    const keywords = [...new Set(cleanWords)];

    item.aiData = {
      extractedText,
      keywords,
      processed: true
    };

    await item.save();
    console.log(`Processed AI data for item ${item._id}: extracted text length ${extractedText.length}, keywords: ${keywords.length}`);
  } catch (error) {
    console.error(`Error processing AI data for item ${item._id}:`, error);
  }
};

/**
 * Trigger AI matching calculations asynchronously.
 */
export const triggerMatching = async (itemId: string, type: 'lost' | 'found'): Promise<number> => {
  try {
    const sourceItem = type === 'lost' ? await LostItem.findById(itemId) : await FoundItem.findById(itemId);
    if (!sourceItem) return 0;

    // Asynchronously run OCR on source item if not processed yet
    await processItemOCR(sourceItem);

    const targets = type === 'lost'
      ? await FoundItem.find({ status: 'active' })
      : await LostItem.find({ status: 'active' });

    let count = 0;

    for (const target of targets) {
      // Ensure target OCR is processed (fallback/safety check)
      if (!target.aiData || !target.aiData.processed) {
        await processItemOCR(target);
      }

      let categoryScore = 0;
      if (sourceItem.category && target.category && String(sourceItem.category).trim().toLowerCase() === String(target.category).trim().toLowerCase()) {
        categoryScore = 20;
      }

      let brandScore = 0;
      if (sourceItem.brand && target.brand && String(sourceItem.brand).trim().toLowerCase() === String(target.brand).trim().toLowerCase()) {
        brandScore = 15;
      }

      let colorScore = 0;
      if (sourceItem.color && target.color && String(sourceItem.color).trim().toLowerCase() === String(target.color).trim().toLowerCase()) {
        colorScore = 10;
      }

      const descSimilarity = textSimilarity(sourceItem.description || '', target.description || '');
      const textScore = descSimilarity * 10;

      const ocrSimilarity = textSimilarity((sourceItem.aiData && sourceItem.aiData.extractedText) || '', (target.aiData && target.aiData.extractedText) || '');
      const ocrScore = ocrSimilarity * 20;

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
      const imageScore = maxImageScore;

      const metadataScore = categoryScore + brandScore + colorScore;
      const finalScore = Math.min(Math.round(metadataScore + textScore + ocrScore + imageScore), 100);

      if (finalScore >= 40) {
        const lostId = type === 'lost' ? itemId : target._id;
        const foundId = type === 'found' ? itemId : target._id;

        const matchedFields: string[] = [];
        const reasonsList: string[] = [];

        if (categoryScore > 0) {
          matchedFields.push('Same category');
          reasonsList.push(`are in the same category ("${sourceItem.category}")`);
        }
        if (brandScore > 0) {
          matchedFields.push('Same brand');
          reasonsList.push(`have matching "${sourceItem.brand}" brand`);
        }
        if (colorScore > 0) {
          matchedFields.push('Same color');
          reasonsList.push(`have matching "${sourceItem.color}" color`);
        }
        if (descSimilarity > 0) {
          matchedFields.push('Similar description');
          reasonsList.push('have similar descriptions');
        }
        if (ocrSimilarity > 0) {
          matchedFields.push('Similar OCR text');
          reasonsList.push('have matching text extracted from images');
        }

        let aiReason = '';
        if (reasonsList.length > 0) {
          if (reasonsList.length === 1) {
            aiReason = `Both items ${reasonsList[0]}.`;
          } else if (reasonsList.length === 2) {
            aiReason = `Both items ${reasonsList[0]} and ${reasonsList[1]}.`;
          } else {
            const mainReasons = reasonsList.slice(0, -1);
            const lastReason = reasonsList[reasonsList.length - 1];
            aiReason = `Both items ${mainReasons.join(', ')}, and ${lastReason}.`;
          }
        } else {
          aiReason = 'Both items share matching characteristics.';
        }

        const matchData = {
          lostItem: lostId,
          foundItem: foundId,
          score: finalScore,
          matchedFields,
          aiReason,
          breakdown: {
            textScore: Math.round(textScore),
            imageScore: Math.round(imageScore),
            ocrScore: Math.round(ocrScore),
            metadataScore: Math.round(metadataScore),
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
          existing.matchedFields = matchedFields;
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
