import mongoose, { Schema } from 'mongoose';

const CommunityPostSchema = new Schema({
  author:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemId:     { type: Schema.Types.ObjectId, ref: 'FoundItem' },
  content:    { type: String, required: true },
  type:       { type: String, enum: ['found', 'suggestion', 'lost', 'spam', 'warning'], default: 'found' },
  flagReason: { type: String, default: '' },
  status:     { type: String, enum: ['active', 'flagged', 'removed', 'approved'], default: 'active' },
  expiresAt:  { type: Date, required: true },
}, { timestamps: true });

// MongoDB TTL index — auto-delete documents after expiresAt
CommunityPostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('CommunityPost', CommunityPostSchema);
