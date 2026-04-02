const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please provide a valid email"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false, // Never return password by default
        },
        role: {
            type: String,
            enum: ["admin", "candidate", "recruiter"],
            default: "candidate",
        },
        resumeScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        codingScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        interviewScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        interviewFeedback: {
            type: String,
            default: "",
        },
        finalScore: {
            type: Number,
            default: 0,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);

// Hash password before saving (Mongoose 9: async hooks don't use next())
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Recalculate final score
userSchema.methods.calculateFinalScore = function () {
    this.finalScore =
        (this.resumeScore || 0) * 0.3 +
        (this.codingScore || 0) * 0.5 +
        (this.interviewScore || 0) * 0.2;
    return this.finalScore;
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// ─── Indexes for Performance ────────────────────────────────
// email is already unique (auto-indexed by Mongoose)
userSchema.index({ role: 1, createdAt: -1 });   // Monthly registration queries
userSchema.index({ role: 1, finalScore: -1 });   // Leaderboard & pass rate queries
userSchema.index({ role: 1 });                    // Candidate filtering
userSchema.index({ createdAt: -1 });              // Date-range analytics queries
userSchema.index({ finalScore: -1 });             // Global leaderboard sorting

module.exports = mongoose.model("User", userSchema);
