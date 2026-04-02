import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BG = '#07090f';
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };

const VALUES = [
    { icon: '⚡', title: 'Speed matters', desc: 'Every day a great candidate waits is a day they could accept another offer. We ruthlessly optimise for speed.' },
    { icon: '🤝', title: 'Fair is non-negotiable', desc: 'AI should reduce bias, not amplify it. Every scoring decision is explainable and auditable.' },
    { icon: '🔍', title: 'Data > Gut feel', desc: 'Hiring intuition will always exist. We exist to make it better-informed, not to replace it.' },
    { icon: '🚀', title: 'Ship, learn, repeat', desc: "We move fast. If a feature doesn't solve a real recruiter problem, it doesn't ship." },
];

export default function AboutPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            {/* Hero */}
            <section style={{ position: 'relative', padding: '120px 24px 80px', textAlign: 'center', maxWidth: 800, margin: '0 auto', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#6366f1' }}>Our Story</span>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, margin: '16px 0', color: '#f1f5f9' }}>
                        We were tired of bad hiring software.
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', lineHeight: 1.85, maxWidth: 620, margin: '0 auto' }}>
                        IntelliHire was built by <strong style={{ color: '#a78bfa' }}>Prakul Dhiman</strong> in 2024 after watching companies lose great engineers to slow, broken hiring processes. Reviewing hundreds of resumes manually — in spreadsheets — felt like a problem AI could finally solve properly.
                    </p>
                </motion.div>
            </section>

            {/* Stats */}
            <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '52px 24px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
                    {[['2024', 'Founded'], ['1,200+', 'Companies'], ['2,800+', 'Jobs Filled'], ['GPT-4', 'AI Engine']].map(([v, l]) => (
                        <motion.div key={l} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{v}</div>
                            <div style={{ color: '#475569', fontSize: 14, marginTop: 6 }}>{l}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Values */}
            <section style={{ maxWidth: 960, margin: '0 auto', padding: '80px 24px' }}>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 48, textAlign: 'center' }}>
                    <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em' }}>What we believe</h2>
                </motion.div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                    {VALUES.map((v, i) => (
                        <motion.div key={i} style={{ ...CARD, padding: '28px 28px' }}
                            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                            <div style={{ fontSize: 28, marginBottom: 14 }}>{v.icon}</div>
                            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{v.title}</h3>
                            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75 }}>{v.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Builder / Founder Card */}
            <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 100px' }}>
                <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 36 }}>
                    <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em' }}>The person behind IntelliHire</h2>
                </motion.div>
                <motion.div style={{ ...CARD, padding: '40px 32px', borderTop: '2px solid #6366f1', textAlign: 'center' }}
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 900, margin: '0 auto 20px' }}>PD</div>
                    <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>Prakul Dhiman</div>
                    <div style={{ color: '#818cf8', fontSize: 13, fontWeight: 700, marginTop: 6, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Founder & Full-Stack Developer</div>
                    <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, maxWidth: 480, margin: '0 auto' }}>
                        Built IntelliHire from scratch — from the AI resume scoring engine to the real-time coding assessment platform. Passionate about using AI to make hiring faster, fairer, and smarter for everyone involved.
                    </p>
                </motion.div>
            </section>

            {/* CTA */}
            <section style={{ textAlign: 'center', padding: '0 24px 100px' }}>
                <div style={{ maxWidth: 520, margin: '0 auto', ...CARD, padding: '52px 40px', borderColor: 'rgba(99,102,241,0.25)' }}>
                    <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 24, marginBottom: 12, letterSpacing: '-0.02em' }}>Join the mission</h2>
                    <p style={{ color: '#64748b', marginBottom: 28, lineHeight: 1.7 }}>Try IntelliHire free today and see what AI-powered hiring actually looks like.</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GRAD, color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Get Started Free →</Link>
                        <Link to="/features" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '12px 24px', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}>See Features</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
