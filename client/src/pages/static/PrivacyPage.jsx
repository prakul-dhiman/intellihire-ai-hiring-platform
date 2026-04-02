import { motion } from 'framer-motion';

const BG = '#07090f';
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const SECTIONS = [
    { title: '1. Information We Collect', body: 'We collect information you provide directly: name, email address, resume content (if uploaded), and coding assessment results. We also collect usage data: pages visited, features used, and browser/device information via our analytics provider (PostHog). We do not sell your data, ever.' },
    { title: '2. How We Use Your Information', body: 'We use your information to: (a) provide and improve the IntelliHire platform, (b) generate AI-powered resume scores and candidate rankings for recruiters, (c) send transactional emails (account confirmation, status updates), and (d) respond to support requests. We do not use your data to train external AI models without explicit consent.' },
    { title: '3. Data Sharing', body: 'We share your information with: our infrastructure providers (MongoDB Atlas, AWS — under DPA), AI processing APIs (OpenAI — under DPA and data usage restrictions), and payment processors (Stripe). We will never sell or broker your personal data to third parties for marketing purposes.' },
    { title: '4. Data Retention', body: 'Resume data and application records are retained for 90 days after job post closure by default. Recruiters may configure custom retention windows. You may request deletion of your data at any time by emailing privacy@intellihire.dev.' },
    { title: '5. Cookies', body: 'We use essential cookies for authentication (JWT stored in httpOnly cookies). We use optional analytics cookies (PostHog) which you can decline. We do not use advertising or tracking cookies.' },
    { title: '6. Your Rights', body: 'Depending on your jurisdiction, you may have the right to: access your personal data, correct inaccuracies, request deletion, restrict or object to processing, and data portability. Submit requests to privacy@intellihire.dev. We respond within 30 days.' },
    { title: '7. Security', body: 'We encrypt all data in transit (TLS 1.3) and at rest (AES-256). Access to production databases is restricted to authenticated engineers via VPN with MFA. We conduct annual penetration tests.' },
    { title: '8. Changes to This Policy', body: 'We may update this policy periodically. Material changes will be communicated via email 30 days before taking effect. Continued use of the platform after that date constitutes acceptance.' },
    { title: '9. Contact', body: 'For privacy-related questions: privacy@intellihire.dev. Our Data Protection Officer can be reached at dpo@intellihire.dev. IntelliHire, Inc., Remote (Registered in Delaware, USA).' },
];

export default function PrivacyPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ maxWidth: 760, margin: '0 auto', padding: '120px 24px 100px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <p style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Legal</p>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 12 }}>Privacy Policy</h1>
                    <p style={{ color: '#475569', fontSize: 14, marginBottom: 48 }}>Last updated: March 1, 2026</p>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                    {SECTIONS.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.04 }}>
                            <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 12, letterSpacing: '-0.02em' }}>{s.title}</h2>
                            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.85 }}>{s.body}</p>
                            {i < SECTIONS.length - 1 && <div style={{ marginTop: 32, height: 1, background: 'rgba(255,255,255,0.05)' }} />}
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
