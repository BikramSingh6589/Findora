"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../utils/jwt");
const Claim_1 = __importDefault(require("../models/Claim"));
const ChatMessage_1 = __importDefault(require("../models/ChatMessage"));
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    // JWT authentication middleware for Socket.IO connections
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('Authentication token required'));
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        if (!decoded) {
            return next(new Error('Invalid or expired token'));
        }
        socket.data.user = decoded; // Contains userId and role
        next();
    });
    io.on('connection', (socket) => {
        const userId = socket.data.user.userId;
        const userRole = socket.data.user.role;
        // Enforce 24-hour socket connection lifetime limit
        const lifespanTimeout = setTimeout(() => {
            socket.disconnect(true);
        }, 24 * 60 * 60 * 1000);
        socket.on('disconnect', () => {
            clearTimeout(lifespanTimeout);
        });
        // Join personal user room for notifications
        socket.on('join_user', () => {
            const userRoom = `user:${userId}`;
            socket.join(userRoom);
            console.log(`Socket: User ${userId} joined room ${userRoom}`);
        });
        // Join a claim chat room
        socket.on('join_room', async ({ claimId }) => {
            try {
                const claim = await Claim_1.default.findById(claimId).populate('foundItemId');
                if (!claim) {
                    socket.emit('error_message', 'Claim not found');
                    return;
                }
                const finderId = claim.foundItemId?.finder?.toString();
                const claimantId = claim.claimant?.toString();
                // Check if the current user is authorized (claimant, finder, or admin)
                const isClaimant = claimantId === userId;
                const isFinder = finderId === userId;
                const isAdmin = userRole === 'admin';
                if (!isClaimant && !isFinder && !isAdmin) {
                    socket.emit('error_message', 'Not authorized to join this room');
                    return;
                }
                const roomName = `claim:${claimId}`;
                socket.join(roomName);
                // Fetch chat history
                const messages = await ChatMessage_1.default.find({ claimId })
                    .populate('sender', 'name profilePic')
                    .sort({ createdAt: 1 })
                    .exec();
                socket.emit('message_history', messages);
            }
            catch (err) {
                console.error(err);
                socket.emit('error_message', 'Failed to join chat room');
            }
        });
        // Handle incoming messages
        socket.on('send_message', async ({ claimId, content }) => {
            try {
                const claim = await Claim_1.default.findById(claimId).populate('foundItemId');
                if (!claim) {
                    socket.emit('error_message', 'Claim not found');
                    return;
                }
                const finderId = claim.foundItemId?.finder?.toString();
                const claimantId = claim.claimant?.toString();
                const isClaimant = claimantId === userId;
                const isFinder = finderId === userId;
                const isAdmin = userRole === 'admin';
                if (!isClaimant && !isFinder && !isAdmin) {
                    socket.emit('error_message', 'Not authorized to send messages in this room');
                    return;
                }
                // Freeze chat if claim is resolved or frozen by active/approved mediation
                if (claim.status === 'resolved') {
                    socket.emit('error_message', 'Chat is closed because the claim is resolved.');
                    return;
                }
                if (claim.mediationStatus === 'approved') {
                    socket.emit('error_message', 'Chat is frozen due to admin mediation resolution.');
                    return;
                }
                // Create and persist the message
                const message = await ChatMessage_1.default.create({
                    claimId,
                    sender: userId,
                    content
                });
                const populatedMessage = await message.populate('sender', 'name profilePic');
                io.to(`claim:${claimId}`).emit('receive_message', populatedMessage);
                // Send a notification to the recipient
                const recipientId = isClaimant ? finderId : claimantId;
                if (recipientId) {
                    const { createNotification } = require('./notification.service');
                    await createNotification(recipientId, 'new_message', 'New Message', `You have a new message from ${populatedMessage.sender.name}`, undefined, claimId);
                }
            }
            catch (err) {
                console.error(err);
                socket.emit('error_message', 'Failed to send message');
            }
        });
        // Handle typing indicators
        socket.on('typing', ({ claimId, isTyping }) => {
            socket.to(`claim:${claimId}`).emit('user_typing', { userId, isTyping });
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};
exports.getIO = getIO;
