const User = require("../models/User");
const Resume = require("../models/Resume");
const { successResponse } = require("../utils/apiResponse");

/**
 * @desc    Get analytics overview — KPIs
 * @route   GET /api/admin/analytics/overview
 * @access  Admin
 *
 * Returns:
 *  - totalCandidates
 *  - avgResumeScore, avgCodingScore, avgInterviewScore, avgFinalScore
 *  - passRate (finalScore >= 70)
 *  - totalEvaluated (interviewScore > 0)
 */
const getOverview = async (req, res) => {
    const [result] = await User.aggregate([
        { $match: { role: "candidate" } },
        {
            $group: {
                _id: null,
                totalCandidates: { $sum: 1 },
                avgResumeScore: { $avg: "$resumeScore" },
                avgCodingScore: { $avg: "$codingScore" },
                avgInterviewScore: { $avg: "$interviewScore" },
                avgFinalScore: { $avg: "$finalScore" },
                passCount: {
                    $sum: { $cond: [{ $gte: ["$finalScore", 70] }, 1, 0] },
                },
                evaluatedCount: {
                    $sum: { $cond: [{ $gt: ["$interviewScore", 0] }, 1, 0] },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalCandidates: 1,
                avgResumeScore: { $round: ["$avgResumeScore", 1] },
                avgCodingScore: { $round: ["$avgCodingScore", 1] },
                avgInterviewScore: { $round: ["$avgInterviewScore", 1] },
                avgFinalScore: { $round: ["$avgFinalScore", 1] },
                passCount: 1,
                evaluatedCount: 1,
                passRate: {
                    $round: [
                        {
                            $cond: [
                                { $eq: ["$totalCandidates", 0] },
                                0,
                                {
                                    $multiply: [
                                        { $divide: ["$passCount", "$totalCandidates"] },
                                        100,
                                    ],
                                },
                            ],
                        },
                        1,
                    ],
                },
            },
        },
    ]);

    successResponse(res, 200, "Analytics overview fetched", {
        overview: result || {
            totalCandidates: 0,
            avgResumeScore: 0,
            avgCodingScore: 0,
            avgInterviewScore: 0,
            avgFinalScore: 0,
            passCount: 0,
            evaluatedCount: 0,
            passRate: 0,
        },
    });
};

/**
 * @desc    Get monthly candidate registrations (last 12 months)
 * @route   GET /api/admin/analytics/monthly-registrations
 * @access  Admin
 *
 * Uses $group by year+month on createdAt.
 * Returns array of { year, month, label, count }.
 */
const getMonthlyRegistrations = async (req, res) => {
    // Go back 12 months from today
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const data = await User.aggregate([
        {
            $match: {
                role: "candidate",
                createdAt: { $gte: twelveMonthsAgo },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
            $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                count: 1,
            },
        },
    ]);

    // Fill in missing months with 0 count
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const now = new Date();
    const filled = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth() + 1; // 1-indexed
        const existing = data.find((r) => r.year === year && r.month === month);
        filled.push({
            year,
            month,
            label: `${monthNames[month - 1]} ${year}`,
            count: existing ? existing.count : 0,
        });
    }

    successResponse(res, 200, "Monthly registrations fetched", {
        registrations: filled,
    });
};

/**
 * @desc    Get top 5 most common skills across all resumes
 * @route   GET /api/admin/analytics/top-skills
 * @access  Admin
 *
 * Unwinds skills array, groups by skill name, counts occurrences.
 */
const getTopSkills = async (req, res) => {
    const data = await Resume.aggregate([
        { $unwind: "$skills" },
        {
            $group: {
                _id: { $toLower: "$skills" },
                count: { $sum: 1 },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
            $project: {
                _id: 0,
                skill: "$_id",
                count: 1,
            },
        },
    ]);

    successResponse(res, 200, "Top skills fetched", { skills: data });
};

/**
 * @desc    Get score distribution — how many candidates fall in each score range
 * @route   GET /api/admin/analytics/score-distribution
 * @access  Admin
 *
 * Buckets: 0-20, 20-40, 40-60, 60-80, 80-100
 * Returns counts for resume, coding, interview, and final scores.
 */
const getScoreDistribution = async (req, res) => {
    const boundaries = [0, 20, 40, 60, 80, 101]; // 101 to include 100

    const [resumeDist, codingDist, interviewDist, finalDist] = await Promise.all([
        User.aggregate([
            { $match: { role: "candidate" } },
            {
                $bucket: {
                    groupBy: "$resumeScore",
                    boundaries,
                    default: "100+",
                    output: { count: { $sum: 1 } },
                },
            },
        ]),
        User.aggregate([
            { $match: { role: "candidate" } },
            {
                $bucket: {
                    groupBy: "$codingScore",
                    boundaries,
                    default: "100+",
                    output: { count: { $sum: 1 } },
                },
            },
        ]),
        User.aggregate([
            { $match: { role: "candidate" } },
            {
                $bucket: {
                    groupBy: "$interviewScore",
                    boundaries,
                    default: "100+",
                    output: { count: { $sum: 1 } },
                },
            },
        ]),
        User.aggregate([
            { $match: { role: "candidate" } },
            {
                $bucket: {
                    groupBy: "$finalScore",
                    boundaries,
                    default: "100+",
                    output: { count: { $sum: 1 } },
                },
            },
        ]),
    ]);

    // Normalize: ensure all buckets exist with 0 if missing
    const labels = ["0-20", "20-40", "40-60", "60-80", "80-100"];
    const normalize = (raw) => {
        return boundaries.slice(0, -1).map((b, i) => {
            const found = raw.find((r) => r._id === b);
            return { range: labels[i], count: found ? found.count : 0 };
        });
    };

    successResponse(res, 200, "Score distribution fetched", {
        distribution: {
            resume: normalize(resumeDist),
            coding: normalize(codingDist),
            interview: normalize(interviewDist),
            final: normalize(finalDist),
        },
    });
};

module.exports = {
    getOverview,
    getMonthlyRegistrations,
    getTopSkills,
    getScoreDistribution,
};
