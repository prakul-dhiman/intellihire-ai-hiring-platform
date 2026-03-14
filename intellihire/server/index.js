import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import database connection
import connectDB from './config/db.js';

// Import middlewares
import errorHandler from './middlewares/errorHandler.js';
import rateLimiter from './middlewares/rateLimiter.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import candidateRoutes from './routes/candidateRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// ─────────────────────────────────────────────────────────────────
// ENVIRONMENT VALIDATION
// ─────────────────────────────────────────────────────────────────

const requiredEnvVars = [
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'FRONTEND_URL',
  'NODE_ENV'
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
  console.error('Please check your .env file and ensure all variables are set.');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────
// APP INITIALIZATION
// ─────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Create HTTP server for Socket.io
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/'
});

// ─────────────────────────────────────────────────────────────────
// MIDDLEWARE SETUP
// ─────────────────────────────────────────────────────────────────

// Security Headers (Helmet)
app.use(helmet());

// JSON & URL Encoded Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Express Rate Limiter
app.use(rateLimiter);

// Request Logging Middleware (Development only)
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Trust proxy (for production deployments behind reverse proxy)
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─────────────────────────────────────────────────────────────────
// HEALTH CHECK ENDPOINT
// ─────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  const mongoConnection = mongoose.connection.readyState;
  const mongoStatus = mongoConnection === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: mongoStatus === 'connected' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoStatus,
    environment: NODE_ENV,
    version: '1.0.0'
  });
});

// ─────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─────────────────────────────────────────────────────────────────
// 404 HANDLER
// ─────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────
// SOCKET.IO SETUP
// ─────────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle interview room join
  socket.on('join-interview', (data) => {
    const { interviewId, userId } = data;
    socket.join(`interview-${interviewId}`);
    socket.broadcast
      .to(`interview-${interviewId}`)
      .emit('user-joined', { userId, socketId: socket.id });
  });

  // Handle messaging
  socket.on('send-message', (data) => {
    const { recipientId, message } = data;
    io.to(recipientId).emit('receive-message', {
      senderId: socket.id,
      message,
      timestamp: new Date()
    });
  });

  // Handle WebRTC signaling
  socket.on('ice-candidate', (data) => {
    socket.broadcast.emit('ice-candidate', data);
  });

  socket.on('offer', (data) => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('answer', (data) => {
    socket.broadcast.emit('answer', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    socket.broadcast.emit('user-disconnected', { socketId: socket.id });
  });
});

// ─────────────────────────────────────────────────────────────────
// DATABASE CONNECTION & SERVER START
// ─────────────────────────────────────────────────────────────────

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start HTTP Server with Socket.io
    httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║           🚀 IntelliHire Server Started Successfully           ║
╠════════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}
║  Environment: ${NODE_ENV}
║  Socket.io: ws://localhost:${PORT}/socket.io/
║  Frontend: ${process.env.FRONTEND_URL}
╚════════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// ─────────────────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────────────────

process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Unhandled Promise Rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Send to error tracking service (Sentry, DataDog, etc.)
});

// Uncaught Exception
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// ─────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────

startServer();

export { app, httpServer, io };
