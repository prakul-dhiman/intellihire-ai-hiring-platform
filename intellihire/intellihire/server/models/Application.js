const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Resume Screening', 'Coding Test', 'Shortlisted', 'Interview Scheduled', 'Offer Sent', 'Hired', 'Rejected'],
        default: 'Applied'
    },
    aiMatchScore: {
        type: Number, // 0 to 100
        default: 0
    },
    matchDetails: {
        skillsMatch: Number,
        experienceMatch: Number,
        projectMatch: Number,
        educationMatch: Number
    },
    codingScore: { type: Number },
    interviewScore: { type: Number },
    coverMessage: { type: String },
    portfolioUrl: { type: String },
    resumeUrl: { type: String }, // snapshot of resume URL at application time
    scheduledInterviewDate: { type: Date }
}, { timestamps: true });

// Ensure a candidate can only apply once per job
ApplicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
