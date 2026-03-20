const { errorResponse } = require("../utils/apiResponse");

/**
 * Validate that required fields are present in req.body.
 * Usage: validateFields("email", "password", "name")
 *
 * @param  {...string} fields - Required field names.
 */
const validateFields = (...fields) => {
    return (req, res, next) => {
        const missing = fields.filter(
            (field) =>
                req.body[field] === undefined ||
                req.body[field] === null ||
                req.body[field] === ""
        );

        if (missing.length > 0) {
            return errorResponse(
                res,
                400,
                `Missing required fields: ${missing.join(", ")}`
            );
        }

        next();
    };
};

/**
 * Validate that a field value is a valid email format.
 */
const validateEmail = (req, res, next) => {
    // Standard RFC-compliant-ish robust regex for emails
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (req.body.email && !emailRegex.test(req.body.email)) {
        return errorResponse(res, 400, "Please provide a valid email address");
    }
    next();
};

/**
 * Validate that password meets minimum length and complexity requirements.
 */
const validatePassword = (req, res, next) => {
    const pw = req.body.password;
    if (pw) {
        if (pw.length < 8) {
            return errorResponse(res, 400, "Password must be at least 8 characters long");
        }
        if (!/[A-Z]/.test(pw)) return errorResponse(res, 400, "Password must contain at least one uppercase letter");
        if (!/[a-z]/.test(pw)) return errorResponse(res, 400, "Password must contain at least one lowercase letter");
        if (!/[0-9]/.test(pw)) return errorResponse(res, 400, "Password must contain at least one number");
        if (!/[^A-Za-z0-9]/.test(pw)) return errorResponse(res, 400, "Password must contain at least one special character");
    }
    next();
};

module.exports = { validateFields, validateEmail, validatePassword };
