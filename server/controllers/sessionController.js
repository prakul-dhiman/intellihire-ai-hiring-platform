/**
 * Session Controller — In-memory interview session registry
 * Sessions auto-expire after 4 hours.
 * Only codes created by a recruiter can be joined by a candidate.
 */

const sessions = new Map(); // code -> sessionData
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

/* ── Helpers ── */
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function cleanExpired() {
    const now = Date.now();
    for (const [code, session] of sessions.entries()) {
        if (now - session.createdAt > SESSION_TTL_MS) sessions.delete(code);
    }
}

/* ─────────────────────────────────────────────────────────────
 * POST /api/sessions/create
 * Body: { candidateName, problemId, problemTitle }
 * Auth: recruiter / admin
 * ─────────────────────────────────────────────────────────────*/
const createSession = (req, res) => {
    cleanExpired();
    const { candidateName = 'Candidate', problemId, problemTitle, problemDifficulty } = req.body;
    const recruiterId = req.user?.id || 'anonymous';

    // Generate unique code
    let code;
    let attempts = 0;
    do {
        code = generateCode();
        attempts++;
    } while (sessions.has(code) && attempts < 20);

    if (sessions.has(code)) {
        return res.status(500).json({ success: false, message: 'Could not generate unique session code. Try again.' });
    }

    const session = {
        code,
        recruiterId,
        candidateName,
        problemId,
        problemTitle,
        problemDifficulty,
        status: 'waiting',   // waiting | active | ended
        createdAt: Date.now(),
        startedAt: null,
        endedAt: null,
        violations: [],
    };

    sessions.set(code, session);

    return res.json({
        success: true,
        message: 'Session created',
        data: { code, session },
    });
};

/* ─────────────────────────────────────────────────────────────
 * POST /api/sessions/validate
 * Body: { code }
 * Auth: candidate (or public — candidate may not be logged in yet)
 * ─────────────────────────────────────────────────────────────*/
const validateSession = (req, res) => {
    cleanExpired();
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, message: 'Session code is required.' });
    }

    const session = sessions.get(code.trim().toUpperCase());

    if (!session) {
        return res.status(404).json({
            success: false,
            message: 'Invalid session code. Ask your recruiter to share the correct code.',
        });
    }

    if (session.status === 'ended') {
        return res.status(410).json({
            success: false,
            message: 'This interview session has already ended.',
        });
    }

    // Return safe session info (no internal IDs)
    return res.json({
        success: true,
        message: 'Session found',
        data: {
            code: session.code,
            candidateName: session.candidateName,
            problemId: session.problemId,
            problemTitle: session.problemTitle,
            problemDifficulty: session.problemDifficulty,
            status: session.status,
        },
    });
};

/* ─────────────────────────────────────────────────────────────
 * POST /api/sessions/start
 * Body: { code }
 * Auth: recruiter
 * ─────────────────────────────────────────────────────────────*/
const startSession = (req, res) => {
    const { code } = req.body;
    const session = sessions.get(code?.toUpperCase());

    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    if (session.status === 'ended') return res.status(410).json({ success: false, message: 'Session already ended.' });

    session.status = 'active';
    session.startedAt = Date.now();

    return res.json({ success: true, message: 'Session started', data: session });
};

/* ─────────────────────────────────────────────────────────────
 * POST /api/sessions/end
 * Body: { code, violations? }
 * Auth: recruiter or candidate
 * ─────────────────────────────────────────────────────────────*/
const endSession = (req, res) => {
    const { code, violations } = req.body;
    const session = sessions.get(code?.toUpperCase());

    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    session.status = 'ended';
    session.endedAt = Date.now();
    if (violations) session.violations = violations;

    return res.json({ success: true, message: 'Session ended', data: session });
};

/* ─────────────────────────────────────────────────────────────
 * GET /api/sessions/list
 * Auth: admin / recruiter
 * ─────────────────────────────────────────────────────────────*/
const listSessions = (req, res) => {
    cleanExpired();
    const recruiterId = req.user?.id;
    const all = [...sessions.values()]
        .filter(s => !recruiterId || s.recruiterId === recruiterId)
        .map(s => ({
            code: s.code,
            candidateName: s.candidateName,
            problemTitle: s.problemTitle,
            status: s.status,
            createdAt: s.createdAt,
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

    return res.json({ success: true, data: all });
};

module.exports = { createSession, validateSession, startSession, endSession, listSessions };
