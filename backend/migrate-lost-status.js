const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://LostAndFoundAI:Bikram23021314@cluster0.b6k9uta.mongodb.net/';
const DB_NAME = 'test'; // default mongoose db name

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(DB_NAME);
    const claims = db.collection('claims');
    const lostItems = db.collection('lostitems');

    // Find all resolved/approved claims with a lostItemId
    const resolvedClaims = await claims.find({
      status: { $in: ['resolved', 'approved'] },
      lostItemId: { $exists: true, $ne: null }
    }).toArray();

    console.log(`Found ${resolvedClaims.length} resolved/approved claims with lostItemId`);

    let fixed = 0;
    for (const claim of resolvedClaims) {
      if (claim.lostItemId) {
        const result = await lostItems.updateOne(
          { _id: claim.lostItemId, status: 'active' },
          { $set: { status: 'resolved' } }
        );
        if (result.modifiedCount > 0) {
          console.log(`  Fixed lostItem: ${claim.lostItemId}`);
          fixed++;
        }
      }
    }

    console.log(`\n✅ Migration complete. Fixed ${fixed} lost items.`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.close();
  }
}

run();
