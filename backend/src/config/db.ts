import mongoose from 'mongoose';
import dns from 'dns';
import User from '../models/User';
import { seedDatabase } from '../utils/seeder';

export const connectDB = async (): Promise<void> => {
  try {
    // Set DNS servers to Google DNS to bypass local querySrv resolution failures
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/lostandfound';
    console.log(`Connecting to MongoDB at: ${connStr.replace(/:([^@]+)@/, ':****@')}`);
    // Mongoose connect without deprecated options in newer drivers
    await mongoose.connect(connStr);
    console.log('MongoDB connected successfully');

    // Auto-seed default admin user if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@university.edu',
        password: 'adminpassword',
        role: 'admin',
        isVerified: true,
      });
      console.log('Seeded default admin user: admin@university.edu / adminpassword');
    }

    // Seed sample database collections (items, claims, community posts)
    await seedDatabase();
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
