import mongoose from 'mongoose';
import User from '../models/User';
import Category from '../models/Category';
import LostItem from '../models/LostItem';
import FoundItem from '../models/FoundItem';
import Claim from '../models/Claim';
import CommunityPost from '../models/CommunityPost';

export const seedDatabase = async () => {
  try {
    // 1. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      await Category.insertMany([
        { name: 'Electronics', description: 'Phones, laptops, chargers, headphones' },
        { name: 'Accessories', description: 'Wallets, bags, keys, watches' },
        { name: 'Documents', description: 'IDs, notebooks, passports, folders' },
        { name: 'Clothing', description: 'Jackets, hats, scarves' }
      ]);
      console.log('Seeded categories');
    }

    // 2. Ensure each sample user exists by checking email individually
    const userSeedData = [
      {
        name: 'Kevin Sanders',
        studentId: 'SU-2024-0012',
        email: 'k.sanders@campus.edu',
        password: 'password123',
        role: 'user',
        status: 'active',
        xp: 2450,
        level: 12,
        isVerified: true
      },
      {
        name: 'Maya Rodriguez',
        studentId: 'SU-2024-0289',
        email: 'm.rodriguez@campus.edu',
        password: 'password123',
        role: 'user',
        status: 'active',
        xp: 1870,
        level: 9,
        isVerified: true
      },
      {
        name: 'Daniel Ford',
        studentId: 'SU-2023-4411',
        email: 'd.ford@campus.edu',
        password: 'password123',
        role: 'user',
        status: 'active',
        xp: 3200,
        level: 15,
        isVerified: true
      },
      {
        name: 'Sarah Thompson',
        studentId: 'SU-2024-1102',
        email: 's.thompson@campus.edu',
        password: 'password123',
        role: 'user',
        status: 'warned',
        xp: 980,
        level: 5,
        isVerified: true
      }
    ];

    for (const data of userSeedData) {
      const exists = await User.findOne({ email: data.email });
      if (!exists) {
        await User.create(data);
        console.log(`Seeded user: ${data.email}`);
      }
    }

    // Seeder only ensures users and categories exist. Claims and items are created by real user testing.
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
};
