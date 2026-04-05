/**
 * Origins allowed for CORS / Socket.io when the API is hit cross-origin.
 * Set FRONTEND_URL to your primary site; add alternates via ALLOWED_ORIGINS (comma-separated).
 * Example: ALLOWED_ORIGINS=https://www.example.com,https://example.com
 */
function getAllowedOrigins() {
    const extra = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return [
        process.env.FRONTEND_URL,
        ...extra,
        'http://localhost:5173',
        'http://localhost:3000',
    ].filter(Boolean);
}

module.exports = { getAllowedOrigins };
