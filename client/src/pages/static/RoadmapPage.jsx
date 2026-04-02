import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BG = '#07090f';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const QUARTERS = [
    {
        label: 'Q1 2026 — In Progress', color: '#6366f1',
        items: [
            { title: 'Bulk Interview Scheduling', status: 'building', desc: 'One-click calendar links for shortlisted candidates, synced with Google Calendar and Outlook.' },
            { title: 'Custom Scoring Rubrics (Pro)', status: 'building', desc: 'Define exactly what a 10/10 looks like for every dimension. AI calibrates accordingly.' },
            { title: 'Chrome Extension', status: 'planned', desc: 'Screen LinkedIn profiles and GitHub accounts directly from your browser.' },
        ],
    },
    {
        label: 'Q2 2026 — Planned', color: '#8b5cf6',
        items: [
            { title: 'Video Interview Module', status: 'planned', desc: 'Async video answers with AI transcript and sentiment scoring built-in.' },
            { title: 'ATS Integrations (Lever, Greenhouse)', status: 'planned', desc: 'Sync IntelliHire shortlists directly into your existing ATS workflow.' },
            { title: 'Candidate Skill Development Mode', status: 'planned', desc: 'Show candidates exactly which skills to improve before reapplying.' },
        ],
    },
    {
        label: 'Q3 2026 — Exploring', color: '#3b82f6',
        items: [
            { title: 'Non-Engineering Roles', status: 'exploring', desc: 'Expand AI scoring to design, marketing, sales, and finance roles.' },
            { title: 'Team Collaboration Mode', status: 'exploring', desc: 'Multiple recruiters collaborating on a single role with voting and comments.' },
            { title: 'Predictive Offer Acceptance', status: 'exploring', desc: 'ML model that predicts whether a candidate will accept your offer based on market signals.' },
        ],
    },
];

const statusStyle = {
    building: { background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', label: '🔨 Building' },
    planned: { background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', label: '📋 Planned' },
    exploring: { background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', label: '🔍 Exploring' },
};

export default function RoadmapPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ position: 'relative', padding: '120px 24px 64px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 350, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 12 }}>Roadmap</h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.8 }}>
                        Here's where IntelliHire is headed. Built in public — updated every sprint.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                        {Object.entries(statusStyle).map(([k, v]) => (
                            <span key={k} style={{ ...v, borderRadius: 7, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>{v.label}</span>
                        ))}
                    </div>
                </motion.div>
            </section>

            <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>
                {QUARTERS.map((q, qi) => (
                    <div key={qi} style={{ marginBottom: 64 }}>
                        <motion.div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <div style={{ height: 2, width: 24, background: q.color, borderRadius: 99 }} />
                            <h2 style={{ color: q.color, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{q.label}</h2>
                        </motion.div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                            {q.items.map((item, i) => (
                                <motion.div key={i} style={{ ...CARD, padding: '24px 22px' }}
                                    initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                                    whileHover={{ borderColor: `${q.color}40`, y: -3 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                                        <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, lineHeight: 1.35 }}>{item.title}</h3>
                                        <span style={{ ...statusStyle[item.status], borderRadius: 6, padding: '2px 10px', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>{item.status}</span>
                                    </div>
                                    <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.75 }}>{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}

                <motion.div style={{ ...CARD, padding: '40px', textAlign: 'center', borderColor: 'rgba(99,102,241,0.2)' }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div style={{ fontSize: 30, marginBottom: 12 }}>💡</div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Have a feature request?</h3>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>We read every message. The roadmap is shaped by users like you.</p>
                    <a href="mailto:product@intellihire.dev" style={{ display: 'inline-flex', background: GRAD, border: 'none', color: '#fff', padding: '11px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Send Feedback →</a>
                </motion.div>
            </section>
        </div>
    );
}
