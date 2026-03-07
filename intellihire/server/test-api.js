/**
 * IntelliHire API Test Script
 * Tests all endpoints sequentially: Auth → Candidate → Admin → Leaderboard
 */
require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");

const BASE = "http://localhost:5000";

// Stored tokens / IDs between tests
let candidateToken = "";
let adminToken = "";
let candidateId = "";

// Unique emails to avoid duplicates
const ts = Date.now();
const CANDIDATE_EMAIL = `candidate_${ts}@test.com`;
const ADMIN_EMAIL = `admin_${ts}@test.com`;

// ─── HTTP Helper ────────────────────────────────────────────
function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method,
            headers: { "Content-Type": "application/json" },
        };
        if (token) options.headers["Authorization"] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(data) });
                } catch {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });
        req.on("error", reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function log(label, result) {
    const icon = result.status < 400 ? "✅" : "❌";
    console.log(`\n${icon} [${result.status}] ${label}`);
    console.log(JSON.stringify(result.body, null, 2));
}

// ─── Test Suites ────────────────────────────────────────────
async function testAuth() {
    console.log("\n" + "═".repeat(60));
    console.log("  AUTH TESTS");
    console.log("═".repeat(60));

    // 1. Register Candidate
    let res = await request("POST", "/api/auth/register", {
        name: "John Candidate",
        email: CANDIDATE_EMAIL,
        password: "test123",
        role: "candidate",
    });
    log("Register Candidate", res);
    if (res.body.data) {
        candidateToken = res.body.data.token;
        candidateId = res.body.data.user.id;
    }

    // 2. Register Admin
    res = await request("POST", "/api/auth/register", {
        name: "Admin User",
        email: ADMIN_EMAIL,
        password: "admin123",
        role: "admin",
    });
    log("Register Admin", res);
    if (res.body.data) adminToken = res.body.data.token;

    // 3. Login Candidate
    res = await request("POST", "/api/auth/login", {
        email: CANDIDATE_EMAIL,
        password: "test123",
    });
    log("Login Candidate", res);

    // 4. Get Me (authenticated)
    res = await request("GET", "/api/auth/me", null, candidateToken);
    log("Get Me (Candidate)", res);

    // 5. Missing fields validation
    res = await request("POST", "/api/auth/register", {
        email: "noname@test.com",
    });
    log("Register — missing fields (should fail)", res);

    // 6. Duplicate email
    res = await request("POST", "/api/auth/register", {
        name: "Dup",
        email: CANDIDATE_EMAIL,
        password: "test123",
    });
    log("Register — duplicate email (should fail)", res);
}

async function testCandidate() {
    console.log("\n" + "═".repeat(60));
    console.log("  CANDIDATE TESTS");
    console.log("═".repeat(60));

    // 1. Submit Resume
    let res = await request(
        "POST",
        "/api/candidate/resume",
        {
            skills: ["JavaScript", "React", "Node.js", "MongoDB"],
            experience: 3,
            education: "B.Tech Computer Science",
            summary:
                "Full-stack developer with 3 years of experience building scalable web applications using the MERN stack.",
        },
        candidateToken
    );
    log("Submit Resume", res);

    // 2. Get Resume
    res = await request("GET", "/api/candidate/resume", null, candidateToken);
    log("Get Resume", res);

    // 3. Update Resume
    res = await request(
        "PUT",
        "/api/candidate/resume",
        {
            skills: ["JavaScript", "React", "Node.js", "MongoDB", "TypeScript", "Docker"],
            experience: 4,
        },
        candidateToken
    );
    log("Update Resume", res);

    // 4. Get Profile
    res = await request("GET", "/api/candidate/profile", null, candidateToken);
    log("Get Profile (with scores)", res);

    // 5. Access denied — admin trying candidate route
    res = await request("GET", "/api/candidate/profile", null, adminToken);
    log("Admin accessing candidate route (should fail 403)", res);
}

async function testAdmin() {
    console.log("\n" + "═".repeat(60));
    console.log("  ADMIN TESTS");
    console.log("═".repeat(60));

    // 1. Get all candidates
    let res = await request("GET", "/api/admin/candidates", null, adminToken);
    log("Get All Candidates", res);

    // 2. Get single candidate
    res = await request(
        "GET",
        `/api/admin/candidate/${candidateId}`,
        null,
        adminToken
    );
    log("Get Candidate by ID", res);

    // 3. Assign interview score
    res = await request(
        "POST",
        "/api/admin/interview-score",
        { candidateId, score: 85, feedback: "Strong communication skills, good problem solving" },
        adminToken
    );
    log("Assign Interview Score", res);

    // 4. Assign another interview score (to test averaging)
    res = await request(
        "POST",
        "/api/admin/interview-score",
        { candidateId, score: 75, feedback: "Good technical knowledge" },
        adminToken
    );
    log("Assign 2nd Interview Score (averaging)", res);

    // 5. Get leaderboard
    res = await request("GET", "/api/admin/leaderboard", null, adminToken);
    log("Leaderboard", res);

    // 6. Candidate trying admin route (should fail)
    res = await request("GET", "/api/admin/candidates", null, candidateToken);
    log("Candidate accessing admin route (should fail 403)", res);
}

async function test404() {
    console.log("\n" + "═".repeat(60));
    console.log("  404 & ERROR TESTS");
    console.log("═".repeat(60));

    const res = await request("GET", "/api/nonexistent");
    log("404 Route", res);
}

// ─── Run All Tests ──────────────────────────────────────────
async function main() {
    console.log("🧪 IntelliHire API Test Suite");
    console.log(`   Candidate: ${CANDIDATE_EMAIL}`);
    console.log(`   Admin:     ${ADMIN_EMAIL}`);

    await testAuth();
    await testCandidate();
    await testAdmin();
    await test404();

    console.log("\n" + "═".repeat(60));
    console.log("  🏁 ALL TESTS COMPLETE");
    console.log("═".repeat(60));

    process.exit(0);
}

main().catch((err) => {
    console.error("💥 Test failed:", err.message);
    process.exit(1);
});
