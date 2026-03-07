const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middlewares/errorHandler");
const { generalLimiter, authLimiter, codeLimiter } = require("./middlewares/rateLimiter");

// Route imports
const authRoutes = require('./routes/authRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const codeRoutes = require('./routes/codeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const jobRoutes = require('./routes/jobRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// ─── Security Middleware ────────────────────────────────────
app.use(helmet());

// ─── CORS Configuration ────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, curl, Postman)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ─── Body Parsers ───────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Global Rate Limiter ────────────────────────────────────
app.use("/api", generalLimiter);

// ─── Health Check ───────────────────────────────────────────
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "IntelliHire API Running 🚀",
        version: "2.0.0",
        environment: process.env.NODE_ENV || "development",
    });
});

// ─── API Routes (with per-route rate limiting) ──────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/code', codeLimiter, codeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);

// ─── 404 Handler ────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
});

// ─── Global Error Handler (must be last) ────────────────────
app.use(errorHandler);

module.exports = app;