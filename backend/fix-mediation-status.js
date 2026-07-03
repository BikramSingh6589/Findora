const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.collection('claims');

  // Fix approved claims where mediationStatus is still 'pending'
  const r1 = await db.updateMany(
    { status: 'approved', mediationStatus: 'pending' },
    { $set: { mediationStatus: 'approved' } }
  );
  console.log('Fixed approved claims:', r1.modifiedCount);

  // Fix rejected claims where mediationStatus is still 'pending'
  const r2 = await db.updateMany(
    { status: 'rejected', mediationStatus: 'pending' },
    { $set: { mediationStatus: 'rejected' } }
  );
  console.log('Fixed rejected claims:', r2.modifiedCount);

  process.exit(0);
}).catch(e => {
  console.error('DB error:', e.message);
  process.exit(1);
});
