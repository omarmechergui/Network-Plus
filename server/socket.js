// socket.js
const { Server } = require('socket.io');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
let io;

async function findOrCreateConversation(senderId, receiverId) {
    // Ensure consistent order for participants array (e.g., sorted by their string values)
    const participants = [senderId, receiverId].sort();
  
    // Try to find an existing conversation with these participants
    let conversation = await Conversation.findOne({ participants });
    if (!conversation) {
      conversation = new Conversation({ participants });
      await conversation.save();
    }
    return conversation;
  }

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Handle WebSocket connection
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // Listen for `setUser` event to join a room
    socket.on('setUser', (userId) => {
      socket.join(userId); // Join the room with the userId
      console.log(`User ${userId} joined room ${userId}`);
    });
  
    socket.on('newMessage', async (data) => {
      try {
        const { senderId, receiverId, text } = data;
  
          // Find or create conversation
          const conversation = await findOrCreateConversation(senderId, receiverId);
  
        // Save the message to the database
        const newMessage = new Message({
          conversationId: conversation._id,
          senderId,
          receiverId,
          text, 
        });
        await newMessage.save();
  
         // Update conversation with last message and timestamp
         conversation.lastMessage = newMessage._id;
         conversation.updatedAt = Date.now();
         await conversation.save();
  
        // Emit the message to the receiver's room
        io.to(receiverId).emit('receiveMessage', {
          ...newMessage._doc,
          senderId: { _id: senderId },
        });
  
         // Optionally, you might also want to emit an event to update the conversation list for both users.
         io.to(senderId).emit('conversationUpdated', conversation);
         io.to(receiverId).emit('conversationUpdated', conversation); 
      } catch (error) {
        console.error(error);
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
