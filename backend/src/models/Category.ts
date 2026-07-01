import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Category', CategorySchema);
