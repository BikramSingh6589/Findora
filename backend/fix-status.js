const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const claimSchema = new mongoose.Schema({
  status: String,
  claimant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem' },
  lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' }
});

const lostItemSchema = new mongoose.Schema({
  status: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Claim = mongoose.models.Claim || mongoose.model('Claim', claimSchema);
const LostItem = mongoose.models.LostItem || mongoose.model('LostItem', lostItemSchema);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const resolvedClaims = await Claim.find({
      status: { $in: ['resolved', 'approved'] }
    });
    console.log(`Found ${resolvedClaims.length} resolved/approved claims.`);

    let fixed = 0;
    for (const claim of resolvedClaims) {
      let targetLostItemId = claim.lostItemId;
      
      if (!targetLostItemId && claim.claimant) {
        const fallbackLostItem = await LostItem.findOne({ owner: claim.claimant, status: 'active' });
        if (fallbackLostItem) targetLostItemId = fallbackLostItem._id;
      }

      if (targetLostItemId) {
        const result = await LostItem.findByIdAndUpdate(
          targetLostItemId,
          { status: 'claimed' },
          { new: false }
        );
        if (result && result.status === 'active') {
          console.log(`Fixed LostItem ${targetLostItemId}`);
          fixed++;
        } else if (result && result.status === 'resolved') {
          // also update 'resolved' to 'claimed' for consistency
          await LostItem.findByIdAndUpdate(targetLostItemId, { status: 'claimed' });
          console.log(`Updated LostItem ${targetLostItemId} from resolved to claimed`);
          fixed++;
        }
      }
    }
    console.log(`Done. Fixed ${fixed} lost items.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

run();
