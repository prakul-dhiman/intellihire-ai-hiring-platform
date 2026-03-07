const Resume = require("../models/Resume");
const User = require("../models/User");
const CodingSubmission = require("../models/CodingSubmission");
const InterviewScore = require("../models/InterviewScore");
const Application = require("../models/Application");
const { recalculateFinalScore } = require("../services/scoringService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * @desc    Submit resume metadata
 * @route   POST /api/candidate/resume
 * @access  Candidate
 */
const submitResume = async (req, res) => {
    const { skills, experience, education, summary, certifications, projects, links } = req.body;

    // Check if resume already exists for this candidate
    const existingResume = await Resume.findOne({ candidateId: req.user.id });
    if (existingResume) {
        return errorResponse(
            res,
            400,
            "Resume already exists. Use PUT to update."
        );
    }

    // Simple resume scoring heuristic based on metadata
    let score = 0;
    if (skills && skills.length > 0) score += Math.min(skills.length * 5, 30);
    if (experience >= 1) score += Math.min(experience * 5, 30);
    if (education) score += 20;
    if (summary && summary.length > 50) score += 20;

    const resume = await Resume.create({
        candidateId: req.user.id,
        skills,
        experience,
        education,
        summary,
        certifications,
        projects,
        links,
        score,
    });

    // Update user's resume score and recalculate final score
    await User.findByIdAndUpdate(req.user.id, { resumeScore: score });
    await recalculateFinalScore(req.user.id);

    successResponse(res, 201, "Resume submitted successfully", { resume });
};

/**
 * @desc    Get own resume
 * @route   GET /api/candidate/resume
 * @access  Candidate
 */
const getResume = async (req, res) => {
    const resume = await Resume.findOne({ candidateId: req.user.id }).lean();
    if (!resume) {
        return errorResponse(res, 404, "No resume found. Please submit one.");
    }

    successResponse(res, 200, "Resume fetched", { resume });
};

/**
 * @desc    Update resume metadata
 * @route   PUT /api/candidate/resume
 * @access  Candidate
 */
const updateResume = async (req, res) => {
    const resume = await Resume.findOne({ candidateId: req.user.id });
    if (!resume) {
        return errorResponse(res, 404, "No resume found. Please submit one first.");
    }

    const { skills, experience, education, summary, certifications, projects, links } = req.body;

    if (skills !== undefined) resume.skills = skills;
    if (experience !== undefined) resume.experience = experience;
    if (education !== undefined) resume.education = education;
    if (summary !== undefined) resume.summary = summary;
    if (certifications !== undefined) resume.certifications = certifications;
    if (projects !== undefined) resume.projects = projects;
    if (links !== undefined) resume.links = links;

    // Recalculate resume score
    let score = 0;
    if (resume.skills && resume.skills.length > 0)
        score += Math.min(resume.skills.length * 5, 30);
    if (resume.experience >= 1) score += Math.min(resume.experience * 5, 30);
    if (resume.education) score += 20;
    if (resume.summary && resume.summary.length > 50) score += 20;

    resume.score = score;
    await resume.save();

    // Update user's resume score and recalculate final score
    await User.findByIdAndUpdate(req.user.id, { resumeScore: score });
    await recalculateFinalScore(req.user.id);

    successResponse(res, 200, "Resume updated successfully", { resume });
};

/**
 * @desc    Get own profile (scores)
 * @route   GET /api/candidate/profile
 * @access  Candidate
 */
const getProfile = async (req, res) => {
    const [user, resume, submissions, interviews, applications] = await Promise.all([
        User.findById(req.user.id)
            .select("name email resumeScore codingScore interviewScore finalScore createdAt")
            .lean(),
        Resume.findOne({ candidateId: req.user.id })
            .select("skills experience education summary score certifications projects links createdAt updatedAt")
            .lean(),
        CodingSubmission.find({ candidateId: req.user.id })
            .select("language status score createdAt sourceCode")
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),
        InterviewScore.find({ candidateId: req.user.id })
            .populate("evaluatorId", "name")
            .select("score feedback evaluatorId createdAt")
            .sort({ createdAt: -1 })
            .lean(),
        Application.find({ candidateId: req.user.id })
            .populate("jobId", "title company location status")
            .sort({ createdAt: -1 })
            .lean(),
    ]);

    successResponse(res, 200, "Profile fetched", {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            resumeScore: user.resumeScore,
            codingScore: user.codingScore,
            interviewScore: user.interviewScore,
            finalScore: user.finalScore,
            joinedAt: user.createdAt,
        },
        resume: resume || null,
        recentSubmissions: submissions,
        interviews: interviews,
        applications: applications,
    });
};

/**
 * @desc    Simulate AI processing by parsing PDF and extracting structured data
 * @route   POST /api/candidate/resume/scan
 * @access  Candidate
 */
const scanResumeWithAI = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 400, "Please upload a valid PDF document.");
        }

        const pdfParse = require("pdf-parse"); // Dynamic load to avoid crashing before npm install
        const dataBuffer = req.file.buffer;
        const pdfData = await pdfParse(dataBuffer);
        const text = pdfData.text;

        const lowercaseText = text.toLowerCase();

        // 1. Extract Skills
        const knownSkills = [
            "react", "node.js", "python", "aws", "docker", "graphql", "typescript",
            "mongodb", "javascript", "html", "css", "redux", "java", "c++", "c#",
            "kubernetes", "sql", "git", "express", "angular", "vue"
        ];

        // Exact word matching for accurate extractions
        const extractedSkills = knownSkills.filter(skill => {
            const regex = new RegExp(`\\b${skill === 'c++' ? 'c\\+\\+' : skill}\\b`, 'i');
            return regex.test(lowercaseText);
        });

        // 2. Extract Experience (Looking for numbers X years / Junior / Senior keywords)
        let experience = "0";
        const expMatch = text.match(/(\d+)(?:[+]?)\s*(?:years? of )?experience/i);
        if (expMatch && parseInt(expMatch[1]) < 30) {
            experience = expMatch[1];
        } else if (lowercaseText.includes("senior") || lowercaseText.includes("lead")) {
            experience = "5";
        } else if (lowercaseText.includes("junior")) {
            experience = "1";
        }

        // 3. Extract Education (Degrees)
        let education = "Not explicitly stated";
        const eduMatch = text.match(/(?:Bachelor|Master|B\.?S\.?|M\.?S\.?|Ph\.?D\.?).*?(?:in [\w\s]+)?(?:from|at)?\s+([A-Z][a-zA-Z\s]+(?:University|College|Institute))/);
        if (eduMatch) {
            education = eduMatch[0].trim();
        } else if (lowercaseText.includes("master") || lowercaseText.includes("m.s")) {
            education = "Master's Degree";
        } else if (lowercaseText.includes("bachelor") || lowercaseText.includes("b.s")) {
            education = "Bachelor's Degree";
        } else if (lowercaseText.includes("university") || lowercaseText.includes("college")) {
            education = "University Degree";
        }

        // 4. Extract Summary (Find first paragraph with reasonable text length)
        let summary = "A highly motivated professional with experience in software development.";
        const lines = text.split('\n').filter(l => l.trim().length > 40);
        if (lines.length > 0) {
            // Get first significant block of text
            summary = lines[0].trim();
        }

        // 5. Extract Details (Projects/Certs)
        const projects = [];
        if (lowercaseText.includes("project") || lowercaseText.includes("application")) {
            projects.push({ name: "Extracted Project", desc: "Project mentioned in CV. Details parsed during automated AI scanning." });
        }

        const certifications = [];
        if (lowercaseText.includes("certif")) {
            certifications.push("Certification achieved according to CV analysis");
        }

        // Return the extracted robust payload
        return successResponse(res, 200, "AI parsed CV successfully", {
            extracted: {
                skills: extractedSkills.length ? extractedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)) : ['Technical Skills'],
                experience,
                education,
                summary,
                projects,
                certifications
            }
        });

    } catch (error) {
        console.error("AI Parser Error:", error);
        return errorResponse(res, 500, "Failed to parse document. Ensure it is a valid, unencrypted PDF.");
    }
};

const submitInterview = async (req, res) => {
    try {
        const { responses } = req.body;

        if (!responses || !Array.isArray(responses)) {
            return errorResponse(res, 400, "Invalid interview data format.");
        }

        // Advanced AI heuristic score calculation integrating timing and fumbles
        let totalScore = 0;
        let wordCount = 0;
        let positiveTraits = 0;
        let totalFumbles = 0;
        let totalDuration = 0;
        const keywords = ['experience', 'develop', 'manage', 'team', 'lead', 'agile', 'project', 'architecture', 'design', 'deliver', 'optimize', 'scale'];
        const fumbleKeywords = ['um', 'uh', 'ah', 'like'];

        let allText = '';
        responses.forEach(resp => {
            if (resp.answer) {
                const answerLower = resp.answer.toLowerCase();
                allText += answerLower + ' ';
                wordCount += answerLower.split(/\s+/).length;

                // Score positive keywords
                keywords.forEach(kw => {
                    if (answerLower.includes(kw)) {
                        positiveTraits += 2;
                    }
                });

                // Count exact match fumbles " um " " uh "
                fumbleKeywords.forEach(fw => {
                    const regex = new RegExp(`\\b${fw}\\b`, 'g');
                    const matches = answerLower.match(regex);
                    if (matches) {
                        totalFumbles += matches.length;
                    }
                });
            }
            if (resp.duration) {
                totalDuration += resp.duration;
            }
        });

        // Add explicit tracking if frontend provided fumbles directly as well
        responses.forEach(resp => {
            if (resp.fumbles && typeof resp.fumbles === 'number') {
                totalFumbles += resp.fumbles;
            }
        });

        // Calculate a score out of 100
        const baseScore = Math.min(100, (wordCount * 0.2) + (positiveTraits * 5) + 30); // 30 base for answering
        const fumblePenalty = Math.min(30, totalFumbles * 2); // Max 30 point penalty for fumbles
        const durationPenalty = (totalDuration > 0 && totalDuration < 30) ? 10 : 0; // Penalty if they rushed

        totalScore = baseScore - fumblePenalty - durationPenalty + (Math.random() * 5);
        const finalInterviewScore = Math.min(100, Math.floor(totalScore > 0 ? Math.max(20, totalScore) : 0)); // Floor it at 20, cap at 100

        // Generate Feedback
        let feedback = "AI Behavioral & Technical Analysis:\n\n";

        // Communication Style Feedback
        feedback += "🗣️ Communcation & Fluency:\n";
        if (totalFumbles === 0 && wordCount > 20) {
            feedback += "✅ Exceptionally clear and fluent speech pattern. No filler words detected.\n";
        } else if (totalFumbles <= 3) {
            feedback += "✅ Good fluency. Very few filler words used.\n";
        } else if (totalFumbles > 8) {
            feedback += `❌ High frequency of filler words detected (${totalFumbles} fumbles like 'um', 'uh', 'like'). Suggest practicing smoother transitions.\n`;
        } else {
            feedback += "⚠️ Average fluency. Some hesitation detected.\n";
        }

        // Timing Feedback
        feedback += "\n⏱️ Timing & Delivery:\n";
        if (totalDuration > 120 && wordCount > 150) {
            feedback += "✅ Excellent detail and appropriate time taken to fully answer questions.\n";
        } else if (totalDuration < 30) {
            feedback += "❌ Responses were extremely brief and rushed. Candidate did not articulate fully.\n";
        } else {
            feedback += "✅ Passing delivery speed.\n";
        }

        // Vocabulary Feedback
        feedback += "\n🧠 Content & Vocabulary:\n";
        if (positiveTraits > 6) {
            feedback += "✅ Strong technical and leadership vocabulary (e.g., 'architecture', 'agile', 'develop').\n";
        } else {
            feedback += "⚠️ Average usage of industry standard terminology.\n";
        }

        // Save to DB
        const user = await User.findById(req.user.id);
        user.interviewScore = finalInterviewScore;
        user.interviewFeedback = feedback;
        user.calculateFinalScore();
        await user.save();

        return successResponse(res, 200, "Interview evaluated successfully.", {
            interviewScore: finalInterviewScore,
            interviewFeedback: feedback,
            finalScore: user.finalScore
        });

    } catch (error) {
        console.error("AI Interview Error:", error);
        return errorResponse(res, 500, "Failed to analyze interview responses: " + error.message);
    }
};


/**
 * @desc    Get AI hint for a coding problem
 * @route   POST /api/candidate/interview/hint
 * @access  Candidate
 */
const getAIHint = async (req, res) => {
    try {
        const { problem, code, language, question } = req.body;

        // Build a helpful but non-spoiling hint
        const hints = [
            `For this type of problem, think about the time complexity first. What's the most efficient data structure here?`,
            `Try breaking the problem into smaller subproblems. Can you solve it for a single element first?`,
            `Consider edge cases: empty input, single element, negative numbers, or very large inputs.`,
            `Think about whether dynamic programming, two pointers, or a hash map could simplify this.`,
            `Your current approach might work, but check if there's a way to avoid nested loops for better performance.`,
            `Trace through the examples manually. What pattern do you see in the expected outputs?`,
            `Consider the constraints — they often hint at the expected time complexity (O(n log n), O(n), etc.)`,
            `If you're stuck, try a brute force solution first, then optimize.`,
        ];

        // Generate a contextual hint based on the question
        let hint = '';
        const q = (question || '').toLowerCase();

        if (q.includes('time') || q.includes('complexity') || q.includes('efficient')) {
            hint = `Time complexity hint: Look at your loop depth. If you have O(n²), consider if you can use a HashMap to get it to O(n). For this problem, check if sorting first helps.`;
        } else if (q.includes('edge') || q.includes('case')) {
            hint = `Edge cases to consider: empty array/string, single element, all duplicates, negative numbers, and integer overflow for sum problems.`;
        } else if (q.includes('approach') || q.includes('solve') || q.includes('start')) {
            hint = `Approach: Read the constraints carefully — they hint at the solution. For n ≤ 10^5, aim for O(n log n) or O(n). Start with the brute force, then ask: can I avoid re-computation?`;
        } else if (q.includes('wrong') || q.includes('incorrect') || q.includes('failing')) {
            hint = `Debugging tip: Add console.log to trace your variables at each step. Check your loop boundaries (off-by-one errors are common). Make sure you're handling the base case.`;
        } else {
            // Rotate through general hints based on request count
            hint = hints[Math.floor(Math.random() * hints.length)];
        }

        // Add language-specific tip if code provided
        if (code && language) {
            const langTips = {
                javascript: '\n\nJS tip: Use Map instead of plain object for O(1) lookups. Array.from(), Set(), and destructuring are your friends.',
                python: '\n\nPython tip: defaultdict, Counter, and list comprehensions can make your solution much cleaner and faster.',
                java: '\n\nJava tip: Use HashMap<>(), Arrays.sort(), and consider ArrayList vs int[] based on size needs.',
                cpp: '\n\nC++ tip: unordered_map gives O(1) average lookup. Use auto to simplify type declarations.',
            };
            hint += langTips[language] || '';
        }

        return successResponse(res, 200, 'Hint generated', { hint });
    } catch (error) {
        return errorResponse(res, 500, 'Failed to generate hint: ' + error.message);
    }
};

module.exports = {
    submitResume,
    getResume,
    updateResume,
    getProfile,
    scanResumeWithAI,
    submitInterview,
    getAIHint,
};
