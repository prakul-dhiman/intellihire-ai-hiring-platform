const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Candidate ID is required"],
            unique: true, // One resume per candidate
        },
        skills: {
            type: [String],
            default: [],
        },
        experience: {
            type: Number,
            required: [true, "Years of experience is required"],
            min: 0,
        },
        education: {
            type: String,
            required: [true, "Education is required"],
            trim: true,
        },
        summary: {
            type: String,
            trim: true,
            maxlength: [1000, "Summary cannot exceed 1000 characters"],
        },
        score: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        certifications: {
            type: [String],
            default: [],
        },
        projects: [
            {
                name: String,
                desc: String,
            }
        ],
        links: {
            linkedin: String,
            github: String,
            portfolio: String,
        },
    },
    { timestamps: true }
);

// ─── Index for skills aggregation ───────────────────────────
resumeSchema.index({ skills: 1 });

module.exports = mongoose.model("Resume", resumeSchema);
