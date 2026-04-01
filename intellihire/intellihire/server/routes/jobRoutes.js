const express = require('express');
const {
    createJob,
    getJobs,
    getJob,
    updateJob,
    deleteJob,
    applyToJob,
    getJobApplicants,
    updateApplicationStatus,
    getMyJobs,
    getMyApplications
} = require('../controllers/jobController');

const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public / Candidates Route
router.get('/', protect, getJobs);
router.get('/:id', protect, getJob);

// Candidate Actions
router.post('/:id/apply', protect, authorize('candidate'), applyToJob);
router.get('/candidate/my-applications', protect, authorize('candidate'), getMyApplications);

// Recruiter Actions
router.post('/', protect, authorize('recruiter'), createJob);
router.get('/recruiter/my-jobs', protect, authorize('recruiter'), getMyJobs);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);
router.get('/:id/applicants', protect, authorize('recruiter'), getJobApplicants);
router.put('/applications/:id/status', protect, authorize('recruiter'), updateApplicationStatus);

module.exports = router;
