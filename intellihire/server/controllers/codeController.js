const CodingSubmission = require("../models/CodingSubmission");
const User = require("../models/User");
const { submitCode, getResult } = require("../services/judge0Service");
const { recalculateFinalScore } = require("../services/scoringService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

/**
 * @desc    Submit code for execution via Judge0
 * @route   POST /api/code/submit
 * @access  Candidate
 */
const submitCodeSolution = async (req, res) => {
    const { language, sourceCode, stdin, expectedOutput } = req.body;

    // Submit to Judge0
    const { token } = await submitCode(sourceCode, language, stdin, expectedOutput);

    // Save submission record
    const submission = await CodingSubmission.create({
        candidateId: req.user.id,
        language,
        sourceCode,
        stdin: stdin || "",
        expectedOutput: expectedOutput || "",
        judge0Token: token,
        status: "pending",
    });

    successResponse(res, 201, "Code submitted successfully. Poll for results.", {
        submissionId: submission._id,
        judge0Token: token,
    });
};

/**
 * @desc    Get Judge0 result by token and update submission
 * @route   GET /api/code/result/:token
 * @access  Candidate
 */
const getCodeResult = async (req, res) => {
    const { token } = req.params;

    // Fetch result from Judge0
    const result = await getResult(token);

    // Find and update our submission record
    const submission = await CodingSubmission.findOne({ judge0Token: token });
    if (!submission) {
        return errorResponse(res, 404, "Submission not found for this token");
    }

    // Verify ownership
    if (submission.candidateId.toString() !== req.user.id) {
        return errorResponse(res, 403, "Not authorized to view this submission");
    }

    // Map Judge0 status to our status
    let status = "pending";
    let score = 0;

    if (result.status) {
        const statusId = result.status.id;
        if (statusId === 3) {
            // Accepted
            status = "accepted";
            score = 100;
        } else if (statusId === 4) {
            // Wrong Answer
            status = "wrong_answer";
            score = 20;
        } else if (statusId === 5) {
            // Time Limit Exceeded
            status = "timeout";
            score = 10;
        } else if (statusId >= 6) {
            // Runtime or Compilation error
            status = "error";
            score = 0;
        }
        // statusId 1 or 2 means still processing
    }

    // Update submission if it has completed
    if (status !== "pending") {
        submission.status = status;
        submission.actualOutput = result.stdout || result.stderr || result.compile_output || "";
        submission.score = score;
        await submission.save();

        // Update the candidate's coding score (average of all submissions)
        const allSubmissions = await CodingSubmission.find({
            candidateId: req.user.id,
            status: { $ne: "pending" },
        });

        const avgScore =
            allSubmissions.reduce((sum, s) => sum + s.score, 0) /
            allSubmissions.length;

        await User.findByIdAndUpdate(req.user.id, {
            codingScore: Math.round(avgScore),
        });
        await recalculateFinalScore(req.user.id);
    }

    successResponse(res, 200, "Result fetched", {
        status,
        result,
        submission: {
            id: submission._id,
            status: submission.status,
            score: submission.score,
        },
    });
};

/**
 * @desc    Get own submission history
 * @route   GET /api/code/submissions
 * @access  Candidate
 */
const getSubmissions = async (req, res) => {
    const submissions = await CodingSubmission.find({
        candidateId: req.user.id,
    }).sort({ createdAt: -1 });

    successResponse(res, 200, "Submissions fetched", { submissions });
};

module.exports = { submitCodeSolution, getCodeResult, getSubmissions };
