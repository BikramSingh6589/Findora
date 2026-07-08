import mongoose, { Schema, Document } from 'mongoose';

export interface IAIMatch extends Document {
  lostItem: mongoose.Types.ObjectId;
  foundItem: mongoose.Types.ObjectId;
  score: number;
  status: 'new' | 'reviewed' | 'dismissed';
  matchedFields: string[];
  aiReason: string;
  breakdown: {
    textScore: number;
    imageScore: number;
    ocrScore: number;
    metadataScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AIMatchSchema = new Schema({
  lostItem:  { type: Schema.Types.ObjectId, ref: 'LostItem', required: true },
  foundItem: { type: Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  score:     { type: Number, required: true },
  status:    { type: String, enum: ['new', 'reviewed', 'dismissed'], default: 'new' },
  matchedFields: { type: [String], default: [] },
  aiReason:      { type: String, default: '' },
  breakdown: {
    textScore:     { type: Number, default: 0 },
    imageScore:    { type: Number, default: 0 },
    ocrScore:      { type: Number, default: 0 },
    metadataScore: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Prevent duplicate matches and optimize queries
AIMatchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
AIMatchSchema.index({ foundItem: 1 });

export default mongoose.model<IAIMatch>('AIMatch', AIMatchSchema);
