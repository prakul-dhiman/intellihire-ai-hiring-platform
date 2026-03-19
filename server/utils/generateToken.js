const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for a user.
 * @param {Object} user - The user document from MongoDB.
 * @returns {string} Signed JWT token.
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = generateToken;
