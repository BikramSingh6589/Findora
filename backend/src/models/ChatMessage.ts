import mongoose, { Schema } from 'mongoose';

const ChatMessageSchema = new Schema({
  claimId: { type: Schema.Types.ObjectId, ref: 'Claim', required: true },
  sender:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

ChatMessageSchema.index({ claimId: 1, createdAt: 1 });

export default mongoose.model('ChatMessage', ChatMessageSchema);
