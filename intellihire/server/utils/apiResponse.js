/**
 * Send a success response.
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Success message.
 * @param {*} data - Response payload.
 */
const successResponse = (res, statusCode, message, data = null) => {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * @param {Object} res - Express response object.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Error message.
 */
const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({ success: false, message });
};

module.exports = { successResponse, errorResponse };
