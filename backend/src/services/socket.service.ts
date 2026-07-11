import { Server, Socket } from 'socket.io';
import { createServer } from 'http';
import { verifyToken } from '../utils/jwt';
import Claim from '../models/Claim';
import ChatMessage from '../models/ChatMessage';

let io: Server;

export const initSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // JWT authentication middleware for Socket.IO connections
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new Error('Invalid or expired token'));
    }

    socket.data.user = decoded; // Contains userId and role
    next();
  });

  io.on('connection', (socket: Socket) => {
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
        const claim = await Claim.findById(claimId).populate('foundItemId');
        if (!claim) {
          socket.emit('error_message', 'Claim not found');
          return;
        }

        const finderId = (claim.foundItemId as any)?.finder?.toString();
        const claimantId = claim.claimant?.toString();

        // Check if the current user is authorized (claimant, finder, or admin)
        const isClaimant = claimantId === userId;
        const isFinder = finderId === userId;
        const isAdmin = userRole === 'admin';

        if (!isClaimant && !isFinder && !isAdmin) {
          socket.emit('error_message', 'Not authorized to join this room');
          return;
        }

        // Block conflict claimants from establishing a socket chat room
        // Conflicts are handled exclusively by admin — no direct user-to-user chat
        if ((claim as any).isConflictClaim && !isAdmin) {
          socket.emit('conflict_chat_blocked', {
            message: 'This conflict is being handled by the admin. No direct chat is allowed between parties.'
          });
          return;
        }

        // Block resolved claims from joining (chat is frozen)
        if (claim.status === 'resolved' && !isAdmin) {
          socket.emit('chat_frozen', {
            message: 'This claim has been resolved. The chat is now closed.',
            status: 'resolved'
          });
          // Still join the room so they can see message history, but cannot send
          socket.join(`claim:${claimId}`);
          const messages = await ChatMessage.find({ claimId })
            .populate('sender', 'name profilePic')
            .sort({ createdAt: 1 })
            .exec();
          socket.emit('message_history', messages);
          return;
        }

        const roomName = `claim:${claimId}`;
        socket.join(roomName);

        // Fetch chat history
        const messages = await ChatMessage.find({ claimId })
          .populate('sender', 'name profilePic')
          .sort({ createdAt: 1 })
          .exec();

        socket.emit('message_history', messages);
      } catch (err: any) {
        console.error(err);
        socket.emit('error_message', 'Failed to join chat room');
      }
    });

    // Handle incoming messages
    socket.on('send_message', async ({ claimId, content }) => {
      try {
        const claim = await Claim.findById(claimId).populate('foundItemId');
        if (!claim) {
          socket.emit('error_message', 'Claim not found');
          return;
        }

        const finderId = (claim.foundItemId as any)?.finder?.toString();
        const claimantId = claim.claimant?.toString();

        const isClaimant = claimantId === userId;
        const isFinder = finderId === userId;
        const isAdmin = userRole === 'admin';

        if (!isClaimant && !isFinder && !isAdmin) {
          socket.emit('error_message', 'Not authorized to send messages in this room');
          return;
        }

        // Block conflict claims from sending messages
        if ((claim as any).isConflictClaim && userRole !== 'admin') {
          socket.emit('error_message', 'Conflict claims are handled by admin. No direct chat allowed.');
          return;
        }

        // Freeze chat for resolved or admin-approved claims
        if (claim.status === 'resolved') {
          socket.emit('error_message', 'Chat is closed. This claim has been resolved.');
          return;
        }
        if (claim.mediationStatus === 'approved') {
          socket.emit('error_message', 'Chat is frozen. Admin has made a decision on this claim.');
          return;
        }

        // Create and persist the message
        const message = await ChatMessage.create({
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
          await createNotification(
            recipientId,
            'new_message',
            'New Message',
            `You have a new message from ${(populatedMessage.sender as any).name}`,
            undefined,
            claimId
          );
        }
      } catch (err: any) {
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

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};
