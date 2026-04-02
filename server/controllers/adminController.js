const User = require("../models/User");
const InterviewScore = require("../models/InterviewScore");
const Resume = require("../models/Resume");
const CodingSubmission = require("../models/CodingSubmission");
const { recalculateFinalScore } = require("../services/scoringService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * @desc    Get all candidates
 * @route   GET /api/admin/candidates
 * @access  Admin
 */
const getAllCandidates = async (req, res) => {
    const candidates = await User.find({ role: "candidate" })
        .select("name email resumeScore codingScore interviewScore finalScore createdAt")
        .sort({ createdAt: -1 })
        .lean();

    successResponse(res, 200, "Candidates fetched", {
        count: candidates.length,
        candidates,
    });
};

/**
 * @desc    Get single candidate details (with resume + submissions)
 * @route   GET /api/admin/candidate/:id
 * @access  Admin
 */
const getCandidateById = async (req, res) => {
    const { id } = req.params;

    const candidate = await User.findById(id)
        .select("name email role resumeScore codingScore interviewScore finalScore createdAt interviewFeedback")
        .lean();
    if (!candidate || candidate.role !== "candidate") {
        return errorResponse(res, 404, "Candidate not found");
    }

    // Parallel queries for performance
    const [resume, submissions, interviewScores] = await Promise.all([
        Resume.findOne({ candidateId: id }).lean(),
        CodingSubmission.find({ candidateId: id })
            .select("language status score createdAt")
            .sort({ createdAt: -1 })
            .lean(),
        InterviewScore.find({ candidateId: id })
            .populate("evaluatorId", "name email")
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    successResponse(res, 200, "Candidate details fetched", {
        candidate,
        resume,
        submissions,
        interviewScores,
    });
};

/**
 * @desc    Assign interview score to a candidate
 * @route   POST /api/admin/interview-score
 * @access  Admin
 */
const assignInterviewScore = async (req, res) => {
    const { candidateId, score, feedback } = req.body;

    // Validate candidate exists and is a candidate
    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "candidate") {
        return errorResponse(res, 404, "Candidate not found");
    }

    if (score < 0 || score > 100) {
        return errorResponse(res, 400, "Score must be between 0 and 100");
    }

    // Create interview score record
    const interviewScore = await InterviewScore.create({
        candidateId,
        evaluatorId: req.user.id,
        score,
        feedback: feedback || "",
    });

    // Compute average interview score for the candidate
    const allInterviewScores = await InterviewScore.find({ candidateId });
    const avgScore =
        allInterviewScores.reduce((sum, s) => sum + s.score, 0) /
        allInterviewScores.length;

    // Update user's interview score and recalculate final score
    candidate.interviewScore = Math.round(avgScore);
    await candidate.save();
    await recalculateFinalScore(candidateId);

    successResponse(res, 201, "Interview score assigned successfully", {
        interviewScore,
        updatedInterviewScore: Math.round(avgScore),
    });
};

/**
 * @desc    Get leaderboard — candidates sorted by finalScore (descending)
 * @route   GET /api/admin/leaderboard?page=1&limit=10
 * @access  Admin
 */
const getLeaderboard = async (req, res) => {
    // Pagination params (defaults: page 1, limit 10)
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Count total candidates for pagination metadata
    const totalCandidates = await User.countDocuments({ role: "candidate" });
    const totalPages = Math.ceil(totalCandidates / limit);

    const leaderboard = await User.find({ role: "candidate" })
        .select("name email resumeScore codingScore interviewScore finalScore")
        .sort({ finalScore: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    // Add rank numbers (offset-aware for correct ranking across pages)
    const ranked = leaderboard.map((candidate, index) => ({
        rank: skip + index + 1,
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        resumeScore: candidate.resumeScore,
        codingScore: candidate.codingScore,
        interviewScore: candidate.interviewScore,
        finalScore: candidate.finalScore,
    }));

    successResponse(res, 200, "Leaderboard fetched", {
        leaderboard: ranked,
        pagination: {
            totalCandidates,
            totalPages,
            currentPage: page,
            perPage: limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    });
};

const pdfParse = require("pdf-parse");

/**
 * @desc    Bulk analyze multiple CVs against a job description
 * @route   POST /api/admin/bulk-analyze
 * @access  Admin
 */
const bulkAnalyzeCVs = async (req, res) => {
    try {
        const files = req.files; // from multer array
        const jobDesc = req.body.jobDesc || "";

        if (!files || files.length === 0) {
            return errorResponse(res, 400, "No files uploaded");
        }

        const jdWords = jobDesc.toLowerCase().match(/\w+/g) || [];

        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            let text = "";

            try {
                if (file.mimetype === "application/pdf") {
                    const data = await pdfParse(file.buffer);
                    text = data.text;
                } else {
                    // Fallback for doc/docx or plain text (simplified extraction)
                    text = file.buffer.toString("utf8");
                }
            } catch (err) {
                console.error("Error parsing layout file", err);
                text = "Error parsing file content. Assume moderate score.";
            }

            // --- ADVANCED CV ANALYZER ENGINE ---
            const lowercaseText = text.toLowerCase();
            const cvWords = lowercaseText.match(/\w+/g) || [];

            let breakdown = {
                jdFit: 0,
                experience: 0,
                skills: 0,
                education: 0
            };

            let keyFindings = [];

            // 1. Education Extraction (Max 15 points)
            if (/(bachelor|b\.s|b\.a|btech|b\.e)/i.test(lowercaseText)) {
                breakdown.education = 10;
                keyFindings.push("Bachelor's degree detected.");
            }
            if (/(master|m\.s|m\.a|mba|mtech)/i.test(lowercaseText)) {
                breakdown.education = 15;
                if (!keyFindings.includes("Master's degree detected.")) keyFindings.push("Master's degree detected.");
            }
            if (breakdown.education === 0) {
                if (/university|college|institute/i.test(lowercaseText)) {
                    breakdown.education = 5;
                    keyFindings.push("Higher education detected.");
                } else {
                    keyFindings.push("No clear higher education found.");
                }
            }

            // 2. Experience Extraction (Max 25 points)
            let expYears = 0;
            const expMatch = lowercaseText.match(/(\d+)(?:[+]?)\s*(?:years? of )?experience/i);
            if (expMatch && parseInt(expMatch[1]) < 30) {
                expYears = parseInt(expMatch[1]);
            } else if (/\b(senior|lead|principal)\b/i.test(lowercaseText)) {
                expYears = 5;
            } else if (/\b(junior|fresher|intern)\b/i.test(lowercaseText)) {
                expYears = 1;
            }

            if (expYears > 0) {
                breakdown.experience = Math.min(25, expYears * 5); // 5 points per year, up to 25
                keyFindings.push(`Approximately ${expYears}+ years of experience inferred.`);
            } else {
                keyFindings.push("Experience level unclear; analyzing density instead.");
                // Fallback: length of CV as proxy for experience
                breakdown.experience = Math.min(20, (cvWords.length / 100));
            }

            // 3. Technical Skills & Buzzwords (Max 30 points)
            const techSkills = ["react", "node", "aws", "docker", "kubernetes", "python", "java", "c++", "javascript", "typescript", "sql", "mongodb", "machine learning", "ai", "system design", "graphql", "redis", "linux", "git", "ci/cd"];
            let skillsFound = [];
            techSkills.forEach(skill => {
                if (new RegExp(`\\b${skill === 'c++' ? 'c\\+\\+' : skill}\\b`, 'i').test(lowercaseText)) {
                    skillsFound.push(skill);
                }
            });
            breakdown.skills = Math.min(30, skillsFound.length * 4);
            if (skillsFound.length > 0) {
                keyFindings.push(`Key technical skills: ${skillsFound.slice(0, 5).join(', ')}${skillsFound.length > 5 ? '...' : ''}.`);
            } else {
                keyFindings.push("Lacking standard technical buzzwords.");
            }

            // 4. JD Alignment & Context Match (Max 30 points)
            if (jdWords.length > 0) {
                const jdSet = new Set(jdWords.filter(w => w.length > 3 && !['with', 'this', 'that', 'from', 'have', 'your'].includes(w)));
                let matches = 0;
                let matchedWords = [];
                cvWords.forEach(w => {
                    if (jdSet.has(w) && !matchedWords.includes(w)) {
                        matches++;
                        matchedWords.push(w);
                    }
                });
                const matchRatio = matches / (jdSet.size || 1);
                breakdown.jdFit = Math.min(30, Math.floor(matchRatio * 50));
                if (breakdown.jdFit > 20) {
                    keyFindings.push("Strong textual alignment with Job Description.");
                } else if (breakdown.jdFit < 10) {
                    keyFindings.push("Weak alignment with provided Job Description vocabulary.");
                } else {
                    keyFindings.push("Moderate alignment with Job Description.");
                }
            } else {
                // If no JD provided, give default points for general formatting (length, sections)
                breakdown.jdFit = Math.min(30, cvWords.length > 400 ? 25 : 15);
                keyFindings.push("No explicit JD provided; scored on overall CV structure and depth.");
            }

            // Calculate final total out of 100
            let score = Math.floor(breakdown.education + breakdown.experience + breakdown.skills + breakdown.jdFit);
            score = Math.floor(Math.min(99, Math.max(10, score))); // Cap between 10 and 99

            results.push({
                id: i,
                filename: file.originalname,
                name: file.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                score,
                status: score >= 80 ? 'Shortlisted' : score >= 65 ? 'Review' : 'Rejected',
                breakdown,
                keyFindings
            });
        }

        // Sort descending
        results.sort((a, b) => b.score - a.score);

        successResponse(res, 200, "Analyzed bulk files", { results });
    } catch (error) {
        console.error("Bulk Analyze Error:", error);
        errorResponse(res, 500, "Server error analyzing files");
    }
};

module.exports = {
    getAllCandidates,
    getCandidateById,
    assignInterviewScore,
    getLeaderboard,
    bulkAnalyzeCVs,
};
