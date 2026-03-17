const rateLimit = require("express-rate-limit");

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again after 15 minutes.",
    },
});

/**
 * Strict limiter for auth routes (login/register)
 * 10 requests per 15 minutes per IP — prevents brute-force attacks
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // BUG-07 FIX: was incorrectly set to 100 (same as general limiter)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again after 15 minutes.",
    },
});

/**
 * Strict limiter for code submission
 * 20 submissions per 15 minutes per IP
 */
const codeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many code submissions. Please try again after 15 minutes.",
    },
});

module.exports = { generalLimiter, authLimiter, codeLimiter };
