"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./models/User"));
const LostItem_1 = __importDefault(require("./models/LostItem"));
const FoundItem_1 = __importDefault(require("./models/FoundItem"));
const Claim_1 = __importDefault(require("./models/Claim"));
const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/lostandfound';
async function check() {
    await mongoose_1.default.connect(connStr);
    console.log('DB Connected');
    const userCount = await User_1.default.countDocuments();
    const lostCount = await LostItem_1.default.countDocuments();
    const foundCount = await FoundItem_1.default.countDocuments();
    const claimCount = await Claim_1.default.countDocuments();
    console.log('Users:', userCount);
    console.log('LostItems:', lostCount);
    console.log('FoundItems:', foundCount);
    console.log('Claims:', claimCount);
    if (claimCount > 0) {
        const claims = await Claim_1.default.find()
            .populate('foundItemId')
            .populate('claimant')
            .limit(5);
        console.log('Sample claims:', JSON.stringify(claims, null, 2));
    }
    await mongoose_1.default.connection.close();
}
check().catch(console.error);
