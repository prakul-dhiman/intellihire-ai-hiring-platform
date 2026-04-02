const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Protect routes — verifies JWT token from Authorization header.
 * Attaches the authenticated user to `req.user`.
 */
const protect = async (req, res, next) => {
    let token;

    // Prefer httpOnly cookie token first. In browser deployments, cookie is
    // the source of truth and avoids failures from stale localStorage Bearer tokens.
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return errorResponse(res, 401, "Not authorized — no token provided");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return errorResponse(res, 401, "Not authorized — user not found");
        }

        next();
    } catch (error) {
        return errorResponse(res, 401, "Not authorized — token invalid");
    }
};

/**
 * Role authorization — checks if user has specific roles
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, 403, `User role '${req.user?.role}' is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { protect, authorize };
