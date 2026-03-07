const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume'); // assuming Resume model exists for candidate's parsed text

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter)
exports.createJob = async (req, res) => {
    try {
        const { title, company, description, requiredSkills, preferredSkills, experience, jobType, location, salaryRange, deadline, positions, codingTestRequired, status } = req.body;

        const job = await Job.create({
            recruiterId: req.user._id,
            title,
            company,
            description,
            requiredSkills,
            preferredSkills,
            experience,
            jobType,
            location,
            salaryRange,
            deadline,
            positions,
            codingTestRequired,
            status
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get all active jobs (for candidates)
// @route   GET /api/jobs
// @access  Private (Candidate)
exports.getJobs = async (req, res) => {
    try {
        const { search, location, jobType, experience } = req.query;
        let query = { status: 'open' };

        if (search) {
            query.$text = { $search: search };
        }
        if (location) query.location = location;
        if (jobType) query.jobType = jobType;
        if (experience) query.experience = experience;

        const jobs = await Job.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get recruiter's jobs
// @route   GET /api/jobs/me
// @access  Private (Recruiter)
exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter)
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (job.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (job.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await job.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Apply to a Job
// @route   POST /api/jobs/:id/apply
// @access  Private (Candidate)
exports.applyToJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        const existingApp = await Application.findOne({ jobId: job._id, candidateId: req.user._id });
        if (existingApp) {
            return res.status(400).json({ success: false, message: 'You have already applied' });
        }

        // 1. Fetch Candidate's Resume details
        const resume = await Resume.findOne({ user: req.user._id });
        let matchScore = 0;
        let matchDetails = { skillsMatch: 0, experienceMatch: 0, projectMatch: 0, educationMatch: 0 };

        // --- Dummy AI Scoring Logic (In real app, call OpenAI here) ---
        if (resume && job.requiredSkills.length > 0) {
            // Very naive skill matcher
            const candidateSkills = resume.skills ? resume.skills.map(s => s.toLowerCase()) : [];
            const reqSkills = job.requiredSkills.map(s => s.toLowerCase());

            let matchedSkills = 0;
            reqSkills.forEach(skill => {
                if (candidateSkills.includes(skill) || candidateSkills.some(cs => cs.includes(skill) || skill.includes(cs))) {
                    matchedSkills++;
                }
            });

            const skillsScore = Math.min((matchedSkills / reqSkills.length) * 40, 40); // Max 40
            matchDetails.skillsMatch = Math.round(skillsScore);
            matchDetails.experienceMatch = 20; // Hardcoded dummy
            matchDetails.projectMatch = 15;    // Hardcoded dummy
            matchDetails.educationMatch = 10;  // Hardcoded dummy

            matchScore = matchDetails.skillsMatch + matchDetails.experienceMatch + matchDetails.projectMatch + matchDetails.educationMatch;
        }

        const application = await Application.create({
            jobId: job._id,
            candidateId: req.user._id,
            recruiterId: job.recruiterId,
            coverMessage: req.body.coverMessage || '',
            portfolioUrl: req.body.portfolioUrl || '',
            resumeUrl: resume ? resume.fileUrl : '', // assuming resume has a PDF url
            aiMatchScore: matchScore,
            matchDetails
        });

        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Get candidates applied to a job
// @route   GET /api/jobs/:id/applicants
// @access  Private (Recruiter)
exports.getJobApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

        if (job.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const applicants = await Application.find({ jobId: req.params.id })
            .populate('candidateId', 'name email avatar')
            .sort({ aiMatchScore: -1 }); // Rank automatically by match score

        res.status(200).json({ success: true, data: applicants });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update applicant status
// @route   PUT /api/jobs/applications/:id/status
// @access  Private (Recruiter)
exports.updateApplicationStatus = async (req, res) => {
    try {
        let app = await Application.findById(req.params.id);
        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        if (app.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        app.status = req.body.status;
        if (req.body.scheduledInterviewDate) {
            app.scheduledInterviewDate = req.body.scheduledInterviewDate;
        }
        await app.save();

        res.status(200).json({ success: true, data: app });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get candidates own applications
// @route   GET /api/candidate/applications
// @access  Private (Candidate)
exports.getMyApplications = async (req, res) => {
    try {
        const myApps = await Application.find({ candidateId: req.user._id })
            .populate('jobId', 'title company location salaryRange status')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: myApps });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
