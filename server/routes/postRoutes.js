// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const { getIo } = require('../socket'); // Use getIo() to get the instance
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const notifications = require('../models/notifications');


// Create Post
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { description, picture,tags } = req.body;
    const newPost = new Post({ userId: req.user.id, description, picture,tags });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('userId','username profilePicture').populate('likes','username profilePicture' ).populate('comments.userId','username profilePicture').sort('-createdAt');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/post/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(req.params.id)
      .populate('userId', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .populate('comments.userId', 'username profilePicture')
      .sort('-createdAt');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Like a post
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const userId = req.user.id;
    const user = await User.findById(userId);

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(userId);
    post.dislikes.pull(userId); // Remove from dislikes if exists
    await post.save();

    const postOwner = post.userId.toString();
    const io = getIo(); // Ensure io is fetched only when needed

    if (postOwner !== userId) {
      const newNotification = new notifications({
        userId: postOwner, // Post owner
        senderId: userId,    // Liker
        type: 'like',
        message: 'liked your post!',
        postId: postId,
      });
      await newNotification.save();
      io.to(postOwner).emit('notification', {
        type: 'like',
        message: `liked your post`,
        postId,
        user,
      });
      console.log(`Notification sent to ${postOwner}`);
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: error.message });
  }
});
// Dislike a Post
router.post('/:postId/dislike', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user has already disliked the post
    if (post.dislikes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Post already disliked' });
    }

    // Add user to dislikes array
    post.dislikes.push(req.user.id);

    // Remove user from likes array if they liked before
    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Comment on a post
router.post('/:postId/comment', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Comment exceeds maximum length of 2000 characters' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ userId, text: text.trim() });
    await post.save();

    const postOwner = post.userId.toString();
    const io = getIo(); // Ensure io is fetched only when needed

    // Send notification if commenter is not the post owner
    if (postOwner !== userId) {
      const newNotification = new notifications({
        userId: postOwner, // Post owner
        senderId: userId,    // Liker
        type: 'comment',
        message: 'commented on your post!',
        postId: postId,
      });
      await newNotification.save();
      io.to(postOwner).emit('notification', {
        type: 'comment',
        message: `commented on your post`,
        postId,
        user,
        comment: text.trim(),
      });
      console.log(`Notification sent to ${postOwner}`);
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Share a Post
router.post('/:postId/share', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const userId = req.user.id;

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Increment the shares count
    post.shares += 1;
    await post.save();

    res.status(200).json({ message: 'Post shared successfully', shares: post.shares });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id; // Extract the post ID from the URL parameters

    // Validate ObjectId before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ success: false, message: 'Invalid post ID' });
    }

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Verify that the authenticated user owns the post
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post',
      });
    }

    // Delete the post by ID
    const deletedPost = await Post.findByIdAndDelete(postId);

    // Return a success response matching existing format
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: deletedPost,
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    if (query.length > 100) {
      return res.status(400).json({ success: false, message: 'Search query too long' });
    }

    // Escape regex metacharacters to prevent ReDoS and regex injection attacks
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Perform a case-insensitive search on posts
    const postResults = await Post.find({
      $or: [
        { description: { $regex: escapedQuery, $options: 'i' } },
        { tags: { $regex: escapedQuery, $options: 'i' } },
        { 'comments.text': { $regex: escapedQuery, $options: 'i' } },
      ],
    }).populate('userId', 'username profilePicture');

    // Perform a case-insensitive search on users
    const userResults = await User.find({
      username: { $regex: escapedQuery, $options: 'i' },
    }).select('username profilePicture followers following');

    // Combine results into a single response
    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      posts: postResults,
      users: userResults,
    });
  } catch (error) {
    console.error('Error searching posts and users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;