// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Required for Socket.IO
const { initializeSocket } = require('./socket'); // Import socket initialization
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(err));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications',require('./routes/notificationsroutes'))


// Create HTTP server
const server = http.createServer(app);


// Initialize Socket.IO
initializeSocket(server); // Initialize after creating the server
// Helper function to find or create a conversation between two users





// Start the server

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
