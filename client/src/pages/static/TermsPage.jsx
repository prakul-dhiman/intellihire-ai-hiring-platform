import { motion } from 'framer-motion';

const BG = '#07090f';
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const SECTIONS = [
    { title: '1. Acceptance of Terms', body: 'By accessing or using IntelliHire (the "Platform"), you agree to be bound by these Terms of Service. If you are using the Platform on behalf of a company, you represent that you have authority to bind that company.' },
    { title: '2. Description of Service', body: 'IntelliHire provides AI-powered resume screening, coding assessments, and candidate ranking software to companies ("Recruiters") and job seekers ("Candidates"). The Platform is provided "as is" with the features and limitations described in your subscription tier.' },
    { title: '3. Accounts', body: 'You must provide accurate registration information. You are responsible for all activity under your account. Accounts must not be shared. You must be at least 18 years old to use the Platform.' },
    { title: '4. Acceptable Use', body: 'You agree not to: (a) use the Platform to discriminate unlawfully, (b) reverse-engineer the AI scoring system, (c) scrape or bulk-export candidate data, (d) upload malicious files, (e) impersonate another person or company, or (f) exceed API rate limits specified in your plan.' },
    { title: '5. AI Scoring Disclaimer', body: 'IntelliHire\'s AI scores are advisory tools to assist human decision-making. They do not constitute legal employment decisions. Recruiters remain solely responsible for all hiring decisions. IntelliHire is not liable for outcomes of hiring decisions made using the Platform.' },
    { title: '6. Data Ownership', body: 'You retain ownership of all candidate data and job postings you upload to IntelliHire. By uploading data, you grant IntelliHire a limited license to process it solely to provide the Service. IntelliHire does not use your data to train public AI models.' },
    { title: '7. Subscription & Billing', body: 'Pro subscriptions are billed monthly or annually in advance. Enterprise plans are billed per custom agreement. Refunds are not issued for partial months. We reserve the right to suspend accounts that are 30+ days overdue.' },
    { title: '8. Limitation of Liability', body: 'To the maximum extent permitted by law, IntelliHire\'s liability for any claim is limited to the amounts you paid in the 12 months preceding the event. IntelliHire is not liable for indirect, incidental, or consequential damages.' },
    { title: '9. Termination', body: 'You may terminate your account at any time. We may terminate or suspend access for material breach of these Terms. Upon termination, your data will be retained for 30 days before deletion (unless otherwise required by law).' },
    { title: '10. Governing Law', body: 'These Terms are governed by the laws of the State of Delaware, USA. Disputes shall be resolved by binding arbitration under AAA rules, except for claims of injunctive relief.' },
    { title: '11. Contact', body: 'Questions about these Terms: legal@intellihire.dev. IntelliHire, Inc. — Registered in Delaware, USA.' },
];

export default function TermsPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ maxWidth: 760, margin: '0 auto', padding: '120px 24px 100px' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <p style={{ color: '#6366f1', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Legal</p>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 12 }}>Terms of Service</h1>
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
