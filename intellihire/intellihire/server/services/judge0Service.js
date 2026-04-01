const axios = require("axios");

// ─── Judge0 Configuration ───────────────────────────────────
// Option 1 (Default): Free public CE instance — no API key needed
// Option 2: Self-hosted via Docker  — set JUDGE0_API_URL=http://localhost:2358
// Option 3: RapidAPI (paid)         — set JUDGE0_API_URL + JUDGE0_API_KEY + JUDGE0_API_HOST
const JUDGE0_BASE_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";

/**
 * Build headers based on which Judge0 instance is configured.
 * - Free CE / Self-hosted: just Content-Type
 * - RapidAPI: adds X-RapidAPI-Key and X-RapidAPI-Host
 */
const getHeaders = () => {
    const headers = { "Content-Type": "application/json" };

    if (process.env.JUDGE0_API_KEY) {
        headers["X-RapidAPI-Key"] = process.env.JUDGE0_API_KEY;
        headers["X-RapidAPI-Host"] =
            process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com";
    }

    return headers;
};

// Language ID map for Judge0 (subset — extend as needed)
const LANGUAGE_IDS = {
    javascript: 63,
    python: 71,
    java: 62,
    c: 50,
    cpp: 54,
    "c++": 54,
    go: 60,
    ruby: 72,
    typescript: 74,
};

/**
 * Submit source code to Judge0 for execution.
 * @param {string} sourceCode - The code to execute.
 * @param {string} language - Language name (e.g., "python").
 * @param {string} stdin - Standard input for the program.
 * @param {string} expectedOutput - Expected correct output.
 * @returns {Object} { token } - The Judge0 submission token.
 */
const submitCode = async (sourceCode, language, stdin = "", expectedOutput = "") => {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];

    if (!languageId) {
        throw new Error(
            `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(", ")}`
        );
    }

    const payload = {
        source_code: Buffer.from(sourceCode).toString("base64"),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString("base64"),
        expected_output: expectedOutput
            ? Buffer.from(expectedOutput).toString("base64")
            : undefined,
    };

    const response = await axios.post(
        `${JUDGE0_BASE_URL}/submissions?base64_encoded=true&wait=false`,
        payload,
        { headers: getHeaders() }
    );

    return { token: response.data.token };
};

/**
 * Get the result of a Judge0 submission by its token.
 * @param {string} token - Judge0 submission token.
 * @returns {Object} Submission result from Judge0.
 */
const getResult = async (token) => {
    const response = await axios.get(
        `${JUDGE0_BASE_URL}/submissions/${token}?base64_encoded=true`,
        { headers: getHeaders() }
    );

    const data = response.data;

    // Decode base64 fields safely
    const decode = (val) => (val ? Buffer.from(val, "base64").toString() : null);

    const decoded = {
        status: data.status,
        stdout: decode(data.stdout),
        stderr: decode(data.stderr),
        compile_output: decode(data.compile_output),
        time: data.time,
        memory: data.memory,
    };

    return decoded;
};

module.exports = { submitCode, getResult, LANGUAGE_IDS };
