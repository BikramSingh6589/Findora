import mongoose, { Schema } from 'mongoose';

const ClaimSchema = new Schema({
  claimId:       { type: String, unique: true },
  foundItemId:   { type: Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  lostItemId:    { type: Schema.Types.ObjectId, ref: 'LostItem' },
  claimant:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status:             { type: String, enum: ['pending', 'approved', 'rejected', 'resolved', 'mediated'], default: 'pending' },
  answers: {
    location:     { type: String, default: '' },
    dateDetails:  { type: String, default: '' },
    colorMatch:   { type: String, default: '' },
    specialMarks: { type: String, default: '' },
  },
  proofUrls:          { type: [String], default: [] },
  confidence:         { type: Number, default: 0 },
  qrCodeUrl:          { type: String, default: '' },
  qrToken:            { type: String, default: '' },
  qrExpiresAt:        { type: Date },
  mediationRequested: { type: Boolean, default: false },
  mediationStatus:    { type: String, enum: ['none', 'pending', 'approved', 'rejected', 'pending_handover'], default: 'none' },
  conflictCode:       { type: String, default: '' },
  remarks:            { type: String, default: '' },
  reason:             { type: String, default: '' },
  finderHandoverChoice: { type: String, enum: ['me', 'other', 'none'], default: 'none' },
  finderHandoverLocation: { type: String, default: '' },
  finderDropoffCode:  { type: String, default: '' },
  locationNotifiedToClaimant: { type: Boolean, default: false },
}, { timestamps: true });

ClaimSchema.index({ status: 1, claimant: 1 });

ClaimSchema.pre('save', async function(this: any, next: any) {
  if (!this.claimId) {
    try {
      const ClaimModel = mongoose.model('Claim');
      const count = await ClaimModel.countDocuments();
      this.claimId = 'CLM-' + String(count + 1).padStart(3, '0');
    } catch (err: any) {
      return next(err);
    }
  }
  next();
});

export default mongoose.model('Claim', ClaimSchema);
