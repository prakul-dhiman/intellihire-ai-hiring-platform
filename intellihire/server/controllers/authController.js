const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

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

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    successResponse(res, 201, "User registered successfully", {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
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

    // Send email notification dynamically in the background
    sendEmail(
        user.email,
        "IntelliHire Login Alert",
        `User ${user.name} (${user.email}) has just logged in to IntelliHire.`,
        `<p><strong>User Login Alert:</strong></p><p>Name: ${user.name}</p><p>Email: ${user.email}</p><p>Role: ${user.role}</p><p>Time: ${new Date().toLocaleString()}</p>`
    );

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    successResponse(res, 200, "Login successful", {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        }
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

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    successResponse(res, 200, "Logout successful");
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgotpassword
 * @access  Public
 */
const forgotPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return errorResponse(res, 404, "There is no user with that email");
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url (pointing to frontend reset page)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) have requested a password reset for your IntelliHire account.\n\nPlease click the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

    try {
        await sendEmail(user.email, "Password Reset Token", message, `<p>${message.replace(/\n/g, '<br>')}</p>`);
        successResponse(res, 200, "Email sent");
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return errorResponse(res, 500, "Email could not be sent");
    }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/resetpassword/:resettoken
 * @access  Public
 */
const resetPassword = async (req, res) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return errorResponse(res, 400, "Invalid token");
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user);
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });

    successResponse(res, 200, "Password reset successful");
};

module.exports = { register, login, getMe, logout, forgotPassword, resetPassword };
