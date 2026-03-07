import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const BG = '#07090f';
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };

const Pill = ({ children }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 999, padding: '5px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#818cf8' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px #818cf8' }} />
        {children}
    </span>
);

const FEATURES = [
    {
        category: 'AI Core',
        color: '#6366f1',
        items: [
            { icon: '🧠', title: 'GPT-4 Resume Parsing', desc: 'Extracts skills, experience, certifications, and projects from any PDF or DOCX in under 30 seconds using GPT-4 semantic analysis.' },
            { icon: '🎯', title: 'Job-Spec Alignment Scoring', desc: 'Each resume is scored specifically against your job description — not a generic benchmark. Customize skill weights yourself.' },
            { icon: '🔍', title: 'Red Flag Detection', desc: 'Automatically identifies employment gaps, inconsistencies, and job-hopping patterns with recruiter-friendly flags.' },
            { icon: '📈', title: 'Continuous Model Learning', desc: 'The AI learns from your hiring decisions. Accept/reject signals improve shortlist quality over time.' },
        ],
    },
    {
        category: 'Assessments',
        color: '#10b981',
        items: [
            { icon: '💻', title: 'Live Coding Tests', desc: 'Auto-graded coding challenges in 12+ languages. Candidates solve real-world problems right in the browser.' },
            { icon: '🤖', title: 'AI Interview Scoring', desc: 'Evaluators submit interview scores which are weighted into the final candidate rank.' },
            { icon: '📝', title: 'Custom Rubrics', desc: 'Define exactly what a 10/10 answer looks like for any question, and the AI calibrates scores accordingly.' },
        ],
    },
    {
        category: 'Recruiter Tools',
        color: '#f59e0b',
        items: [
            { icon: '🏆', title: 'Ranked Leaderboard', desc: 'Drag-and-drop ranked candidate list with collapsible score breakdowns and side-by-side comparison mode.' },
            { icon: '📊', title: 'Hiring Analytics', desc: 'Pipeline funnel, pass rate by source, time-to-hire, and offer acceptance — all in one dashboard.' },
            { icon: '✉️', title: 'Automated Outreach', desc: 'Send personalized accept/reject emails automatically when you change a candidate\'s status.' },
            { icon: '🔗', title: 'Application Links', desc: 'Share a single magic link with candidates. They apply, test, and track status — no account needed.' },
        ],
    },
    {
        category: 'Platform',
        color: '#3b82f6',
        items: [
            { icon: '🔒', title: 'Role-Based Access', desc: 'Separate recruiter and candidate portals with granular permission controls.' },
            { icon: '⚡', title: 'Real-Time Updates', desc: 'Candidate scores and status changes reflect instantly across all recruiter views.' },
            { icon: '🌐', title: 'API Access', desc: 'Integrate IntelliHire with your ATS or HRIS using our REST API (Pro+).' },
        ],
    },
];

export default function FeaturesPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            {/* Hero */}
            <section style={{ position: 'relative', padding: '120px 24px 80px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <Pill>All Features</Pill>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginTop: 20, marginBottom: 18, maxWidth: 720, margin: '20px auto 18px' }}>
                        Everything you need to{' '}
                        <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>hire smarter</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.75 }}>
                        From AI resume parsing to live coding tests — IntelliHire replaces your entire screening stack.
                    </p>
                    <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GRAD, color: '#fff', padding: '13px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 0 36px rgba(99,102,241,0.4)' }}>
                        Start for Free →
                    </Link>
                </motion.div>
            </section>

            {/* Feature categories */}
            <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
                {FEATURES.map((cat, ci) => (
                    <div key={ci} style={{ marginBottom: 72 }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                <div style={{ height: 2, width: 24, background: cat.color, borderRadius: 99 }} />
                                <h2 style={{ color: cat.color, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cat.category}</h2>
                            </div>
                        </motion.div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                            {cat.items.map((f, i) => (
                                <motion.div key={i} style={{ ...CARD, padding: '28px 24px' }}
                                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                                    whileHover={{ borderColor: `${cat.color}40`, y: -4 }}>
                                    <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                                    <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{f.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75 }}>{f.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA */}
            <section style={{ textAlign: 'center', padding: '0 24px 100px' }}>
                <div style={{ maxWidth: 560, margin: '0 auto', ...CARD, padding: '56px 40px', borderColor: 'rgba(99,102,241,0.25)', boxShadow: '0 0 60px rgba(99,102,241,0.1)' }}>
                    <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 26, marginBottom: 12, letterSpacing: '-0.03em' }}>Ready to see it in action?</h2>
                    <p style={{ color: '#64748b', marginBottom: 28 }}>Start your free trial — no credit card required.</p>
                    <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GRAD, color: '#fff', padding: '13px 28px', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Get Started Free →</Link>
                </div>
            </section>
        </div>
    );
}
