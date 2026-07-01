import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async (): Promise<void> => {
  try {
    // Set DNS servers to Google DNS to bypass local querySrv resolution failures
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/lostandfound';
    console.log(`Connecting to MongoDB at: ${connStr.replace(/:([^@]+)@/, ':****@')}`);
    // Mongoose connect without deprecated options in newer drivers
    await mongoose.connect(connStr);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
