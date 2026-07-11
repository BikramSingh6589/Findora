import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Claim from './src/models/Claim';
import FoundItem from './src/models/FoundItem';

dotenv.config();

const resetClaims = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to DB. Deleting all claims...');
    
    await Claim.deleteMany({});
    console.log('All claims deleted.');
    
    await FoundItem.updateMany({}, { status: 'available' });
    console.log('All FoundItems set to available status.');
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

resetClaims();
