import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import AIMatch from '../models/AIMatch';
import { createNotification } from './notification.service';

export const triggerMatching = async (itemId: string, type: 'lost' | 'found'): Promise<number> => {
  try {
    const sourceItem = type === 'lost' ? await LostItem.findById(itemId) : await FoundItem.findById(itemId);
    if (!sourceItem) return 0;

    const targets = type === 'lost'
      ? await FoundItem.find({ status: 'active' })
      : await LostItem.find({ status: 'active' });

    let count = 0;

    for (const target of targets) {
      let score = 0;
      if (String(sourceItem.category) === String(target.category)) score += 20;
      if (sourceItem.brand && target.brand && sourceItem.brand.toLowerCase() === target.brand.toLowerCase()) score += 15;
      if (sourceItem.color && target.color && sourceItem.color.toLowerCase() === target.color.toLowerCase()) score += 10;
      
      const descA = sourceItem.description || '';
      const descB = target.description || '';
      score += textSimilarity(descA, descB) * 55;

      const finalScore = Math.min(Math.round(score), 100);

      if (finalScore >= 40) {
        const lostId = type === 'lost' ? itemId : target._id;
        const foundId = type === 'found' ? itemId : target._id;

        const existing = await AIMatch.findOne({ lostItem: lostId, foundItem: foundId });
        if (!existing) {
          await AIMatch.create({ lostItem: lostId, foundItem: foundId, score: finalScore });
          count++;

          if (finalScore >= 80) {
            const ownerId = type === 'lost' ? (sourceItem as any).owner : (target as any).owner;
            if (ownerId) {
              const matchingFoundItemId = type === 'lost' ? target._id.toString() : itemId;
              const lostItemName = type === 'lost' ? (sourceItem as any).itemName : (target as any).itemName;
              
              await createNotification(
                String(ownerId),
                'match',
                'Potential Match Found!',
                `We found a potential match for your lost item: "${lostItemName}".`,
                matchingFoundItemId
              );
            }
          }
        }
      }
    }
    return count;
  } catch (error) {
    console.error('AI Matching Service error:', error);
    return 0;
  }
};

export const textSimilarity = (a: string, b: string): number => {
  const cleanWords = (text: string) =>
    text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(Boolean);

  const wordsA = cleanWords(a);
  const wordsB = cleanWords(b);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  const common = [...setA].filter(w => setB.has(w));
  return common.length / Math.max(setA.size, setB.size);
};
