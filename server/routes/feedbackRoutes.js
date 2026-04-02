const express = require("express");
const { submitFeedback } = require("../controllers/feedbackController");

const router = express.Router();

// Define feedback route
router.post("/", submitFeedback);

module.exports = router;
