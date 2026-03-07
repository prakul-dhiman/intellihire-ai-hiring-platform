const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const {
    validateFields,
    validateEmail,
    validatePassword,
} = require("../middlewares/validate");

// POST /api/auth/register
router.post(
    "/register",
    validateFields("name", "email", "password"),
    validateEmail,
    validatePassword,
    register
);

// POST /api/auth/login
router.post(
    "/login",
    validateFields("email", "password"),
    validateEmail,
    login
);

// GET /api/auth/me
router.get("/me", protect, getMe);

module.exports = router;
