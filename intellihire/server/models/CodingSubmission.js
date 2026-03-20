const mongoose = require("mongoose");

const codingSubmissionSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Candidate ID is required"],
        },
        language: {
            type: String,
            required: [true, "Programming language is required"],
            trim: true,
        },
        sourceCode: {
            type: String,
            required: [true, "Source code is required"],
        },
        stdin: {
            type: String,
            default: "",
        },
        expectedOutput: {
            type: String,
            default: "",
        },
        actualOutput: {
            type: String,
            default: "",
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "wrong_answer", "error", "timeout"],
            default: "pending",
        },
        judge0Token: {
            type: String,
            default: "",
        },
        score: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    { timestamps: true }
);

// ─── Indexes for Performance ────────────────────────────────
codingSubmissionSchema.index({ candidateId: 1, createdAt: -1 }); // Per-candidate submissions
codingSubmissionSchema.index({ judge0Token: 1 });                 // Result polling by token

module.exports = mongoose.model("CodingSubmission", codingSubmissionSchema);
