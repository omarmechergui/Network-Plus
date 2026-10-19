// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Conversation = require('../models/Conversation');
const authMiddleware = require('../middleware/auth');
const nodemailer = require('nodemailer');
const multer = require('multer');
const Message = require('../models/Message');

// Helper to escape HTML characters for email templates
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to validate safe URLs (http/https only)
function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (trimmed === '') return true;
  return /^https?:\/\//i.test(trimmed);
}

// Request registration verification email
router.post('/validate_email', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }
    if (!username || typeof username !== 'string' || !username.trim()) {
      return res.status(400).json({ msg: 'Username is required' });
    }

    const found = await User.findOne({ email });
    if (found) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const existingUsername = await User.findOne({ username: username.trim() });
    if (existingUsername) {
      return res.status(400).json({ msg: 'Username is already taken' });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email service is not configured (missing EMAIL_USER or EMAIL_PASS)');
      return res.status(503).json({ msg: 'Email service is not configured' });
    }

    // Hash password BEFORE placing it into the verification token
    const hashedPassword = await bcrypt.hash(password, 10);

    const secretKey = process.env.JWT_SECRET;
    const token = jwt.sign(
      {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        username: username.trim(),
        type: 'email_verification',
      },
      secretKey,
      { expiresIn: '24h' }
    );

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const safeUsername = escapeHtml(username.trim());
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email.trim().toLowerCase(),
      subject: 'Email Verification',
      html: `
      <div>
        <div style='background-color: #d1d1d1; width: 99%; padding: 20px; font-family: sans-serif;'>
          <p>Hi <span id="username">${safeUsername}</span>,</p>
          <p>
            Thanks for signing up for Network Plus! To complete your registration,
            please verify your email address by clicking the link below:
          </p>
          <p>
            <a href="http://localhost:3000/verify/${token}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
              Verify Your Email
            </a>
          </p>
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't request this email, please ignore it.</p>
          <p>Best regards,</p>
          <p style='text-align: end'>Network Plus</p>
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: 'Verification email sent' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ msg: 'Failed to send email' });
  }
});

// Register User
router.post('/register/:token', async (req, res) => {
  try {
    const token = req.params.token;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(400).json({ message: 'Invalid or expired registration token' });
    }

    const { email, username, password } = decoded;
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Invalid registration token payload' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Use pre-hashed password from token or hash if plaintext (for backwards compatibility)
    const isAlreadyHashed = typeof password === 'string' && (password.startsWith('$2a$') || password.startsWith('$2b$'));
    const finalPassword = isAlreadyHashed ? password : await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, email, password: finalPassword });
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '20d' });

    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow a User
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (req.user.id.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) return res.status(404).json({ message: 'User not found' });

    // Check if already following
    if (currentUser.following.some((id) => id.toString() === userToFollow._id.toString())) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following and followers lists
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow a User
router.post('/:userId/unfollow', authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (req.user.id.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'Cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(targetUserId);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) return res.status(404).json({ message: 'User not found' });

    // Check if already not following
    if (!currentUser.following.some((id) => id.toString() === userToUnfollow._id.toString())) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove from following list
    currentUser.following.pull(userToUnfollow._id);
    userToUnfollow.followers.pull(currentUser._id);

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Forgot Password - Send Reset Email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    // Always return success response to prevent account enumeration
    if (!user) {
      return res.status(200).json({ message: 'If that email is registered, password reset instructions have been sent.' });
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const resetToken = jwt.sign({ id: user._id, type: 'password_reset' }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetLink = `http://localhost:3000/New_password?token=${resetToken}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your Network Plus account.</p>
            <p><a href="${resetLink}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
            <p>This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    }

    res.status(200).json({ message: 'If that email is registered, password reset instructions have been sent.' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Valid token and password (at least 6 characters) are required' });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (!decoded || !decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(400).json({ message: 'Invalid reset token payload' });
    }

    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Contacts
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following', '-password').select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const contacts = (user.following || []).map((contactUser) => ({
      _id: contactUser._id,
      username: contactUser.username,
      profilePicture: contactUser.profilePicture,
    }));
    res.status(200).json({ contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch Messages
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.id },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send Message
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: 'Invalid receiver ID' });
    }
    if (req.user.id.toString() === receiverId.toString()) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    // Find or create conversation
    const participants = [req.user.id.toString(), receiverId.toString()].sort();
    let conversation = await Conversation.findOne({ participants });
    if (!conversation) {
      conversation = new Conversation({ participants });
      await conversation.save();
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId: req.user.id,
      receiverId,
      text: text.trim(),
    });
    await newMessage.save();

    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = Date.now();
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to fetch user and their posts
router.get('/getuser', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ userId: req.user.id });
    res.status(200).json({ user, posts });
  } catch (error) {
    console.error('Error in getuser:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all users
router.get('/getusers', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error in getusers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get user profile
router.get('/profile/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const posts = await Post.find({ userId: req.params.id });
    res.status(200).json({ user, posts });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Update user profile
router.put('/updateprofile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, bio, bioLink, profilePicture } = req.body;

    // Validate bioLink against javascript:/data: protocol injection (XSS)
    if (bioLink !== undefined && bioLink !== null && bioLink !== '') {
      if (!isValidUrl(bioLink)) {
        return res.status(400).json({ success: false, message: 'Invalid bioLink format. Only http:// and https:// URLs are allowed.' });
      }
    }

    // If username is changing, ensure it is not taken by another user
    if (username && typeof username === 'string') {
      const existingUser = await User.findOne({ username: username.trim(), _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
    }

    const updateFields = {};
    if (username && typeof username === 'string') updateFields.username = username.trim();
    if (bio !== undefined) updateFields.bio = typeof bio === 'string' ? bio : '';
    if (bioLink !== undefined) updateFields.bioLink = typeof bioLink === 'string' ? bioLink.trim() : '';
    if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;

    // Update user data in the database and exclude password
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;