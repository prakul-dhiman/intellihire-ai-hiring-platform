import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BG = '#07090f';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';

const POSTS = [
    { tag: 'Engineering', tagColor: '#818cf8', title: 'How We Built an AI That Scores Resumes in Under 30 Seconds', date: 'Mar 5, 2026', mins: 8, excerpt: 'A deep dive into our GPT-4 prompt chain, vector embeddings, and the ranking pipeline that powers IntelliHire\'s core feature.' },
    { tag: 'Product', tagColor: '#34d399', title: 'Introducing Live Coding Assessments 2.0', date: 'Feb 28, 2026', mins: 5, excerpt: 'We rebuilt our coding test runner from scratch. Here\'s what changed, why, and how to get the most out of it for your next hire.' },
    { tag: 'Hiring Insights', tagColor: '#fbbf24', title: 'The 5 Biggest Mistakes Recruiters Make When Screening Engineers', date: 'Feb 20, 2026', mins: 6, excerpt: 'Based on data from 2,800+ successful hires on IntelliHire, here are the patterns that separate the best hiring teams from the rest.' },
    { tag: 'Company', tagColor: '#f87171', title: 'We Raised $3.2M to Kill the Hiring Spreadsheet', date: 'Feb 10, 2026', mins: 4, excerpt: 'Announcing our seed round led by Accel Partners. Here\'s what we\'re building and why we think AI hiring is just getting started.' },
    { tag: 'Engineering', tagColor: '#818cf8', title: 'Why We Chose MongoDB for a Real-Time Hiring Platform', date: 'Jan 30, 2026', mins: 7, excerpt: 'A technical breakdown of our data model, schema design, and the query patterns that keep IntelliHire fast at scale.' },
    { tag: 'Hiring Insights', tagColor: '#fbbf24', title: 'How Bias Sneaks Into Resumes — And How AI Can Help', date: 'Jan 18, 2026', mins: 9, excerpt: 'A look at NLP research on language bias in resumes and how we built fairness guardrails into the IntelliHire scoring engine.' },
];

export default function BlogPage() {
    return (
        <div style={{ background: BG, color: '#e2e8f0', minHeight: '100vh', fontFamily: "'Inter',sans-serif", overflowX: 'hidden' }}>
            <section style={{ position: 'relative', padding: '120px 24px 64px', textAlign: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 350, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 14, color: '#f1f5f9' }}>The IntelliHire Blog</h1>
                    <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 460, margin: '0 auto' }}>Engineering deep-dives, hiring wisdom, and product updates.</p>
                </motion.div>
            </section>

            <section style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px 100px' }}>
                {/* Featured */}
                <motion.div style={{ ...CARD, padding: '40px 36px', marginBottom: 40, borderColor: 'rgba(99,102,241,0.2)', cursor: 'pointer' }}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    whileHover={{ borderColor: 'rgba(99,102,241,0.4)', y: -3 }}>
                    <span style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Featured</span>
                    <h2 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 24, marginTop: 16, marginBottom: 12, letterSpacing: '-0.03em', lineHeight: 1.3 }}>{POSTS[0].title}</h2>
                    <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.75, marginBottom: 20 }}>{POSTS[0].excerpt}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ color: '#334155', fontSize: 13 }}>{POSTS[0].date}</span>
                        <span style={{ color: '#1e293b' }}>·</span>
                        <span style={{ color: '#334155', fontSize: 13 }}>{POSTS[0].mins} min read</span>
                    </div>
                </motion.div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {POSTS.slice(1).map((post, i) => (
                        <motion.div key={i} style={{ ...CARD, padding: '28px 24px', cursor: 'pointer' }}
                            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                            whileHover={{ borderColor: 'rgba(255,255,255,0.15)', y: -4 }}>
                            <span style={{ background: `${post.tagColor}18`, color: post.tagColor, fontSize: 11, fontWeight: 700, borderRadius: 6, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{post.tag}</span>
                            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginTop: 14, marginBottom: 10, lineHeight: 1.4 }}>{post.title}</h3>
                            <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{post.excerpt}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#334155' }}>
                                <span>{post.date}</span><span style={{ color: '#1e293b' }}>·</span><span>{post.mins} min</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Subscribe */}
                <motion.div style={{ ...CARD, padding: '48px 40px', marginTop: 64, textAlign: 'center', borderColor: 'rgba(99,102,241,0.2)' }}
                    initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h3 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 22, marginBottom: 10, letterSpacing: '-0.02em' }}>Get articles in your inbox</h3>
                    <p style={{ color: '#64748b', marginBottom: 24 }}>Weekly hiring insights and product updates. No spam.</p>
                    <div style={{ display: 'flex', gap: 10, maxWidth: 400, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <input type="email" placeholder="you@company.com" style={{ flex: 1, minWidth: 200, padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e2e8f0', fontSize: 14, outline: 'none' }} />
                        <button style={{ background: GRAD, border: 'none', color: '#fff', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Subscribe →</button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}
