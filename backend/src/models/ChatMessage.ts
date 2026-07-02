import mongoose, { Schema } from 'mongoose';

const ChatMessageSchema = new Schema({
  itemId:  { type: String, required: true },
  sender:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type:    { type: String, enum: ['text', 'image'], default: 'text' },
}, { timestamps: true });

export default mongoose.model('ChatMessage', ChatMessageSchema);
