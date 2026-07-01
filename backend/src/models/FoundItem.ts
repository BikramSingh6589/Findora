import mongoose, { Schema } from 'mongoose';

const FoundItemSchema = new Schema({
  finder:            { type: Schema.Types.ObjectId, ref: 'User', required: true },
  itemName:          { type: String, required: true, trim: true },
  category:          { type: String, required: true, trim: true },
  brand:             { type: String, default: '' },
  color:             { type: String, required: true, trim: true },
  description:       { type: String, required: true },
  locationFound:     { type: String, required: true },
  dateFound:         { type: Date, required: true },
  specialAppearance: { type: String, default: '' },
  additionalNotes:   { type: String, default: '' },
  images:            { type: [String], default: [] },
  status:            { type: String, enum: ['active', 'claimed', 'archived'], default: 'active' },
}, { timestamps: true });

// Create text index for search query support
FoundItemSchema.index({ itemName: 'text', description: 'text' });
// Compound index for categorized filters
FoundItemSchema.index({ category: 1, status: 1 });

export default mongoose.model('FoundItem', FoundItemSchema);
