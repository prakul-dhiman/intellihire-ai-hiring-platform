const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { generalLimiter, codeLimiter } = require('./middlewares/rateLimiter.js');
const errorHandler = require('./middlewares/errorHandler.js');
const { getAllowedOrigins } = require('./config/corsOrigins.js');

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
app.set('trust proxy', 1);
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Middleware Setup ───────────────────────────────────────────
app.use(helmet({ 
    contentSecurityPolicy: false, 
}));

// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());

// CORS Configuration
const allowedOrigins = getAllowedOrigins();

// Check if an origin is from a private LAN (e.g. 192.168.x.x:5173 on mobile)
const isPrivateNetwork = (origin) => {
  if (!origin) return false;
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /^192\.168\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
    );
  } catch {
    return false;
  }
};

const corsOptions = {
    origin: (origin, callback) => {
      console.log(`[CORS] Request from origin: ${origin}`);
      if (NODE_ENV === 'development') {
        return callback(null, true); // Allow all in dev
      }
      // Also allow any *.vercel.app for preview deployments
      const isVercelPreview = origin && origin.endsWith('.vercel.app');
      const isAllowed = !origin || allowedOrigins.includes(origin) || isPrivateNetwork(origin) || isVercelPreview;
      
      if (!isAllowed) {
        console.warn(`[CORS] Blocked request from origin: ${origin}`);
      }
      callback(null, isAllowed); // Null error avoids Express 500 crashes
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(generalLimiter);

// ─── Health Check ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const memoryUsage = process.memoryUsage();
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0-prod',
    uptime: `${Math.floor(process.uptime())}s`,
    infra: {
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    },
    environment: NODE_ENV
  });
});

// ─── API Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidate', candidateRoutes);
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

module.exports = app;
