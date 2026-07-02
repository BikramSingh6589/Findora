"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dns_1 = __importDefault(require("dns"));
const User_1 = __importDefault(require("../models/User"));
const seeder_1 = require("../utils/seeder");
const connectDB = async () => {
    try {
        // Set DNS servers to Google DNS to bypass local querySrv resolution failures
        dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
        const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/lostandfound';
        console.log(`Connecting to MongoDB at: ${connStr.replace(/:([^@]+)@/, ':****@')}`);
        // Mongoose connect without deprecated options in newer drivers
        await mongoose_1.default.connect(connStr);
        console.log('MongoDB connected successfully');
        // Auto-seed default admin user if none exists
        const adminExists = await User_1.default.findOne({ role: 'admin' });
        if (!adminExists) {
            await User_1.default.create({
                name: 'System Admin',
                email: 'admin@university.edu',
                password: 'adminpassword',
                role: 'admin',
                isVerified: true,
            });
            console.log('Seeded default admin user: admin@university.edu / adminpassword');
        }
        // Seed sample database collections (items, claims, community posts)
        await (0, seeder_1.seedDatabase)();
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
    }
};
exports.connectDB = connectDB;
