const { errorResponse } = require("../utils/apiResponse");

/**
 * Restrict access to specific roles.
 * Usage: authorize("admin") or authorize("admin", "candidate")
 * Must be used AFTER the protect middleware (req.user must exist).
 *
 * @param  {...string} roles - Allowed roles.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 401, "Not authorized — please login first");
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(
                res,
                403,
                `Access denied — role '${req.user.role}' is not authorized for this resource`
            );
        }

        next();
    };
};

module.exports = { authorize };
