const mongoose = require("mongoose");

const interviewScoreSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Candidate ID is required"],
        },
        evaluatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Evaluator (admin) ID is required"],
        },
        score: {
            type: Number,
            required: [true, "Interview score is required"],
            min: 0,
            max: 100,
        },
        feedback: {
            type: String,
            trim: true,
            maxlength: [2000, "Feedback cannot exceed 2000 characters"],
        },
    },
    { timestamps: true }
);

// ─── Indexes for Performance ────────────────────────────────
interviewScoreSchema.index({ candidateId: 1, createdAt: -1 });

module.exports = mongoose.model("InterviewScore", interviewScoreSchema);
