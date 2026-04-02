/**
 * Global error handling middleware.
 * Catches all errors thrown in routes/controllers and sends a clean JSON response.
 * In production, hides stack traces and internal error details.
 */
const errorHandler = (err, req, res, next) => {
    const isProduction = process.env.NODE_ENV === "production";

    // Log full error in development, minimal in production
    if (isProduction) {
        console.error(`❌ [${new Date().toISOString()}] ${err.name}: ${err.message}`);
    } else {
        console.error("❌ Error:", err.stack || err.message);
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: messages,
        });
    }

    // Mongoose duplicate key error (e.g., duplicate email)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `Duplicate value for field '${field}'. Please use a different value.`,
        });
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ID format: ${err.value}`,
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token has expired",
        });
    }

    // Default server error
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: isProduction && statusCode === 500
            ? "Internal Server Error"
            : err.message || "Internal Server Error",
        // Only include stack trace in development
        ...(isProduction ? {} : { stack: err.stack }),
    });
};

module.exports = errorHandler;
