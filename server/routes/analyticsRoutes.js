const express = require("express");
const router = express.Router();
const {
    getOverview,
    getMonthlyRegistrations,
    getTopSkills,
    getScoreDistribution,
} = require("../controllers/analyticsController");
const { protect } = require("../middlewares/authMiddleware");
const { authorize } = require("../middlewares/roleMiddleware");

// All routes require authentication + admin role
router.use(protect, authorize("admin"));

// GET /api/admin/analytics/overview
router.get("/overview", getOverview);

// GET /api/admin/analytics/monthly-registrations
router.get("/monthly-registrations", getMonthlyRegistrations);

// GET /api/admin/analytics/top-skills
router.get("/top-skills", getTopSkills);

// GET /api/admin/analytics/score-distribution
router.get("/score-distribution", getScoreDistribution);

module.exports = router;
