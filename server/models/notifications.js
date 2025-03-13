// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Recipient
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who triggered the notification
  type: { type: String, enum: ['like', 'comment'], required: true }, // Notification type
  message: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Related post (optional)
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);
