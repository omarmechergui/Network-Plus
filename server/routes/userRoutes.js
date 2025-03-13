// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post=require("../models/Post")
const authMiddleware = require('../middleware/auth');
const nodemailer = require('nodemailer');
const multer = require('multer');
const Message = require('../models/Message');


// valid email
router.post('/validate_email', async (req, res) => {
  console.log(req.body);
  try {
    const fond = await User.findOne({ email: req.body.email });
    if (fond) {
      res.status(400).send({ msg: "user already exist" });
    }
    else {
      const secretky = process.env.JWT_SECRET
      const token = jwt.sign({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username
      }, secretky);
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "oo2377107@gmail.com", pass: "cnee pzqq yafd wvha"
        }
      })
      const mailOptions = {
        from: "oo2377107@gmail.com",
        to: req.body.email,
        subject: "Email Verification",
        html: `
        <div>
        <div style=' background-color: #d1d1d1; width: 99% '>
  <form id="form_verif_emil" action="">
    <p>
      Hi <span id="username">${req.body.username}</span>,
    </p>
    <p>
      Thanks for signing up for Network Plus! To complete your registration,
      please verify your email address by clicking the link below:
    </p>
    <a href="http://localhost:3000/verify/${token}"><input type="submit" defaultValue="Verify Your Email" /></a>
    
    <p>If you didn't request this email, please ignore it.</p>
    <p>Best regards,</p>
    <p style='text-align: end' >Network Plus</p>
  </form>
</div>

    </div>
        `
      }
      await transporter.sendMail(mailOptions, (error) => {
        if (error) throw error;
      })
      res.status(200).send({ msg: "verification email sent" });
    }
  } catch (error) {
    res.status(500).send({ msg: "failed to send email" })
  }
})

// Register User
router.post('/register/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const { email, username, password } = jwt.verify(token, process.env.JWT_SECRET);
 
   

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '20d' });

    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Follow a User
router.post('/:userId/follow', authMiddleware, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ message: 'User not found' });

    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following list
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(currentUser._id);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unfollow a User
router.post('/:userId/unfollow', authMiddleware, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) return res.status(404).json({ message: 'User not found' });

    // Check if already not following
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    // Remove from following list
    currentUser.following.pull(userToUnfollow._id);
    userToUnfollow.followers.pull(currentUser._id);

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// routes/userRoutes.js
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(400).json({ message: 'Invalid reset token' });
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
    res.status(500).json({ message: error.message });
  }
});
//Fetch Contacts
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following');
    const contacts = user.following.map((user) => ({
      _id: user._id,
      username: user.username,
      profilePicture: user.profilePicture,
    }));
    res.status(200).json({ contacts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Fetch Messages
router.get('/conversation/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.id },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Send Message

router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const newMessage = new Message({
      senderId: req.user.id,
      receiverId,
      text,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// // routes/profileRoutes.js
// router.get('/profile', authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).populate('posts'); // Replace with actual query logic
//     if (!user) return res.status(404).json({ message: 'User not found.' });

//     const posts = await Post.find({ userId: req.user.id }); // Fetch user's posts

//     res.status(200).json({ user, posts });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// routes/profileRoutes.js

// Helper function to fetch user and their posts
router.get("/getuser",authMiddleware,  async (req, res) => {
  try {
    // Fetch the user and populate their posts
    const user =  await User.findById(req.user.id)

    // Fetch the user's posts (optional: you can also use the populated 'posts' field)
    const posts = await Post.find({ userId: req.user.id });

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// fetch get users
router.get("/getusers",authMiddleware,  async (req, res) => {
  try {
    // Fetch the user and populate their posts
    const users =  await User.find()
    // Fetch the user's posts (optional: you can also use the populated 'posts' field)
   

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Route to get user profile
router.get('/profile/:id', authMiddleware, async (req, res) => {
  try {
    // Call the getUser function with the authenticated user's ID
    const user = await User.findById(req.params.id);
    const posts = await Post.find({ userId: req.params.id })
    // Respond with the user and their posts
    res.status(200).json({ user,posts });
  } catch (error) {
    // Handle errors and respond with appropriate status codes
    if (error.message === 'User not found.') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
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
router.put('/updateprofile', authMiddleware,  async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have user authentication middleware
    const { username, bio, bioLink, profilePicture } = req.body;
    console.log(req.body)
    
   

    // Update user data in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        bio,
        bioLink,
        profilePicture
      },
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;