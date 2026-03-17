const express = require("express");
const router = express.Router();
const { register, login, getMe, logout, forgotPassword, resetPassword } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
    validateFields,
    validateEmail,
    validatePassword,
} = require("../middlewares/validate");
const { authLimiter } = require("../middlewares/rateLimiter");

// POST /api/auth/register
router.post(
    "/register",
    authLimiter,
    validateFields("name", "email", "password"),
    validateEmail,
    validatePassword,
    register
);

// POST /api/auth/login
router.post(
    "/login",
    authLimiter,
    validateFields("email", "password"),
    validateEmail,
    login
);

// GET /api/auth/me
router.get("/me", protect, getMe);

// POST /api/auth/logout
router.post("/logout", logout);

// POST /api/auth/forgotpassword
router.post("/forgotpassword", validateFields("email"), validateEmail, forgotPassword);

// PUT /api/auth/resetpassword/:resettoken
router.put("/resetpassword/:resettoken", validateFields("password"), validatePassword, resetPassword);

module.exports = router;
