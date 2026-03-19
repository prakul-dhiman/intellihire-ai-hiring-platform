import { motion } from 'framer-motion';

const BG = '#07090f';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const COVERAGE = [
    { title: '"IntelliHire Raises $3.2M to Bring AI to Technical Recruiting"', outlet: 'TechCrunch', date: 'Feb 10, 2026', link: '#' },
    { title: '"The AI That\'s Finally Making Hiring Fair for Engineers"', outlet: 'The Information', date: 'Jan 28, 2026', link: '#' },
    { title: '"Beyond Keywords: How IntelliHire\'s Semantic AI Screens Resumes"', outlet: 'VentureBeat', date: 'Jan 15, 2026', link: '#' },
    { title: '"IntelliHire is the Hiring Tool That Actually Works"', outlet: 'Product Hunt #1 of the Day', date: 'Dec 18, 2025', link: '#' },
];

export default function PressPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ position: 'relative', padding: '120px 24px 64px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 14 }}>Press & Media</h1>
                    <p style={{ color: '#64748b', maxWidth: 440, margin: '0 auto', lineHeight: 1.8 }}>Coverage, assets, and media contacts for journalists and creators writing about IntelliHire.</p>
                </motion.div>
            </section>

            <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 24px 100px' }}>
                {/* Press kit */}
                <motion.div style={{ ...CARD, padding: '36px 32px', borderColor: 'rgba(99,102,241,0.2)', marginBottom: 56 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                        <div>
                            <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 20, marginBottom: 8, letterSpacing: '-0.02em' }}>Press Kit</h2>
                            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75, maxWidth: 420 }}>Download our logo pack, brand guidelines, product screenshots, and boilerplate company description.</p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
                                {['Logo Pack (SVG + PNG)', 'Brand Guidelines', 'Product Screenshots', 'Boilerplate'].map(a => (
                                    <a key={a} href="#" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '7px 14px', borderRadius: 8, fontSize: 13, textDecoration: 'none', fontWeight: 600 }}>↓ {a}</a>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 200 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#334155' }}>Press Contact</p>
                            <p style={{ color: '#94a3b8', fontSize: 14 }}>press@intellihire.dev</p>
                            <p style={{ color: '#475569', fontSize: 13 }}>Response within 24 hours</p>
                        </div>
                    </div>
                </motion.div>

                {/* Coverage */}
                <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 20, marginBottom: 24, letterSpacing: '-0.02em' }}>Media Coverage</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {COVERAGE.map((c, i) => (
                        <motion.a key={i} href={c.link} style={{ ...CARD, padding: '22px 24px', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}
                            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                            whileHover={{ borderColor: 'rgba(99,102,241,0.25)', x: 4 }}>
                            <div>
                                <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 15, lineHeight: 1.45, marginBottom: 6 }}>{c.title}</p>
                                <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                                    <span style={{ color: '#818cf8', fontWeight: 700 }}>{c.outlet}</span>
                                    <span style={{ color: '#334155' }}>{c.date}</span>
                                </div>
                            </div>
                            <span style={{ color: '#475569', fontSize: 20 }}>→</span>
                        </motion.a>
                    ))}
                </div>

                {/* Boilerplate */}
                <motion.div style={{ ...CARD, padding: '32px 28px', marginTop: 48 }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Company Boilerplate</h3>
                    <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.85, fontStyle: 'italic', borderLeft: '2px solid rgba(99,102,241,0.3)', paddingLeft: 16 }}>
                        IntelliHire is an AI-powered hiring platform built by <strong style={{ color: '#a78bfa', fontStyle: 'normal' }}>Prakul Dhiman</strong>. Founded in 2024, IntelliHire automates resume screening, coding assessments, and candidate ranking — helping recruiters hire the best engineers 10× faster. The platform has helped 1,200+ companies fill over 2,800 technical roles. Learn more at intellihire.dev.
                    </p>
                </motion.div>
            </section>
        </div>
    );
}
