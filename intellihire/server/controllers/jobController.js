const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Message = require('../models/Message');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

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
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;

        let query = { status: 'open' };

        if (search) {
            query.$text = { $search: search };
        }
        if (location) query.location = location;
        if (jobType) query.jobType = jobType;
        if (experience) query.experience = experience;

        const total = await Job.countDocuments(query);
        const jobs = await Job.find(query)
            .skip(startIndex)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const pagination = {};
        if (startIndex + jobs.length < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.status(200).json({ success: true, count: jobs.length, total, pagination, data: jobs });
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
        const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 }).lean();
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
        const job = await Job.findById(req.params.id).lean();
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

        // SEC-02 FIX: Only allow specific fields to be updated — never pass req.body directly
        const { title, company, description, requiredSkills, preferredSkills, experience, jobType, location, salaryRange, deadline, positions, codingTestRequired, status } = req.body;
        const allowedUpdates = { title, company, description, requiredSkills, preferredSkills, experience, jobType, location, salaryRange, deadline, positions, codingTestRequired, status };
        // Remove undefined fields
        Object.keys(allowedUpdates).forEach(k => allowedUpdates[k] === undefined && delete allowedUpdates[k]);

        job = await Job.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true });
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

        // BUG-03 FIX: Resume model uses `candidateId` not `user`
        const resume = await Resume.findOne({ candidateId: req.user._id });
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
            .sort({ aiMatchScore: -1 })
            .lean(); // Rank automatically by match score

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
        let app = await Application.findById(req.params.id)
            .populate('jobId', 'title company')
            .populate('candidateId', 'name email');

        if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

        if (app.recruiterId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const oldStatus = app.status;
        const newStatus = req.body.status;
        app.status = newStatus;

        if (req.body.scheduledInterviewDate) {
            app.scheduledInterviewDate = req.body.scheduledInterviewDate;
        }
        await app.save();

        // ─── Automated Communication Logic ───
        if (newStatus !== oldStatus) {
            let notificationContent = "";
            let emailSubject = "";

            if (newStatus === 'Hired') {
                notificationContent = `Congratulations ${app.candidateId.name}! You have been selected for the position of ${app.jobId.title} at ${app.jobId.company}. We are excited to have you on board!`;
                emailSubject = `Offer Letter / Selection Notification - ${app.jobId.company}`;
            } else if (newStatus === 'Interview Scheduled') {
                const date = new Date(app.scheduledInterviewDate).toLocaleString();
                notificationContent = `Great news! An interview has been scheduled for the role of ${app.jobId.title}. Date & Time: ${date}. Please be ready!`;
                emailSubject = `Interview Scheduled - ${app.jobId.title}`;
            } else if (newStatus === 'Shortlisted') {
                notificationContent = `You have been shortlisted for the ${app.jobId.title} position at ${app.jobId.company}. We will reach out soon with next steps.`;
                emailSubject = `Application Update: Shortlisted at ${app.jobId.company}`;
            }

            if (notificationContent) {
                // 1. Create Internal Hub Message
                await Message.create({
                    sender: req.user._id,
                    receiver: app.candidateId._id,
                    content: notificationContent
                });

                // 2. Send External Email (Async)
                sendEmail(
                    app.candidateId.email,
                    emailSubject,
                    notificationContent,
                    `<div style="font-family: sans-serif; padding: 20px; color: #1e1b4b; background-color: #f8fafc;">
                        <h2 style="color: #4f46e5;">IntelliHire Application Update</h2>
                        <p>Hello <strong>${app.candidateId.name}</strong>,</p>
                        <p>${notificationContent}</p>
                        <p>Best regards,<br/>The Hiring Team @ ${app.jobId.company}</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;"/>
                        <p style="font-size: 12px; color: #64748b;">This is an automated notification from <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #818cf8;">IntelliHire</a>.</p>
                    </div>`
                );
            }
        }

        res.status(200).json({ success: true, data: app });
    } catch (error) {
        console.error("Status Update Error:", error);
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
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, data: myApps });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
