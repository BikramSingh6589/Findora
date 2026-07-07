import mongoose, { Schema } from 'mongoose';

const AIMatchSchema = new Schema({
  lostItem:  { type: Schema.Types.ObjectId, ref: 'LostItem', required: true },
  foundItem: { type: Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  score:     { type: Number, required: true },
  status:    { type: String, enum: ['new', 'reviewed', 'dismissed'], default: 'new' },
}, { timestamps: true });

// Prevent duplicate matches and optimize queries
AIMatchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
AIMatchSchema.index({ foundItem: 1 });

export default mongoose.model('AIMatch', AIMatchSchema);
