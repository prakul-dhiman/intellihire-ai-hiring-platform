const express = require('express');
const router = express.Router();
const {
    createSession,
    validateSession,
    startSession,
    endSession,
    listSessions,
} = require('../controllers/sessionController');
const { protect } = require('../middlewares/authMiddleware');

// Recruiter creates a session (must be authenticated)
router.post('/create', protect, createSession);

// Candidate validates a code (open — candidate just needs the code)
router.post('/validate', validateSession);

// Recruiter starts / ends the session
router.post('/start', protect, startSession);
router.post('/end', endSession); // candidate or recruiter can end

// List sessions (for recruiter dashboard)
router.get('/list', protect, listSessions);

module.exports = router;
