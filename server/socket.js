// socket.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
let io;

async function findOrCreateConversation(senderId, receiverId) {
  // Ensure consistent order for participants array
  const participants = [senderId, receiverId].sort();

  // Try to find an existing conversation with these participants
  let conversation = await Conversation.findOne({ participants });
  if (!conversation) {
    conversation = new Conversation({ participants });
    await conversation.save();
  }
  return conversation;
}

function verifyToken(token) {
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket.IO handshake authentication middleware (optional token)
  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      (socket.handshake.headers?.authorization?.startsWith('Bearer ')
        ? socket.handshake.headers.authorization.split(' ')[1]
        : null);

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        socket.user = decoded;
      }
    }
    next();
  });

  // Handle WebSocket connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for `setUser` event to join a room
    // Supports token in payload or established socket.user
    socket.on('setUser', (data) => {
      let authenticatedUserId = null;

      if (typeof data === 'object' && data !== null) {
        if (data.token) {
          const decoded = verifyToken(data.token);
          if (decoded && decoded.id) {
            socket.user = decoded;
            authenticatedUserId = decoded.id.toString();
          }
        } else if (socket.user && socket.user.id) {
          if (!data.userId || data.userId.toString() === socket.user.id.toString()) {
            authenticatedUserId = socket.user.id.toString();
          }
        }
      } else if (typeof data === 'string') {
        // Check if string is a JWT token
        if (data.split('.').length === 3) {
          const decoded = verifyToken(data);
          if (decoded && decoded.id) {
            socket.user = decoded;
            authenticatedUserId = decoded.id.toString();
          }
        } else if (socket.user && socket.user.id && data === socket.user.id.toString()) {
          authenticatedUserId = socket.user.id.toString();
        }
      }

      if (authenticatedUserId) {
        socket.join(authenticatedUserId);
        console.log(`User ${authenticatedUserId} joined room ${authenticatedUserId}`);
      } else {
        console.warn(`Unauthorized setUser attempt rejected on socket ${socket.id}`);
        socket.emit('auth_error', { message: 'Authentication required to join user room' });
      }
    });

    socket.on('newMessage', async (data) => {
      try {
        if (!data || typeof data !== 'object') {
          return socket.emit('error', { message: 'Invalid message payload' });
        }

        // Validate socket authentication
        const senderId = socket.user?.id;
        if (!senderId) {
          return socket.emit('auth_error', { message: 'Authentication required to send messages' });
        }

        const { receiverId, text } = data;

        // Validate IDs and text content
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
          return socket.emit('error', { message: 'Invalid receiver ID' });
        }
        if (senderId.toString() === receiverId.toString()) {
          return socket.emit('error', { message: 'Cannot send message to yourself' });
        }
        if (!text || typeof text !== 'string' || !text.trim()) {
          return socket.emit('error', { message: 'Message text cannot be empty' });
        }
        if (text.length > 5000) {
          return socket.emit('error', { message: 'Message exceeds maximum length' });
        }

        // Find or create conversation
        const conversation = await findOrCreateConversation(senderId.toString(), receiverId.toString());

        // Save the message to the database with enforced senderId
        const newMessage = new Message({
          conversationId: conversation._id,
          senderId,
          receiverId,
          text: text.trim(),
        });
        await newMessage.save();

        // Update conversation with last message and timestamp
        conversation.lastMessage = newMessage._id;
        conversation.updatedAt = Date.now();
        await conversation.save();

        // Emit the message to the receiver's room
        io.to(receiverId.toString()).emit('receiveMessage', {
          ...newMessage._doc,
          senderId: { _id: senderId },
        });

        // Emit event to update conversation list for both users
        io.to(senderId.toString()).emit('conversationUpdated', conversation);
        io.to(receiverId.toString()).emit('conversationUpdated', conversation);
      } catch (error) {
        console.error('Socket newMessage error:', error);
      }
    });

    // Listen for user disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = { initializeSocket, getIo };
