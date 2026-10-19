// routes/notificationRoutes.js
const express = require('express');
const Notification = require('../models/notifications');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get notifications for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ userId })
      .populate('senderId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ userId }, { isRead: true });

    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Error updating notifications' });
  }
});

module.exports = router;
