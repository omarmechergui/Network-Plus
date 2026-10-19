const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const authMiddleware = require('../middleware/auth');

// Mark Messages as Read
router.post('/mark-as-read/:userId', authMiddleware, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Update all unread messages from the other user to the current user as "read"
    await Message.updateMany(
      { senderId: otherUserId, receiverId: req.user.id, readAt: { $exists: false } },
      { $set: { readAt: new Date() } }
    );

    res.status(200).json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/conversation/:userId/:friendId
router.get('/conversation/:userId/:friendId', authMiddleware, async (req, res) => {
  const { userId, friendId } = req.params;

  // Validate ObjectIds before querying database
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  // Verify that the authenticated user is a participant in the requested conversation
  if (req.user.id !== userId && req.user.id !== friendId) {
    return res.status(403).json({ error: 'Unauthorized to view this conversation' });
  }

  try {
    // Find the conversation between these two users.
    // Ensure the participants are in a consistent order.
    const participants = [userId, friendId].sort();
    const conversation = await Conversation.findOne({ participants });
    if (!conversation) {
      return res.json([]);
    }
    // Get messages belonging to this conversation, sorted by creation date
    const messages = await Message.find({ conversationId: conversation._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;