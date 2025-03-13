const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  updatedAt: { type: Date, default: Date.now },
});

// Create an index to ensure uniqueness for a conversation between two users.
// You can either enforce an order or use a sorted array of participant IDs.
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
