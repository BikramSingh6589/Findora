"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const socket_service_1 = require("./socket.service");
const createNotification = async (recipientId, type, title, message, relatedItemId, relatedClaimId) => {
    try {
        const notif = await Notification_1.default.create({
            recipient: recipientId,
            type,
            title,
            message,
            relatedItemId: relatedItemId || null,
            relatedClaimId: relatedClaimId || null,
        });
        console.log(`Notification Service: Notification created for user ${recipientId}: "${title}"`);
        // Emit real-time notification to the user's personal room
        try {
            const io = (0, socket_service_1.getIO)();
            io.to(`user:${recipientId}`).emit('new_notification', notif);
        }
        catch (socketError) {
            console.warn('Notification Service: Could not emit socket event', socketError);
        }
        return notif;
    }
    catch (error) {
        console.error('Notification Service Error:', error);
        return null;
    }
};
exports.createNotification = createNotification;
