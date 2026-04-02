import { motion } from 'framer-motion';

const BG = '#07090f';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const RIGHTS = [
    { icon: '👁️', title: 'Right of Access', desc: 'You have the right to request a copy of all personal data we hold about you. We will respond within 30 days.' },
    { icon: '✏️', title: 'Right to Rectification', desc: 'You can request correction of inaccurate or incomplete personal data at any time.' },
    { icon: '🗑️', title: 'Right to Erasure', desc: 'You may request deletion of your personal data ("right to be forgotten") where no legal obligation requires retention.' },
    { icon: '⛔', title: 'Right to Restrict Processing', desc: 'You can request that we limit how we use your data while a correction or objection is being resolved.' },
    { icon: '📦', title: 'Right to Data Portability', desc: 'Request a machine-readable export of your data (JSON or CSV) to transfer to another service.' },
    { icon: '🙅', title: 'Right to Object', desc: 'You can object to processing based on legitimate interests or for direct marketing at any time.' },
];

const SECTIONS = [
    { title: 'Data Controller', body: 'IntelliHire, Inc. acts as the Data Controller for personal data collected through the Platform. Our Data Protection Officer can be reached at dpo@intellihire.dev.' },
    { title: 'Lawful Basis for Processing', body: 'We process candidate personal data under the following lawful bases: (a) Contract — to deliver the services described in your subscription; (b) Legitimate Interests — platform improvement and fraud prevention; (c) Consent — for optional analytics cookies and marketing communications.' },
    { title: 'Data Transfers', body: 'IntelliHire processes data primarily within the EU and USA. Where data is transferred to third parties outside the EEA (e.g., OpenAI for AI processing), we ensure Standard Contractual Clauses (SCCs) are in place.' },
    { title: 'Retention', body: 'Resume and application data is retained for 90 days after job post closure by default. Account data is retained for 30 days after account deletion. You may configure custom retention windows on Pro and Enterprise plans.' },
    { title: 'Automated Decision-Making', body: 'IntelliHire\'s AI scoring constitutes automated processing of personal data. Candidates have the right to request human review of AI-generated scores and to object to automated-only decisions. Recruiters are instructed never to rely solely on AI scores.' },
    { title: 'How to Exercise Your Rights', body: 'Submit requests to privacy@intellihire.dev. Please include your full name and the email address associated with your account. We respond within 30 calendar days. For complex requests, we may extend by 60 days and will notify you.' },
    { title: 'Supervisory Authority', body: 'If you believe we have not handled your data lawfully, you have the right to lodge a complaint with your national Data Protection Authority. For UK residents: the ICO (ico.org.uk). For EU residents: your local DPA.' },
];

export default function GDPRPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ position: 'relative', padding: '120px 24px 64px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 14 }}>GDPR Compliance</h1>
                    <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        IntelliHire is committed to full compliance with the General Data Protection Regulation (EU) 2016/679. Here's how we protect the rights of EU and UK data subjects.
                    </p>
                </motion.div>
            </section>

            <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 100px' }}>
                {/* Rights grid */}
                <motion.h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 22, marginBottom: 28, letterSpacing: '-0.02em' }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Your Rights Under GDPR</motion.h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 64 }}>
                    {RIGHTS.map((r, i) => (
                        <motion.div key={i} style={{ ...CARD, padding: '24px' }}
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                            whileHover={{ borderColor: 'rgba(99,102,241,0.25)', y: -3 }}>
                            <div style={{ fontSize: 26, marginBottom: 12 }}>{r.icon}</div>
                            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{r.title}</h3>
                            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75 }}>{r.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Detailed sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    {SECTIONS.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.04 }}>
                            <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, marginBottom: 10, letterSpacing: '-0.02em' }}>{s.title}</h2>
                            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.85 }}>{s.body}</p>
                            {i < SECTIONS.length - 1 && <div style={{ marginTop: 28, height: 1, background: 'rgba(255,255,255,0.05)' }} />}
                        </motion.div>
                    ))}
                </div>

                {/* Contact */}
                <motion.div style={{ ...CARD, padding: '36px', marginTop: 52, borderColor: 'rgba(99,102,241,0.2)', textAlign: 'center' }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Exercise a GDPR Right</h3>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20, lineHeight: 1.7 }}>Email our DPO with your request and we will respond within 30 days.</p>
                    <a href="mailto:dpo@intellihire.dev" style={{ display: 'inline-flex', background: GRAD, border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>dpo@intellihire.dev →</a>
                </motion.div>
            </section>
        </div>
    );
}
