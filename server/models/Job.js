const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    experience: {
        type: String,
        enum: ['0-1', '1-3', '3-5', '5+'],
        required: true
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Internship', 'Contract'],
        required: true
    },
    location: {
        type: String,
        enum: ['Remote', 'Onsite', 'Hybrid'],
        required: true
    },
    salaryRange: { type: String, required: true },
    deadline: { type: Date, required: true },
    positions: { type: Number, default: 1 },
    codingTestRequired: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['draft', 'open', 'paused', 'closed'],
        default: 'open'
    }
}, { timestamps: true });

// Create text index for search
JobSchema.index({ title: 'text', company: 'text', requiredSkills: 'text' });

module.exports = mongoose.model('Job', JobSchema);
