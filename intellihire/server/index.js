const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/db.js');

// Import middlewares
const errorHandler = require('./middlewares/errorHandler.js');
const { generalLimiter, authLimiter, codeLimiter } = require('./middlewares/rateLimiter.js');

// Import routes
const authRoutes = require('./routes/authRoutes.js');
const jobRoutes = require('./routes/jobRoutes.js');
const candidateRoutes = require('./routes/candidateRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const codeRoutes = require('./routes/codeRoutes.js');
const sessionRoutes = require('./routes/sessionRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const feedbackRoutes = require('./routes/feedbackRoutes.js');
const analyticsRoutes = require('./routes/analyticsRoutes.js');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── HTTP server for Socket.io ────────────────────────────────────
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST']
  },
});

app.set('socketio', io); // Important to expose io to controllers

// ─── Middleware Setup ───────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(generalLimiter);

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: mongoStatus === 'connected' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoStatus,
    environment: NODE_ENV
  });
});

// ─── API Routes ──────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidate', candidateRoutes); // Fixed path to /api/candidate
app.use('/api/admin', adminRoutes);
app.use('/api/code', codeLimiter, codeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// ─── Global Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Socket.io Logic ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`✅ User linked: ${socket.id}`);

  socket.on('join-chat', (id) => {
    socket.join(id);
    console.log(`💬 User joined chat channel: ${id}`);
  });

  // roomId → { recruiter: socketId, candidate: socketId }
  const rooms = {};
  socket.on("join-room", ({ roomId, role }) => {
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = {};
    rooms[roomId][role] = socket.id;
    socket.to(roomId).emit("peer-joined", { role });
    if (role === 'recruiter' && rooms[roomId]['candidate']) {
        socket.emit('peer-joined', { role: 'candidate' });
    }
  });

  socket.on("offer", ({ roomId, offer }) => socket.to(roomId).emit("offer", { offer }));
  socket.on("answer", ({ roomId, answer }) => socket.to(roomId).emit("answer", { answer }));
  socket.on("ice-candidate", ({ roomId, candidate }) => socket.to(roomId).emit("ice-candidate", { candidate }));

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ─── Start Server ───────────────────────────────────────────────
const start = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`🚀 IntelliHire Server Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
};

start();
