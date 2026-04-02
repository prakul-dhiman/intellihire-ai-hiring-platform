import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

const BG = '#07090f';
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };

const PLANS = [
    {
        name: 'Starter', price: 0, period: 'Forever free',
        desc: 'Perfect for small startups and solo recruiters testing the waters.',
        color: '#94a3b8',
        features: ['5 active job posts', '50 candidates / month', 'AI resume scoring', 'Basic dashboard', 'Standard support'],
        notIncluded: ['Coding assessments', 'Advanced analytics', 'API access', 'Custom scoring rubrics'],
        cta: 'Get started free',
    },
    {
        name: 'Pro', price: 49, period: 'per month',
        desc: "For growing engineering teams actively hiring across multiple roles.",
        color: '#818cf8',
        highlight: true,
        features: ['Unlimited job posts', '500 candidates / month', 'AI resume scoring', 'Live coding assessments', 'Advanced analytics', 'Bulk email outreach', 'API access (1,000 req/day)', 'Priority support'],
        notIncluded: ['Custom AI tuning', 'SSO / SAML', 'Dedicated CSM'],
        cta: 'Start 14-day trial',
    },
    {
        name: 'Enterprise', price: null, period: 'Custom pricing',
        desc: 'For large organizations with custom workflows and compliance requirements.',
        color: '#a78bfa',
        features: ['Unlimited everything', 'Custom AI model tuning', 'SSO / SAML / SCIM', 'Dedicated Customer Success Manager', 'SLA (99.9% uptime)', 'On-prem deployment option', 'Custom integrations', 'GDPR / SOC 2 compliance'],
        notIncluded: [],
        cta: 'Talk to sales',
    },
];

const FAQS = [
    { q: 'Can I upgrade or downgrade at any time?', a: 'Yes. You can change your plan anytime. Upgrades take effect immediately, downgrades apply at the end of your billing cycle.' },
    { q: 'What happens when I hit my candidate limit?', a: 'We notify you at 80% usage. You can upgrade at any time or wait for the next billing cycle to reset.' },
    { q: 'Is there a long-term contract?', a: 'No contracts. All plans are month-to-month. Pay annually for a 20% discount.' },
    { q: 'Do you offer nonprofit or education discounts?', a: 'Yes — reach out to our team at hello@intellihire.dev for special pricing.' },
    { q: 'How does the 14-day trial work?', a: 'Full Pro access for 14 days, no credit card required. You will be notified before the trial ends.' },
];

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);

    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ position: 'relative', padding: '120px 24px 64px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16 }}>
                        Simple, honest{' '}
                        <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pricing</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto 32px', lineHeight: 1.75 }}>
                        Start free. Scale when ready. No hidden fees, no surprises.
                    </p>

                    {/* Toggle */}
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '6px 8px', marginBottom: 64 }}>
                        <button onClick={() => setAnnual(false)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: !annual ? 'rgba(99,102,241,0.2)' : 'transparent', color: !annual ? '#818cf8' : '#475569', transition: 'all 0.2s' }}>Monthly</button>
                        <button onClick={() => setAnnual(true)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: annual ? 'rgba(99,102,241,0.2)' : 'transparent', color: annual ? '#818cf8' : '#475569', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                            Annual <span style={{ background: '#059669', color: '#fff', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>SAVE 20%</span>
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Plans */}
            <section style={{ maxWidth: 1060, margin: '0 auto', padding: '0 24px 100px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {PLANS.map((plan, i) => (
                        <motion.div key={i} style={{ ...CARD, padding: '36px 28px', position: 'relative', borderColor: plan.highlight ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)', boxShadow: plan.highlight ? '0 0 56px rgba(99,102,241,0.15)' : 'none' }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}>
                            {plan.highlight && (
                                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: GRAD, borderRadius: 999, padding: '4px 16px', fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Most Popular</div>
                            )}
                            <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: plan.color, marginBottom: 12 }}>{plan.name}</div>
                            <div style={{ marginBottom: 8 }}>
                                {plan.price === null ? (
                                    <span style={{ fontSize: 38, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.04em' }}>Custom</span>
                                ) : plan.price === 0 ? (
                                    <span style={{ fontSize: 38, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.04em' }}>Free</span>
                                ) : (
                                    <><span style={{ fontSize: 38, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.04em' }}>${annual ? Math.round(plan.price * 0.8) : plan.price}</span><span style={{ color: '#475569', fontSize: 14 }}> / mo</span></>
                                )}
                            </div>
                            <div style={{ fontSize: 12, color: '#334155', marginBottom: 16 }}>{annual && plan.price ? `Billed $${Math.round(plan.price * 0.8 * 12)}/year` : plan.period}</div>
                            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>{plan.desc}</p>

                            <Link to={plan.price === null ? '#' : '/register'} style={{ display: 'block', textAlign: 'center', background: plan.highlight ? GRAD : 'rgba(255,255,255,0.06)', border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 28, boxShadow: plan.highlight ? '0 6px 24px rgba(99,102,241,0.35)' : 'none' }}>
                                {plan.cta} →
                            </Link>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {plan.features.map((f, j) => (
                                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <span style={{ color: '#34d399', fontWeight: 700, flexShrink: 0 }}>✓</span>
                                        <span style={{ color: '#94a3b8', fontSize: 14 }}>{f}</span>
                                    </div>
                                ))}
                                {plan.notIncluded.map((f, j) => (
                                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <span style={{ color: '#334155', fontWeight: 700, flexShrink: 0 }}>✗</span>
                                        <span style={{ color: '#334155', fontSize: 14 }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ */}
                <div style={{ maxWidth: 640, margin: '80px auto 0' }}>
                    <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 24, textAlign: 'center', marginBottom: 36, letterSpacing: '-0.03em' }}>Frequently asked</h2>
                    {FAQS.map((faq, i) => (
                        <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                            <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', color: '#f1f5f9', fontSize: 15, fontWeight: 600, padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
                                {faq.q}
                                <motion.span animate={{ rotate: activeFaq === i ? 45 : 0 }} style={{ color: '#6366f1', fontSize: 22, flexShrink: 0 }}>+</motion.span>
                            </button>
                            {activeFaq === i && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8, paddingBottom: 20 }}>{faq.a}</p>
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
