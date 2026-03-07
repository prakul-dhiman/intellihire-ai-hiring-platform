const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return errorResponse(res, 400, "User with this email already exists");
    }

    const user = await User.create({ name, email, password, role });

    const token = generateToken(user);

    successResponse(res, 201, "User registered successfully", {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return errorResponse(res, 401, "Invalid email or password");
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return errorResponse(res, 401, "Invalid email or password");
    }

    const token = generateToken(user);

    successResponse(res, 200, "Login successful", {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
        token,
    });
};

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    successResponse(res, 200, "User profile fetched", { user });
};

module.exports = { register, login, getMe };
