const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Cookie configuration for cross-domain deployment
const cookieOptions = {
  httpOnly: true,
  secure: true,          // required for HTTPS
  sameSite: "none",      // required for cross-domain cookies
  maxAge: 30 * 24 * 60 * 60 * 1000
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 400, "User with this email already exists");
  }

  const user = await User.create({ name, email, password, role });

  const token = generateToken(user);

  res.cookie("token", token, cookieOptions);

  successResponse(res, 201, "User registered successfully", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
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

  // send login alert email
  sendEmail(
    user.email,
    "IntelliHire Login Alert",
    `User ${user.name} (${user.email}) has just logged in.`,
    `<p><strong>User Login Alert:</strong></p>
     <p>Name: ${user.name}</p>
     <p>Email: ${user.email}</p>
     <p>Role: ${user.role}</p>
     <p>Time: ${new Date().toLocaleString()}</p>`
  );

  res.cookie("token", token, cookieOptions);

  successResponse(res, 200, "Login successful", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

/**
 * @desc    Get logged in user
 * @route   GET /api/auth/me
 */
const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  successResponse(res, 200, "User profile fetched", { user });
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.cookie("token", "none", {
    ...cookieOptions,
    expires: new Date(Date.now() + 1000)
  });

  successResponse(res, 200, "Logout successful");
};

/**
 * @desc    Forgot password
 */
const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return errorResponse(res, 404, "There is no user with that email");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const frontendUrl = process.env.FRONTEND_URL;
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `Reset your password using this link:\n\n${resetUrl}`;

  try {
    await sendEmail(
      user.email,
      "Password Reset Token",
      message,
      `<p>${message.replace(/\n/g, "<br>")}</p>`
    );

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
 */
const resetPassword = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return errorResponse(res, 400, "Invalid token");
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  const token = generateToken(user);

  res.cookie("token", token, cookieOptions);

  successResponse(res, 200, "Password reset successful");
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
};
