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
              await createNotification(
                String(ownerId),
                'match',
                'Potential Match Found!',
                `We found a potential match for your lost item: "${type === 'lost' ? (sourceItem as any).itemName : (target as any).itemName}".`,
                String(itemId)
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

const textSimilarity = (a: string, b: string): number => {
  const wordsA = a.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  if (wordsA.length === 0 || wordsB.size === 0) return 0;
  const common = wordsA.filter(w => wordsB.has(w));
  return common.length / Math.max(wordsA.length, wordsB.size);
};
