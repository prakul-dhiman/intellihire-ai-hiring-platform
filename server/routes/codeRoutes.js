const express = require("express");
const router = express.Router();
const {
    submitCodeSolution,
    getCodeResult,
    getSubmissions,
} = require("../controllers/codeController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const { validateFields } = require("../middlewares/validate");

// All routes require authentication + candidate role
router.use(protect, authorize("candidate"));

// POST /api/code/submit
router.post(
    "/submit",
    validateFields("language", "sourceCode"),
    submitCodeSolution
);

// GET /api/code/result/:token
router.get("/result/:token", getCodeResult);

// GET /api/code/submissions
router.get("/submissions", getSubmissions);

module.exports = router;
