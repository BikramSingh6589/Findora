"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendChatMessage = exports.getChatMessages = void 0;
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
const response_1 = require("../utils/response");
const getChatMessages = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const messages = await ChatMessage_1.default.find({ itemId })
            .populate('sender', 'name profilePic role')
            .sort({ createdAt: 1 });
        (0, response_1.sendSuccess)(res, { messages }, 'Chat messages retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getChatMessages = getChatMessages;
const sendChatMessage = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { content, type } = req.body;
        if (!content) {
            (0, response_1.sendError)(res, 'Message content is required', 400);
            return;
        }
        const message = await ChatMessage_1.default.create({
            itemId,
            sender: req.user._id,
            content,
            type: type || 'text'
        });
        const populated = await ChatMessage_1.default.findById(message._id)
            .populate('sender', 'name profilePic role');
        (0, response_1.sendSuccess)(res, { message: populated }, 'Message sent successfully', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.sendChatMessage = sendChatMessage;
