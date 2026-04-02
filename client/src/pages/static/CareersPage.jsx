import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BG = '#07090f';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const JOBS = [
    {
        dept: 'Engineering', roles: [
            { title: 'Senior Full-Stack Engineer', type: 'Full-time', loc: 'Remote (India / EU)', desc: 'Own features end-to-end — from DB schema to polished UI. You will work closely with our CTO on the AI scoring pipeline and recruiter dashboard.' },
            { title: 'ML Engineer — NLP', type: 'Full-time', loc: 'Remote', desc: 'Fine-tune our GPT-4 resume analysis pipeline. Your work directly influences how 2,800+ hires happen each month.' },
        ]
    },
    {
        dept: 'Design', roles: [
            { title: 'Product Designer', type: 'Full-time', loc: 'Remote', desc: 'Design the experience for both recruiters and candidates. You will own end-to-end product design using Figma and collaborate daily with engineering.' },
        ]
    },
    {
        dept: 'Sales & Growth', roles: [
            { title: 'Account Executive (Mid-Market)', type: 'Full-time', loc: 'Mumbai / Remote', desc: 'Close deals with engineering-led companies hiring 5–50 engineers per year. Strong pipeline, outbound motion, and growing inbound.' },
            { title: 'Head of Growth', type: 'Full-time', loc: 'Remote', desc: 'Own our acquisition and retention strategy. Work directly with founders. Data-driven, creative, and comfortable experimenting daily.' },
        ]
    },
];

const PERKS = [
    { icon: '🏡', title: 'Remote-first forever', desc: 'Work from anywhere in the world. We build for async.' },
    { icon: '💰', title: 'Competitive equity', desc: 'Early-stage opportunity with meaningful ownership.' },
    { icon: '🏥', title: 'Full health coverage', desc: 'Health, dental, and vision for you and dependents.' },
    { icon: '📚', title: 'Learning budget', desc: '$1,200/year for courses, books, and conferences.' },
    { icon: '🖥️', title: 'Hardware budget', desc: '$1,500 on day one to set up your perfect workspace.' },
    { icon: '⏰', title: 'Async-first culture', desc: 'Meetings only when needed. Your calendar is yours.' },
];

export default function CareersPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ position: 'relative', padding: '120px 24px 80px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 350, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6366f1' }}>Careers</span>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px 0 16px', color: '#f1f5f9' }}>Help us fix hiring.</h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>
                        We are a small, opinionated team building tools that improve how engineers get hired. We move fast, ship often, and care deeply about craft.
                    </p>
                </motion.div>
            </section>

            {/* Perks */}
            <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 72px' }}>
                <motion.h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 22, marginBottom: 28, letterSpacing: '-0.02em' }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Why join us</motion.h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 72 }}>
                    {PERKS.map((p, i) => (
                        <motion.div key={i} style={{ ...CARD, padding: '24px' }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                            <div style={{ fontSize: 26, marginBottom: 12 }}>{p.icon}</div>
                            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.title}</div>
                            <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{p.desc}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Jobs */}
                <motion.h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 22, marginBottom: 32, letterSpacing: '-0.02em' }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Open Roles</motion.h2>
                {JOBS.map((dept, di) => (
                    <div key={di} style={{ marginBottom: 48 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ height: 2, width: 20, background: '#6366f1', borderRadius: 99 }} />
                            <span style={{ color: '#6366f1', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{dept.dept}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {dept.roles.map((role, ri) => (
                                <motion.div key={ri} style={{ ...CARD, padding: '28px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}
                                    initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                    whileHover={{ borderColor: 'rgba(99,102,241,0.25)' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{role.title}</h3>
                                        <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                                            <span style={{ color: '#475569', fontSize: 13 }}>📍 {role.loc}</span>
                                            <span style={{ color: '#475569', fontSize: 13 }}>⏱ {role.type}</span>
                                        </div>
                                        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75 }}>{role.desc}</p>
                                    </div>
                                    <a href="mailto:jobs@intellihire.dev" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: GRAD, color: '#fff', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>Apply →</a>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}

                <motion.div style={{ ...CARD, padding: '40px', textAlign: 'center', borderColor: 'rgba(99,102,241,0.2)', marginTop: 40 }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>💌</div>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Don't see a fit?</h3>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>We hire for talent over titles. Send us a note anyway.</p>
                    <a href="mailto:jobs@intellihire.dev" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '11px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>jobs@intellihire.dev →</a>
                </motion.div>
            </section>
        </div>
    );
}
