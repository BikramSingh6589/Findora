"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const createNotification = async (recipientId, type, title, message, relatedItemId) => {
    try {
        const notif = await Notification_1.default.create({
            recipient: recipientId,
            type,
            title,
            message,
            relatedItemId: relatedItemId || null,
        });
        console.log(`Notification Service: Notification created for user ${recipientId}: "${title}"`);
        return notif;
    }
    catch (error) {
        console.error('Notification Service Error:', error);
        return null;
    }
};
exports.createNotification = createNotification;
