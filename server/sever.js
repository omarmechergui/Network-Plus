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

// Security Hardening
app.disable('x-powered-by');

// Middleware
app.use(cors());
app.use(express.json());

// Determine Mongo URI from either MONGO_URI or DATABASE_URL
const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;

// Validate required environment configuration
const missingEnvVars = [];
if (!mongoUri) missingEnvVars.push('MONGO_URI or DATABASE_URL');
if (!process.env.JWT_SECRET) missingEnvVars.push('JWT_SECRET');

if (missingEnvVars.length > 0) {
  console.error(`FATAL: Missing required environment variable(s): ${missingEnvVars.join(', ')}`);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

// Connect to MongoDB
if (mongoUri && process.env.NODE_ENV !== 'test') {
  mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));
}

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationsroutes'));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Start the server
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = { app, server };
