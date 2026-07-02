"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerMatching = void 0;
const LostItem_1 = __importDefault(require("../models/LostItem"));
const FoundItem_1 = __importDefault(require("../models/FoundItem"));
const AIMatch_1 = __importDefault(require("../models/AIMatch"));
const notification_service_1 = require("./notification.service");
const triggerMatching = async (itemId, type) => {
    try {
        const sourceItem = type === 'lost' ? await LostItem_1.default.findById(itemId) : await FoundItem_1.default.findById(itemId);
        if (!sourceItem)
            return 0;
        const targets = type === 'lost'
            ? await FoundItem_1.default.find({ status: 'active' })
            : await LostItem_1.default.find({ status: 'active' });
        let count = 0;
        for (const target of targets) {
            let score = 0;
            if (String(sourceItem.category) === String(target.category))
                score += 20;
            if (sourceItem.brand && target.brand && sourceItem.brand.toLowerCase() === target.brand.toLowerCase())
                score += 15;
            if (sourceItem.color && target.color && sourceItem.color.toLowerCase() === target.color.toLowerCase())
                score += 10;
            const descA = sourceItem.description || '';
            const descB = target.description || '';
            score += textSimilarity(descA, descB) * 55;
            const finalScore = Math.min(Math.round(score), 100);
            if (finalScore >= 40) {
                const lostId = type === 'lost' ? itemId : target._id;
                const foundId = type === 'found' ? itemId : target._id;
                const existing = await AIMatch_1.default.findOne({ lostItem: lostId, foundItem: foundId });
                if (!existing) {
                    await AIMatch_1.default.create({ lostItem: lostId, foundItem: foundId, score: finalScore });
                    count++;
                    if (finalScore >= 80) {
                        const ownerId = type === 'lost' ? sourceItem.owner : target.owner;
                        if (ownerId) {
                            await (0, notification_service_1.createNotification)(String(ownerId), 'match', 'Potential Match Found!', `We found a potential match for your lost item: "${type === 'lost' ? sourceItem.itemName : target.itemName}".`, String(itemId));
                        }
                    }
                }
            }
        }
        return count;
    }
    catch (error) {
        console.error('AI Matching Service error:', error);
        return 0;
    }
};
exports.triggerMatching = triggerMatching;
const textSimilarity = (a, b) => {
    const wordsA = a.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    if (wordsA.length === 0 || wordsB.size === 0)
        return 0;
    const common = wordsA.filter(w => wordsB.has(w));
    return common.length / Math.max(wordsA.length, wordsB.size);
};
