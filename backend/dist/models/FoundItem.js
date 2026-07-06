"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const FoundItemSchema = new mongoose_1.Schema({
    finder: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    brand: { type: String, default: '' },
    color: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    locationFound: { type: String, required: true },
    lastSeen: { type: String, trim: true, default: '' },
    dateFound: { type: Date, required: true },
    specialAppearance: { type: String, default: '' },
    additionalNotes: { type: String, default: '' },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'claimed', 'resolved', 'archived'], default: 'active' },
    lockedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', default: null },
    lockedUntil: { type: Date, default: null },
    adminResolved: { type: Boolean, default: false },
    linkedLostItem: { type: mongoose_1.Schema.Types.ObjectId, ref: 'LostItem' },
}, { timestamps: true });
// Create text index for search query support
FoundItemSchema.index({ itemName: 'text', description: 'text' });
// Compound index for categorized filters
FoundItemSchema.index({ category: 1, status: 1 });
exports.default = mongoose_1.default.model('FoundItem', FoundItemSchema);
