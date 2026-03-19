import { motion } from 'framer-motion';

const BG = '#07090f';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const MEASURES = [
    { icon: '🔐', title: 'Encryption in Transit', desc: 'All data transmitted between your browser and IntelliHire servers is encrypted using TLS 1.3. We enforce HTTPS on all endpoints — no exceptions.' },
    { icon: '🗄️', title: 'Encryption at Rest', desc: 'All databases are encrypted using AES-256. MongoDB Atlas volumes are encrypted with cloud-provider-managed keys.' },
    { icon: '🔑', title: 'Authentication', desc: 'We use short-lived JWTs (15-minute expiry) with refresh token rotation. MFA is available on all Pro and Enterprise accounts.' },
    { icon: '🚧', title: 'Access Controls', desc: 'Production database access requires VPN + MFA. Engineers access only the minimum data required for their role (principle of least privilege).' },
    { icon: '🧪', title: 'Penetration Testing', desc: 'Annual third-party penetration tests are conducted by an independent security firm. Critical findings are resolved within 48 hours.' },
    { icon: '📋', title: 'Audit Logging', desc: 'All admin actions and data access events are logged with immutable audit trails. Logs are retained for 12 months.' },
    { icon: '🔄', title: 'Backups', desc: 'Automated daily backups with point-in-time recovery (PITR) for up to 7 days. Backups are stored in geographically separate regions.' },
    { icon: '🚨', title: 'Incident Response', desc: 'We maintain a documented incident response plan. In the event of a breach affecting your data, we notify affected users within 72 hours per GDPR requirements.' },
];

export default function SecurityPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ position: 'relative', padding: '120px 24px 64px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 14 }}>Security at IntelliHire</h1>
                    <p style={{ color: '#64748b', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.8, fontSize: '1.05rem' }}>
                        We treat your candidate data with the same care you expect when making hiring decisions. Here's exactly how we protect it.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['SOC 2 Type II (In Progress)', 'GDPR Compliant', 'TLS 1.3', 'AES-256'].map(b => (
                            <span key={b} style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700 }}>✓ {b}</span>
                        ))}
                    </div>
                </motion.div>
            </section>

            <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 100px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, marginBottom: 64 }}>
                    {MEASURES.map((m, i) => (
                        <motion.div key={i} style={{ ...CARD, padding: '28px 24px' }}
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                            whileHover={{ borderColor: 'rgba(52,211,153,0.2)', y: -3 }}>
                            <div style={{ fontSize: 28, marginBottom: 14 }}>{m.icon}</div>
                            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{m.title}</h3>
                            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75 }}>{m.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Responsible disclosure */}
                <motion.div style={{ ...CARD, padding: '40px 36px', borderColor: 'rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.03)' }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 32, flexShrink: 0 }}>🐛</div>
                        <div>
                            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>Responsible Disclosure</h3>
                            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8, maxWidth: 580, marginBottom: 16 }}>
                                Found a vulnerability? We take security reports seriously and respond within 24 hours. We do not pursue legal action against good-faith reporters. Please do not disclose publicly before we have had a chance to patch.
                            </p>
                            <a href="mailto:security@intellihire.dev" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                                security@intellihire.dev →
                            </a>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
