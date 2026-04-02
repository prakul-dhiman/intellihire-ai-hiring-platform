const express = require("express");
const router = express.Router();
const {
    getAllCandidates,
    getCandidateById,
    assignInterviewScore,
    getLeaderboard,
    bulkAnalyzeCVs,
} = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");
const { validateFields } = require("../middlewares/validate");

// All routes require authentication + admin role
router.use(protect, authorize("admin"));

// GET /api/admin/candidates
router.get("/candidates", getAllCandidates);

// GET /api/admin/candidate/:id
router.get("/candidate/:id", getCandidateById);

// POST /api/admin/interview-score
router.post(
    "/interview-score",
    validateFields("candidateId", "score"),
    assignInterviewScore
);

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/admin/leaderboard
router.get("/leaderboard", getLeaderboard);

// POST /api/admin/bulk-analyze
router.post("/bulk-analyze", upload.array("files"), bulkAnalyzeCVs);

module.exports = router;
