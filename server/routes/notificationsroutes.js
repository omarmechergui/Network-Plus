// routes/notificationRoutes.js
const express = require('express');
const Notification = require('../models/notifications');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get notifications for a user
router.get('/',authMiddleware, async (req, res) => {
  try {
    console.log(req.user)
    const userId = req.user.id; // Assuming you're using auth middleware
    const notifications = await Notification.find({ userId })
      .populate('senderId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId }, { isRead: true });

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating notifications' });
  }
});

module.exports = router;
