"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const response_1 = require("../utils/response");
const getNotifications = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const query = { recipient: req.user._id };
        if (req.query.read === 'false') {
            query.read = false;
        }
        const notifications = await Notification_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Notification_1.default.countDocuments(query);
        (0, response_1.sendSuccess)(res, { notifications, total, page }, 'Notifications retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const notif = await Notification_1.default.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true }, { new: true });
        if (!notif) {
            (0, response_1.sendError)(res, 'Notification not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, { notification: notif }, 'Notification marked as read');
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res, next) => {
    try {
        await Notification_1.default.updateMany({ recipient: req.user._id, read: false }, { read: true });
        (0, response_1.sendSuccess)(res, {}, 'All notifications marked as read');
    }
    catch (error) {
        next(error);
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res, next) => {
    try {
        const notif = await Notification_1.default.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user._id
        });
        if (!notif) {
            (0, response_1.sendError)(res, 'Notification not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, {}, 'Notification deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteNotification = deleteNotification;
