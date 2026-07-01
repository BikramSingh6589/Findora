import mongoose, { Schema } from 'mongoose';

const LostItemSchema = new Schema({
  owner:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemName:         { type: String, required: true, trim: true },
  category:         { type: String, required: true, trim: true },
  brand:            { type: String, default: '' },
  color:            { type: String, required: true, trim: true },
  description:      { type: String, required: true },
  locationLost:     { type: String, required: true },
  dateLost:         { type: Date, required: true },
  specialAppearance:{ type: String, default: '' },
  images:           { type: [String], default: [] },
  status:           { type: String, enum: ['active', 'resolved', 'archived'], default: 'active' },
  aiMatchScore:     { type: Number, default: 0 },
}, { timestamps: true });

// Create text index on itemName and description for text searches
LostItemSchema.index({ itemName: 'text', description: 'text' });
// Compound index to optimize dashboard and search listing queries
LostItemSchema.index({ category: 1, status: 1 });

export default mongoose.model('LostItem', LostItemSchema);
