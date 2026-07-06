import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema({
  recipient:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:          { type: String, required: true },
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  read:          { type: Boolean, default: false },
  relatedItemId: { type: String, default: null },
  relatedClaimId: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
