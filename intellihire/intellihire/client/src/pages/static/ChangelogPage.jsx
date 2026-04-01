import { motion } from 'framer-motion';

const BG = '#07090f';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const ENTRIES = [
    {
        version: 'v2.4.0', date: 'Mar 5, 2026', highlight: true,
        changes: [
            { type: 'NEW', text: 'Live Coding Assessments 2.0 — rebuilt runner with 3× faster execution and 12 languages.' },
            { type: 'NEW', text: 'AI Interview Score weighted into final candidate rank (configurable).' },
            { type: 'IMPROVED', text: 'Resume parser now extracts certifications and publications from PDFs.' },
            { type: 'FIX', text: 'Fixed export to CSV dropping candidates with null coding scores.' },
        ],
    },
    {
        version: 'v2.3.0', date: 'Feb 18, 2026',
        changes: [
            { type: 'NEW', text: 'Bulk email outreach — accept/reject candidates with one click + customizable templates.' },
            { type: 'NEW', text: 'Leaderboard drag-to-reorder with manual overrides.' },
            { type: 'IMPROVED', text: 'Analytics dashboard redesigned with funnel view and time-to-hire chart.' },
            { type: 'FIX', text: 'Pagination now preserved on table sort/filter.' },
        ],
    },
    {
        version: 'v2.2.0', date: 'Feb 1, 2026',
        changes: [
            { type: 'NEW', text: 'Candidate portal — applicants can see their score breakdown and status.' },
            { type: 'NEW', text: 'API launched for Pro+ users (REST, 1,000 req/day).' },
            { type: 'IMPROVED', text: 'Improved red-flag detection for employment gap patterns.' },
            { type: 'FIX', text: 'Session timeout now properly clears auth state without flicker.' },
        ],
    },
    {
        version: 'v2.1.0', date: 'Jan 15, 2026',
        changes: [
            { type: 'NEW', text: 'Score weighting — recruiters can customize skill weights per job post.' },
            { type: 'IMPROVED', text: 'AI model updated with Q4 2025 training data. Accuracy up 4%.' },
            { type: 'FIX', text: 'Fixed mobile layout breakage on candidate dashboard.' },
            { type: 'FIX', text: 'Resolved rate limit bug affecting login on slow networks.' },
        ],
    },
    {
        version: 'v2.0.0', date: 'Jan 1, 2026',
        changes: [
            { type: 'NEW', text: 'Complete platform redesign — new dark UI with IntelliHire design system.' },
            { type: 'NEW', text: 'Migrated resume AI from GPT-3.5 to GPT-4 — 31% accuracy improvement.' },
            { type: 'NEW', text: 'Recruiter and candidate portals are now fully separated.' },
        ],
    },
];

const typeStyle = { NEW: { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }, IMPROVED: { background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }, FIX: { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' } };

export default function ChangelogPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ position: 'relative', padding: '120px 24px 64px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 12 }}>Changelog</h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 420, margin: '0 auto' }}>Every update, fix, and feature — in reverse chronological order.</p>
                </motion.div>
            </section>

            <section style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 100px' }}>
                <div style={{ position: 'relative' }}>
                    {/* Timeline line */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.06)' }} />

                    {ENTRIES.map((entry, i) => (
                        <motion.div key={i} style={{ paddingLeft: 32, marginBottom: 56, position: 'relative' }}
                            initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }}>
                            {/* Dot */}
                            <div style={{ position: 'absolute', left: -5, top: 16, width: 11, height: 11, borderRadius: '50%', background: entry.highlight ? '#6366f1' : '#1e293b', border: entry.highlight ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.15)', boxShadow: entry.highlight ? '0 0 12px rgba(99,102,241,0.4)' : 'none' }} />

                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{entry.version}</span>
                                {entry.highlight && <span style={{ background: GRAD, borderRadius: 6, padding: '2px 10px', fontSize: 10, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Latest</span>}
                                <span style={{ color: '#334155', fontSize: 13 }}>{entry.date}</span>
                            </div>

                            <div style={{ ...CARD, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12, borderColor: entry.highlight ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)' }}>
                                {entry.changes.map((c, ci) => (
                                    <div key={ci} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <span style={{ ...typeStyle[c.type], fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '2px 7px', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0, marginTop: 2 }}>{c.type}</span>
                                        <span style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.65 }}>{c.text}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
