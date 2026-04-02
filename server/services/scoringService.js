const User = require("../models/User");

/**
 * Recalculate and save the final score for a candidate.
 * Formula: finalScore = (resumeScore × 0.3) + (codingScore × 0.5) + (interviewScore × 0.2)
 *
 * @param {string} candidateId - The MongoDB ObjectId of the candidate.
 * @returns {Object} Updated user with new finalScore.
 */
const recalculateFinalScore = async (candidateId) => {
    const user = await User.findById(candidateId);

    if (!user) {
        throw new Error("Candidate not found");
    }

    if (user.role !== "candidate") {
        throw new Error("User is not a candidate");
    }

    user.calculateFinalScore();
    await user.save();

    return user;
};

module.exports = { recalculateFinalScore };
