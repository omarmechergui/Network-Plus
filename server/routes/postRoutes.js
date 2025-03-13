// routes/postRoutes.js
const express = require('express');
const router = express.Router();
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
    const posts = await Post.findById(req.params.id).populate('userId','username profilePicture').populate('likes','username profilePicture' ).populate('comments.userId','username profilePicture').sort('-createdAt');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Like a post
router.post('/:postId/like', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
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
    const post = await Post.findById(req.params.postId);
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
    const { text } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ userId, text });
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
        comment: text,
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
    const userId = req.user.id;

    // Find the post by ID
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Increment the shares count
    post.shares += 1;
    await post.save();

    // Optionally, create a notification for the original poster
    const originalPoster = await User.findById(post.userId);
    if (originalPoster) {
      // Add logic to notify the original poster (e.g., via email or database)
      console.log(`User ${userId} shared your post!`);
    }

    res.status(200).json({ message: 'Post shared successfully', shares: post.shares });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.delete('/:id',authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id; // Extract the post ID from the URL parameters

    // Optional: Add authentication middleware to verify the user
    // Ensure the user is authorized to delete the post (e.g., they own the post)

    // Find and delete the post by ID
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      // If no post is found with the given ID
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Return a success response
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: deletedPost,
    });
  } catch (error) {
    // Handle errors (e.g., database connection issues)
    console.error('Error deleting post:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/search', async (req, res) => {
  console.log(req.body)
  try {
    const { query } = req.body; // Extract the search query from the URL parameters

    if (!query || query.trim() === '') {
      // If no query is provided, return an empty result
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    // Perform a case-insensitive search on posts
    const postResults = await Post.find({
      $or: [
        { description: { $regex: query, $options: 'i' } }, // Search in description
        { tags: { $regex: query, $options: 'i' } }, // Search in tags
        { 'comments.text': { $regex: query, $options: 'i' } }, // Search in comments
      ],
    }).populate('userId', 'username profilePicture'); // Populate user details for posts

    // Perform a case-insensitive search on users
    const userResults = await User.find({
      username: { $regex: query, $options: 'i' }, // Search in username
    }).select('username profilePicture followers following'); // Select only relevant fields

    // Combine results into a single response
    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      
        posts: postResults,
        users: userResults,
      
    });
  } catch (error) {
    // Handle errors (e.g., database connection issues)
    console.error('Error searching posts and users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
module.exports = router;