import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const GRAD = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
const FadeUp = ({ children, delay = 0, style = {} }) => (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }} style={style}>
        {children}
    </motion.div>
);

const STARS = [1, 2, 3, 4, 5];
const TOPICS = ['General Feedback', 'Bug Report', 'Feature Request', 'Interview Experience', 'Coding Platform', 'Resume Builder', 'Other'];

export default function FeedbackPage() {
    const [form, setForm] = useState({ name: '', email: '', topic: 'General Feedback', rating: 5, message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [hover, setHover] = useState(0);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        // In production, this would POST to /api/feedback
        setSubmitted(true);
    };

    return (
        <div style={{ background: '#07090f', minHeight: '100vh', paddingTop: 80 }}>

            {/* ── HERO ─────────────────────────────────────────── */}
            <section style={{ padding: '60px 24px 0', textAlign: 'center' }}>
                <FadeUp>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
                        💬 We'd love to hear from you
                    </div>
                    <h1 style={{ fontSize: 'clamp(32px,5vw,54px)', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.04em', lineHeight: 1.1, margin: '0 auto 16px', maxWidth: 640 }}>
                        Share Your <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Feedback</span>
                    </h1>
                    <p style={{ color: '#64748b', fontSize: 17, maxWidth: 500, margin: '0 auto 60px', lineHeight: 1.7 }}>
                        Help us improve IntelliHire. Your feedback shapes what we build next.
                    </p>
                </FadeUp>
            </section>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px', display: 'grid', gridTemplateColumns: 'minmax(260px,380px) 1fr', gap: 40, alignItems: 'start' }}>

                {/* ── LEFT — Contact Info ───────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Builder card */}
                    <FadeUp delay={0.1}>
                        <div style={{ padding: '28px 24px', borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>PD</div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>Prakul Dhiman</div>
                                    <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Founder & Full-Stack Developer</div>
                                </div>
                            </div>
                            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.75, margin: 0 }}>
                                Built IntelliHire from scratch — the AI resume engine, live interview room, and coding platform. Always open to feedback and collaboration.
                            </p>
                        </div>
                    </FadeUp>

                    {/* Contact details */}
                    {[
                        { icon: '✉️', label: 'Email', value: 'prakul.dhiman85@gmail.com', href: 'mailto:prakul.dhiman85@gmail.com' },
                        { icon: '📞', label: 'Phone / WhatsApp', value: '+91 6234543950', href: 'tel:+916234543950' },
                        { icon: '💼', label: 'LinkedIn', value: 'linkedin.com/in/prakuldhiman', href: 'https://linkedin.com/in/prakuldhiman' },
                        { icon: '🐙', label: 'GitHub', value: 'github.com/prakuldhiman', href: 'https://github.com/prakuldhiman' },
                    ].map((c, i) => (
                        <FadeUp key={c.label} delay={0.15 + i * 0.07}>
                            <a href={c.href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{c.icon}</div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{c.label}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{c.value}</div>
                                </div>
                            </a>
                        </FadeUp>
                    ))}

                    {/* Response time badge */}
                    <FadeUp delay={0.5}>
                        <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 18 }}>⚡</span>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399' }}>Avg. Response Time</div>
                                <div style={{ fontSize: 12, color: '#475569' }}>Within 24 hours on all channels</div>
                            </div>
                        </div>
                    </FadeUp>
                </div>

                {/* ── RIGHT — Feedback Form ─────────────────────── */}
                <FadeUp delay={0.2}>
                    <div style={{ padding: '36px 38px', borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)' }}>

                        {submitted ? (
                            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 20px' }}>
                                <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
                                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>Thank you, {form.name.split(' ')[0]}!</h2>
                                <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>Your feedback has been received. Prakul will get back to you at <strong style={{ color: '#818cf8' }}>{form.email}</strong> within 24 hours.</p>
                                <button onClick={() => setSubmitted(false)} style={{ padding: '12px 32px', borderRadius: 12, background: GRAD, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                                    Send Another
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                                <div>
                                    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', margin: '0 0 6px' }}>Send us a message</h2>
                                    <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>All fields marked * are required</p>
                                </div>

                                {/* Name + Email row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <FormField label="Your Name *" placeholder="John Doe" value={form.name} onChange={v => set('name', v)} />
                                    <FormField label="Email Address *" type="email" placeholder="you@example.com" value={form.email} onChange={v => set('email', v)} />
                                </div>

                                {/* Topic */}
                                <div>
                                    <label style={labelStyle}>Topic</label>
                                    <select value={form.topic} onChange={e => set('topic', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                        {TOPICS.map(t => <option key={t} value={t} style={{ background: '#111' }}>{t}</option>)}
                                    </select>
                                </div>

                                {/* Star rating */}
                                <div>
                                    <label style={labelStyle}>Overall Rating</label>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                                        {STARS.map(s => (
                                            <button key={s} type="button"
                                                onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                                                onClick={() => set('rating', s)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, transition: 'transform 0.15s', transform: hover >= s || form.rating >= s ? 'scale(1.15)' : 'scale(1)', color: hover >= s ? '#fbbf24' : form.rating >= s ? '#f59e0b' : '#1e293b' }}>
                                                ★
                                            </button>
                                        ))}
                                        <span style={{ alignSelf: 'center', fontSize: 13, color: '#475569', marginLeft: 4 }}>
                                            {form.rating === 5 ? 'Excellent!' : form.rating === 4 ? 'Good' : form.rating === 3 ? 'Average' : form.rating === 2 ? 'Needs work' : 'Poor'}
                                        </span>
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label style={labelStyle}>Message *</label>
                                    <textarea
                                        value={form.message} onChange={e => set('message', e.target.value)}
                                        placeholder="Tell us what you think, what you'd like improved, or any issues you encountered..."
                                        rows={5}
                                        style={{ ...inputStyle, resize: 'vertical', minHeight: 120, maxHeight: 280 }}
                                    />
                                </div>

                                <button type="submit" disabled={!form.name || !form.email || !form.message}
                                    style={{ padding: '14px 0', borderRadius: 13, background: form.name && form.email && form.message ? GRAD : 'rgba(255,255,255,0.05)', color: form.name && form.email && form.message ? '#fff' : '#475569', border: 'none', fontSize: 15, fontWeight: 700, cursor: form.name && form.email && form.message ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: form.name && form.email && form.message ? '0 8px 24px rgba(99,102,241,0.3)' : 'none' }}>
                                    Send Feedback →
                                </button>
                            </form>
                        )}
                    </div>
                </FadeUp>
            </div>

            {/* Responsive grid */}
            <style>{`@media(max-width:768px){ .feedback-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

/* ── Small helpers ── */
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'block' };
const inputStyle = { width: '100%', background: 'rgba(15,15,25,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', fontSize: 14, color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' };

function FormField({ label, placeholder, value, onChange, type = 'text' }) {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ ...inputStyle, borderColor: focused ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)' }} />
        </div>
    );
}
