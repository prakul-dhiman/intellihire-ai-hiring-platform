const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Cookie configuration
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

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

    res.cookie("token", token, getCookieOptions());

    return successResponse(res, 201, "User registered successfully", {
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

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password");
    }

    const token = generateToken(user);

    res.cookie("token", token, getCookieOptions());

    // Optional login alert email
    try {
      await sendEmail(
        user.email,
        "IntelliHire Login Alert",
        `User ${user.name} logged in`,
        `<p><strong>Login Alert</strong></p>
         <p>Name: ${user.name}</p>
         <p>Email: ${user.email}</p>
         <p>Time: ${new Date().toLocaleString()}</p>`
      );
    } catch (err) {
      console.log("Email failed:", err.message);
    }

    return successResponse(res, 200, "Login successful", {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return errorResponse(res, 500, err.message || "Login failed");
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