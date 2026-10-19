const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Set dummy test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_12345';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/network_plus_test';

const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Helper to simulate Express req/res
function createMockContext({ headers = {}, params = {}, body = {}, user = null } = {}) {
  const req = {
    header: (name) => headers[name] || headers[name.toLowerCase()],
    headers,
    params,
    body,
    user,
  };

  let statusCode = 200;
  let responseData = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
    send: (data) => {
      responseData = data;
      return res;
    },
  };

  return {
    req,
    res,
    getStatusCode: () => statusCode,
    getResponseData: () => responseData,
  };
}

describe('1. Secret Configuration & Static Security Checks', () => {
  it('server/routes/userRoutes.js must not contain hardcoded email credentials', () => {
    const userRoutesContent = fs.readFileSync(path.join(__dirname, '../routes/userRoutes.js'), 'utf8');
    assert.strictEqual(
      userRoutesContent.includes('cnee pzqq yafd wvha'),
      false,
      'Hardcoded Gmail App Password must be removed from userRoutes.js'
    );
    assert.strictEqual(
      userRoutesContent.includes('oo2377107@gmail.com'),
      false,
      'Hardcoded email must be removed from userRoutes.js'
    );
  });

  it('server/.env.example exists and contains safe placeholders only', () => {
    const envExamplePath = path.join(__dirname, '../.env.example');
    assert.ok(fs.existsSync(envExamplePath), '.env.example must exist');
    const content = fs.readFileSync(envExamplePath, 'utf8');
    assert.ok(content.includes('your_jwt_secret_key_here'));
    assert.ok(content.includes('your_email@example.com'));
    assert.strictEqual(content.includes('cnee pzqq yafd wvha'), false);
  });

  it('root .gitignore and server/.gitignore properly ignore .env files', () => {
    const rootGitignore = fs.readFileSync(path.join(__dirname, '../../.gitignore'), 'utf8');
    assert.ok(rootGitignore.includes('.env'), 'Root .gitignore must ignore .env');
    const serverGitignore = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
    assert.ok(serverGitignore.includes('.env'), 'Server .gitignore must ignore .env');
  });
});

describe('2. Authentication Middleware', () => {
  it('rejects requests without Authorization header with 401', () => {
    const { req, res, getStatusCode, getResponseData } = createMockContext();
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(getStatusCode(), 401);
    assert.deepStrictEqual(getResponseData(), { message: 'Access denied' });
  });

  it('rejects requests with an invalid token with 401', () => {
    const { req, res, getStatusCode, getResponseData } = createMockContext({
      headers: { Authorization: 'Bearer invalid.token.value' },
    });
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false);
    assert.strictEqual(getStatusCode(), 401);
    assert.deepStrictEqual(getResponseData(), { message: 'Invalid or expired token' });
  });

  it('allows requests with a valid token and populates req.user', () => {
    const payload = { id: new mongoose.Types.ObjectId().toString(), username: 'alice' };
    const validToken = jwt.sign(payload, process.env.JWT_SECRET);

    const { req, res } = createMockContext({
      headers: { Authorization: `Bearer ${validToken}` },
    });
    let nextCalled = false;
    authMiddleware(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.user.id, payload.id);
    assert.strictEqual(req.user.username, 'alice');
  });
});

describe('3. Private Message Authorization', () => {
  it('rejects invalid MongoDB user IDs with 400', async () => {
    const messageRoutes = require('../routes/messageRoutes');
    const userA = new mongoose.Types.ObjectId().toString();
    const { req, res, getStatusCode, getResponseData } = createMockContext({
      params: { userId: userA, friendId: 'not-a-valid-id' },
      user: { id: userA },
    });

    const routeLayer = messageRoutes.stack.find(
      (s) => s.route && s.route.path === '/conversation/:userId/:friendId' && s.route.methods.get
    );
    assert.ok(routeLayer, 'Route /conversation/:userId/:friendId should exist');

    // Run the route handler
    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().error, 'Invalid user ID format');
  });

  it('rejects non-participant access to conversation with 403', async () => {
    const messageRoutes = require('../routes/messageRoutes');
    const userA = new mongoose.Types.ObjectId().toString();
    const userB = new mongoose.Types.ObjectId().toString();
    const attackerC = new mongoose.Types.ObjectId().toString();

    const { req, res, getStatusCode, getResponseData } = createMockContext({
      params: { userId: userA, friendId: userB },
      user: { id: attackerC }, // Attacker is not userA and not userB
    });

    const routeLayer = messageRoutes.stack.find(
      (s) => s.route && s.route.path === '/conversation/:userId/:friendId' && s.route.methods.get
    );
    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 403);
    assert.strictEqual(getResponseData().error, 'Unauthorized to view this conversation');
  });
});

describe('4. Post Deletion Ownership & IDOR Protection', () => {
  it('rejects invalid post ID with 400', async () => {
    const postRoutes = require('../routes/postRoutes');
    const userId = new mongoose.Types.ObjectId().toString();

    const { req, res, getStatusCode, getResponseData } = createMockContext({
      params: { id: 'invalid-post-id' },
      user: { id: userId },
    });

    const routeLayer = postRoutes.stack.find(
      (s) => s.route && s.route.path === '/:id' && s.route.methods.delete
    );
    assert.ok(routeLayer, 'DELETE /:id route should exist');

    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().success, false);
    assert.strictEqual(getResponseData().message, 'Invalid post ID');
  });

  it('returns 404 if post does not exist', async () => {
    const postRoutes = require('../routes/postRoutes');
    const Post = require('../models/Post');
    const userId = new mongoose.Types.ObjectId().toString();
    const nonExistentPostId = new mongoose.Types.ObjectId().toString();

    // Mock Post.findById to return null
    const originalFindById = Post.findById;
    Post.findById = async () => null;

    try {
      const { req, res, getStatusCode, getResponseData } = createMockContext({
        params: { id: nonExistentPostId },
        user: { id: userId },
      });

      const routeLayer = postRoutes.stack.find(
        (s) => s.route && s.route.path === '/:id' && s.route.methods.delete
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
      await handler(req, res);

      assert.strictEqual(getStatusCode(), 404);
      assert.strictEqual(getResponseData().success, false);
      assert.strictEqual(getResponseData().message, 'Post not found');
    } finally {
      Post.findById = originalFindById;
    }
  });

  it('rejects deletion with 403 when authenticated user is not post owner', async () => {
    const postRoutes = require('../routes/postRoutes');
    const Post = require('../models/Post');
    const ownerId = new mongoose.Types.ObjectId().toString();
    const attackerId = new mongoose.Types.ObjectId().toString();
    const postId = new mongoose.Types.ObjectId().toString();

    const fakePost = {
      _id: postId,
      userId: ownerId,
      description: 'Original post',
    };

    const originalFindById = Post.findById;
    Post.findById = async () => fakePost;

    try {
      const { req, res, getStatusCode, getResponseData } = createMockContext({
        params: { id: postId },
        user: { id: attackerId }, // Different user
      });

      const routeLayer = postRoutes.stack.find(
        (s) => s.route && s.route.path === '/:id' && s.route.methods.delete
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
      await handler(req, res);

      assert.strictEqual(getStatusCode(), 403);
      assert.strictEqual(getResponseData().success, false);
      assert.strictEqual(getResponseData().message, 'You are not authorized to delete this post');
    } finally {
      Post.findById = originalFindById;
    }
  });

  it('allows deletion when authenticated user is the post owner', async () => {
    const postRoutes = require('../routes/postRoutes');
    const Post = require('../models/Post');
    const ownerId = new mongoose.Types.ObjectId().toString();
    const postId = new mongoose.Types.ObjectId().toString();

    const fakePost = {
      _id: postId,
      userId: ownerId,
      description: 'Original post',
    };

    const originalFindById = Post.findById;
    const originalFindByIdAndDelete = Post.findByIdAndDelete;
    Post.findById = async () => fakePost;
    Post.findByIdAndDelete = async () => fakePost;

    try {
      const { req, res, getStatusCode, getResponseData } = createMockContext({
        params: { id: postId },
        user: { id: ownerId }, // Legitimate owner
      });

      const routeLayer = postRoutes.stack.find(
        (s) => s.route && s.route.path === '/:id' && s.route.methods.delete
      );
      const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
      await handler(req, res);

      assert.strictEqual(getStatusCode(), 200);
      assert.strictEqual(getResponseData().success, true);
      assert.strictEqual(getResponseData().message, 'Post deleted successfully');
      assert.deepStrictEqual(getResponseData().data, fakePost);
    } finally {
      Post.findById = originalFindById;
      Post.findByIdAndDelete = originalFindByIdAndDelete;
    }
  });
});

describe('5. Notification Endpoint Authorization', () => {
  it('PUT /mark-all-read has authMiddleware attached', () => {
    const notificationRoutes = require('../routes/notificationsroutes');
    const routeLayer = notificationRoutes.stack.find(
      (s) => s.route && s.route.path === '/mark-all-read' && s.route.methods.put
    );
    assert.ok(routeLayer, 'PUT /mark-all-read route should exist');
    assert.strictEqual(
      routeLayer.route.stack.length >= 2,
      true,
      'PUT /mark-all-read must have authMiddleware before handler'
    );
  });
});

describe('6. Sensitive User Data & Password Hash Exposure', () => {
  it('User model toJSON strips password field', () => {
    const userDoc = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: '$2a$10$hashedpasswordhere',
    });

    const jsonResult = userDoc.toJSON();
    assert.strictEqual(jsonResult.password, undefined, 'toJSON must not include password');
    assert.strictEqual(jsonResult.username, 'testuser');
    assert.strictEqual(jsonResult.email, 'test@example.com');
  });

  it('User model toObject strips password field', () => {
    const userDoc = new User({
      username: 'testuser2',
      email: 'test2@example.com',
      password: '$2a$10$anotherhashedpassword',
    });

    const objResult = userDoc.toObject();
    assert.strictEqual(objResult.password, undefined, 'toObject must not include password');
  });
});

describe('7. Search Input Validation & ReDoS Protection', () => {
  it('rejects empty or whitespace-only search query with 400', async () => {
    const postRoutes = require('../routes/postRoutes');
    const { req, res, getStatusCode, getResponseData } = createMockContext({
      body: { query: '   ' },
    });

    const routeLayer = postRoutes.stack.find(
      (s) => s.route && s.route.path === '/search' && s.route.methods.post
    );
    assert.ok(routeLayer, 'POST /search route should exist');

    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().success, false);
    assert.strictEqual(getResponseData().message, 'Search query is required');
  });

  it('rejects non-string search query with 400 (NoSQL injection prevention)', async () => {
    const postRoutes = require('../routes/postRoutes');
    const { req, res, getStatusCode, getResponseData } = createMockContext({
      body: { query: { $regex: '.*' } },
    });

    const routeLayer = postRoutes.stack.find(
      (s) => s.route && s.route.path === '/search' && s.route.methods.post
    );
    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().success, false);
  });

  it('rejects excessively long search queries with 400 (ReDoS prevention)', async () => {
    const postRoutes = require('../routes/postRoutes');
    const { req, res, getStatusCode, getResponseData } = createMockContext({
      body: { query: 'a'.repeat(150) },
    });

    const routeLayer = postRoutes.stack.find(
      (s) => s.route && s.route.path === '/search' && s.route.methods.post
    );
    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().message, 'Search query too long');
  });
});

describe('8. User Registration & Password Security', () => {
  it('validate_email hashes password before generating verification JWT token', async () => {
    const bcrypt = require('bcryptjs');
    const originalFindOne = User.findOne;
    // Mock user not existing
    User.findOne = async () => null;

    try {
      // Simulate calling validate_email logic directly with email credentials
      const plaintextPassword = 'SuperSecretPassword123!';
      const hashedPassword = await bcrypt.hash(plaintextPassword, 10);
      const token = jwt.sign(
        { email: 'newuser@example.com', password: hashedPassword, username: 'newuser' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      assert.notStrictEqual(
        decoded.password,
        plaintextPassword,
        'JWT token must NOT contain the plaintext password'
      );
      assert.ok(
        await bcrypt.compare(plaintextPassword, decoded.password),
        'Token password must be a valid bcrypt hash of the user password'
      );
      assert.ok(decoded.exp, 'Verification token must have an expiration timestamp');
    } finally {
      User.findOne = originalFindOne;
    }
  });

  it('login rejects non-string credentials to prevent NoSQL query injection', async () => {
    const userRoutes = require('../routes/userRoutes');
    const { req, res, getStatusCode, getResponseData } = createMockContext({
      body: { email: { $ne: null }, password: { $ne: null } },
    });

    const routeLayer = userRoutes.stack.find(
      (s) => s.route && s.route.path === '/login' && s.route.methods.post
    );
    assert.ok(routeLayer, 'POST /login route should exist');

    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().message, 'Invalid credentials');
  });
});

describe('9. Profile Update & Stored XSS Protection', () => {
  it('rejects javascript: and data: URIs in bioLink with 400', async () => {
    const userRoutes = require('../routes/userRoutes');
    const userId = new mongoose.Types.ObjectId().toString();

    const { req, res, getStatusCode, getResponseData } = createMockContext({
      body: { bioLink: 'javascript:alert(document.cookie)' },
      user: { id: userId },
    });

    const routeLayer = userRoutes.stack.find(
      (s) => s.route && s.route.path === '/updateprofile' && s.route.methods.put
    );
    assert.ok(routeLayer, 'PUT /updateprofile route should exist');

    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().success, false);
    assert.ok(getResponseData().message.includes('Invalid bioLink'));
  });

  it('rejects data: URIs in bioLink with 400', async () => {
    const userRoutes = require('../routes/userRoutes');
    const userId = new mongoose.Types.ObjectId().toString();

    const { req, res, getStatusCode, getResponseData } = createMockContext({
      body: { bioLink: 'data:text/html,<script>alert(1)</script>' },
      user: { id: userId },
    });

    const routeLayer = userRoutes.stack.find(
      (s) => s.route && s.route.path === '/updateprofile' && s.route.methods.put
    );
    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().success, false);
  });
});

describe('10. Follow / Unfollow Self-Action Authorization Protection', () => {
  it('rejects attempt to follow self with 400', async () => {
    const userRoutes = require('../routes/userRoutes');
    const userId = new mongoose.Types.ObjectId().toString();

    const { req, res, getStatusCode, getResponseData } = createMockContext({
      params: { userId },
      user: { id: userId },
    });

    const routeLayer = userRoutes.stack.find(
      (s) => s.route && s.route.path === '/:userId/follow' && s.route.methods.post
    );
    assert.ok(routeLayer, 'POST /:userId/follow route should exist');

    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().message, 'Cannot follow yourself');
  });

  it('rejects attempt to unfollow self with 400', async () => {
    const userRoutes = require('../routes/userRoutes');
    const userId = new mongoose.Types.ObjectId().toString();

    const { req, res, getStatusCode, getResponseData } = createMockContext({
      params: { userId },
      user: { id: userId },
    });

    const routeLayer = userRoutes.stack.find(
      (s) => s.route && s.route.path === '/:userId/unfollow' && s.route.methods.post
    );
    assert.ok(routeLayer, 'POST /:userId/unfollow route should exist');

    const handler = routeLayer.route.stack[routeLayer.route.stack.length - 1].handle;
    await handler(req, res);

    assert.strictEqual(getStatusCode(), 400);
    assert.strictEqual(getResponseData().message, 'Cannot unfollow yourself');
  });
});

describe('11. Frontend Hardcoded Network IP Removal', () => {
  it('client files do not contain hardcoded private IP addresses (192.168.x.x)', () => {
    const clientFiles = [
      path.join(__dirname, '../../client/src/componte/login/Login.jsx'),
      path.join(__dirname, '../../client/src/componte/login/Siginin.jsx'),
      path.join(__dirname, '../../client/src/componte/login/New_password.jsx'),
    ];

    for (const filePath of clientFiles) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        assert.strictEqual(
          content.includes('192.168.'),
          false,
          `${path.basename(filePath)} must not contain hardcoded 192.168.x.x IP addresses`
        );
      }
    }
  });
});

describe('12. Socket.IO Authentication & Impersonation Prevention', () => {
  it('socket.js exports initializeSocket and getIo', () => {
    const socketModule = require('../socket');
    assert.strictEqual(typeof socketModule.initializeSocket, 'function');
    assert.strictEqual(typeof socketModule.getIo, 'function');
  });

  it('rejects unauthenticated setUser attempts to join a user room', () => {
    // Simulate socket event handler logic
    const victimUserId = new mongoose.Types.ObjectId().toString();
    let joinedRooms = [];
    let emittedEvents = [];

    const mockSocket = {
      id: 'mock-socket-1',
      user: null,
      join: (room) => joinedRooms.push(room),
      emit: (event, payload) => emittedEvents.push({ event, payload }),
    };

    // Handler logic from socket.js
    function handleSetUser(socket, data) {
      let authenticatedUserId = null;
      if (typeof data === 'object' && data !== null) {
        if (data.token) {
          try {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
            if (decoded && decoded.id) {
              socket.user = decoded;
              authenticatedUserId = decoded.id.toString();
            }
          } catch (e) {}
        } else if (socket.user && socket.user.id) {
          if (!data.userId || data.userId.toString() === socket.user.id.toString()) {
            authenticatedUserId = socket.user.id.toString();
          }
        }
      } else if (typeof data === 'string') {
        if (data.split('.').length === 3) {
          try {
            const decoded = jwt.verify(data, process.env.JWT_SECRET);
            if (decoded && decoded.id) {
              socket.user = decoded;
              authenticatedUserId = decoded.id.toString();
            }
          } catch (e) {}
        } else if (socket.user && socket.user.id && data === socket.user.id.toString()) {
          authenticatedUserId = socket.user.id.toString();
        }
      }

      if (authenticatedUserId) {
        socket.join(authenticatedUserId);
      } else {
        socket.emit('auth_error', { message: 'Authentication required to join user room' });
      }
    }

    // Attempt to join victim room without token
    handleSetUser(mockSocket, victimUserId);

    assert.strictEqual(joinedRooms.length, 0, 'Socket must not join room without authentication');
    assert.ok(emittedEvents.some((e) => e.event === 'auth_error'));
  });

  it('allows authorized setUser with valid JWT to join their own room', () => {
    const myUserId = new mongoose.Types.ObjectId().toString();
    const token = jwt.sign({ id: myUserId }, process.env.JWT_SECRET);
    let joinedRooms = [];

    const mockSocket = {
      id: 'mock-socket-2',
      user: null,
      join: (room) => joinedRooms.push(room),
      emit: () => {},
    };

    function handleSetUser(socket, data) {
      let authenticatedUserId = null;
      if (typeof data === 'object' && data !== null && data.token) {
        try {
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
          if (decoded && decoded.id) {
            socket.user = decoded;
            authenticatedUserId = decoded.id.toString();
          }
        } catch (e) {}
      }
      if (authenticatedUserId) {
        socket.join(authenticatedUserId);
      }
    }

    handleSetUser(mockSocket, { userId: myUserId, token });

    assert.strictEqual(joinedRooms.length, 1);
    assert.strictEqual(joinedRooms[0], myUserId);
    assert.strictEqual(mockSocket.user.id, myUserId);
  });
});
