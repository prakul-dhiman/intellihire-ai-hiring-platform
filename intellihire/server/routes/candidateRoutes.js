const express = require("express");
const router = express.Router();
const {
    submitResume,
    getResume,
    updateResume,
    getProfile,
} = require("../controllers/candidateController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const { validateFields } = require("../middlewares/validate");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// All routes require authentication + candidate role
router.use(protect, authorize("candidate"));

// POST /api/candidate/resume
router.post(
    "/resume",
    validateFields("experience", "education"),
    submitResume
);

// POST /api/candidate/resume/scan (AI CV Scanner)
router.post(
    "/resume/scan",
    upload.single("resumeFile"),
    require("../controllers/candidateController").scanResumeWithAI
);

// POST /api/candidate/interview/submit (AI Interview Scanner)
router.post(
    "/interview/submit",
    require("../controllers/candidateController").submitInterview
);

// POST /api/candidate/interview/hint (AI Chatbot)
router.post(
    "/interview/hint",
    require("../controllers/candidateController").getAIHint
);

// GET /api/candidate/resume
router.get("/resume", getResume);

// PUT /api/candidate/resume
router.put("/resume", updateResume);

// GET /api/candidate/profile
router.get("/profile", getProfile);

module.exports = router;
