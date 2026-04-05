const User = require("../models/User");
const mongoose = require("mongoose");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");


// Cookie configuration
const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  const options = {
    httpOnly: true,
    secure: isProd,           // Only HTTPS in production, HTTP allowed in dev
    sameSite: isProd ? 'None' : 'Lax', // None required for cross-origin prod, Lax for local dev
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/',
  };
  console.log(`[Auth] Cookie options (${isProd ? 'production' : 'development'}):`, options);
  return options;
};


/**
 * @desc Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role: rawRole } = req.body;

    // Secure role handling
    const allowedRoles = ["candidate", "recruiter"];
    const role = allowedRoles.includes(rawRole) ? rawRole : "candidate";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "User with this email already exists");
    }

    const user = await User.create({ name, email, password, role });

    const token = generateToken(user);
    console.log('[Auth] Generated token for registered user. Setting cookie...');

    res.cookie("token", token, getCookieOptions());
    console.log('[Auth] Set-Cookie header should now be present in response.');

    // Also return token in body — frontend stores it for cross-device Bearer auth fallback
    return successResponse(res, 201, "User registered successfully", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message || "Registration failed");
  }
};

/**
 * @desc Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for critical configuration
    if (!process.env.JWT_SECRET) {
      console.error('❌ CRITICAL: JWT_SECRET is missing from .env!');
      return errorResponse(res, 500, "Server configuration error.");
    }

    // Basic input validation
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required.");
    }

    console.log(`[Auth] Login attempt for: ${email}`);

    // Check DB state
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ Database not connected (State: ' + mongoose.connection.readyState + ')');
      return errorResponse(res, 500, "Database connection error.");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      console.warn(`[Auth] User not found: ${email}`);
      return errorResponse(res, 401, "Invalid credentials.");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.warn(`[Auth] Incorrect password for user: ${email}`);
      return errorResponse(res, 401, "Invalid credentials.");
    }

    // Generate JWT
    const token = generateToken(user);
    console.log('[Auth] Token generated successfully');

    res.cookie("token", token, getCookieOptions());

    const responsePayload = {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    // Non-blocking email sending
    sendEmail(
      user.email,
      "IntelliHire Login Alert",
      `User ${user.name} logged in`,
      `<p><strong>Login Alert</strong></p>
       <p>Time: ${new Date().toLocaleString()}</p>`
    ).catch(err => console.error("[Auth] Login alert email failed:", err.message));

    console.log('[Auth] Login successful for: ' + email);
    return successResponse(res, 200, "Login successful", responsePayload);
  } catch (err) {
    console.error('❌ [Auth] Error during login:', err.name, err.message, err.stack);
    return errorResponse(res, 500, `An unexpected server error occurred during login: ${err.message}`);
  }
};


/**
 * @desc Get logged-in user
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, 200, "User profile fetched", { user });
  } catch (err) {
    return errorResponse(res, 500, err.message || "Failed to fetch profile");
  }
};

/**
 * @desc Logout user
 */
const logout = async (req, res) => {
  res.cookie("token", "none", {
    ...getCookieOptions(),
    expires: new Date(Date.now() + 1000),
  });

  return successResponse(res, 200, "Logout successful");
};

/**
 * @desc Forgot password
 */
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // Security: don't reveal if user exists
    if (!user) {
      return successResponse(
        res,
        200,
        "If that email exists, a reset link has been sent."
      );
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `Reset your password:\n\n${resetUrl}`;

    try {
      await sendEmail(
        user.email,
        "Password Reset Token",
        message,
        `<p>${message.replace(/\n/g, "<br>")}</p>`
      );

      return successResponse(
        res,
        200,
        "If that email exists, a reset link has been sent."
      );
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return errorResponse(res, 500, "Email could not be sent");
    }
  } catch (err) {
    return errorResponse(res, 500, err.message || "Request failed");
  }
};

/**
 * @desc Reset password
 */
const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return errorResponse(res, 400, "Invalid token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = generateToken(user);

  res.cookie("token", token, getCookieOptions());

  return successResponse(res, 200, "Password reset successful");
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
};