import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles, PerspectiveCamera, Center, ContactShadows, Environment } from '@react-three/drei';

/* ─── Animation helpers ──────────────────────────────────────── */
const FadeUp = ({ children, delay = 0, style = {} }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.div ref={ref} style={style}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
        >{children}</motion.div>
    );
};

const FadeIn = ({ children, delay = 0, style = {} }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    return (
        <motion.div ref={ref} style={style}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7, delay }}
        >{children}</motion.div>
    );
};

/* ─── Shared styles ──────────────────────────────────────────── */
const BG = '#07090f';
const CARD = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 };
const GRAD = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a78bfa 100%)';
const SECTION = { maxWidth: 1160, margin: '0 auto', padding: '0 24px' };

/* ─── Pill badge ─────────────────────────────────────────────── */
const Pill = ({ children, color = '#6366f1' }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        background: `${color}18`, border: `1px solid ${color}35`,
        borderRadius: 999, padding: '5px 14px',
        fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
        textTransform: 'uppercase', color,
    }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
        {children}
    </span>
);

/* ─── Section heading ────────────────────────────────────────── */
const SectionHead = ({ label, title, sub, center = true }) => (
    <FadeUp style={{ textAlign: center ? 'center' : 'left', marginBottom: 56 }}>
        <Pill>{label}</Pill>
        <h2 style={{
            marginTop: 20, fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
            fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15,
            color: '#f1f5f9',
        }}>{title}</h2>
        {sub && <p style={{ color: '#64748b', fontSize: '1.05rem', marginTop: 14, maxWidth: 560, ...(center ? { margin: '14px auto 0' } : {}) }}>{sub}</p>}
    </FadeUp>
);

/* ─── Animated number counter ───────────────────────────────── */
const Counter = ({ target, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const end = parseInt(target);
        const dur = 1800;
        const step = Math.ceil(dur / end);
        const timer = setInterval(() => {
            start += Math.ceil(end / 50);
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(start);
        }, step);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── 3D Interactive Background Elements ─────────────── */
const CustomShapes = () => {
    return (
        <>
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.7} />
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={1.8} />
            <directionalLight position={[-10, -10, -5]} intensity={1.2} color="#6366f1" />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />

            <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
                <mesh position={[-4, 2, -2]} rotation={[0.4, 0.2, 0]}>
                    <boxGeometry args={[1.5, 1.5, 1.5]} />
                    <meshPhysicalMaterial color="#6366f1" roughness={0.15} metalness={0.2} clearcoat={1} clearcoatRoughness={0.1} />
                </mesh>
            </Float>

            <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
                <mesh position={[5, 1.5, -4]}>
                    <icosahedronGeometry args={[1.4, 0]} />
                    <meshPhysicalMaterial color="#ec4899" roughness={0.1} metalness={0.3} clearcoat={1} />
                </mesh>
            </Float>

            <Float speed={2.5} rotationIntensity={3} floatIntensity={2.5}>
                <mesh position={[3, -2, 1]}>
                    <torusGeometry args={[0.9, 0.4, 16, 64]} />
                    <meshPhysicalMaterial color="#f59e0b" roughness={0.2} metalness={0.4} clearcoat={1} />
                </mesh>
            </Float>

            <Float speed={1.8} rotationIntensity={1} floatIntensity={1}>
                <mesh position={[-5, -1.8, 0]}>
                    <sphereGeometry args={[1.2, 64, 64]} />
                    <meshPhysicalMaterial color="#10b981" roughness={0} metalness={0.1} transmission={0.9} ior={1.4} thickness={1} />
                </mesh>
            </Float>

            <Float speed={3} rotationIntensity={4} floatIntensity={1}>
                <mesh position={[0, -4.5, -3]}>
                    <octahedronGeometry args={[1.2]} />
                    <meshPhysicalMaterial color="#8b5cf6" roughness={0.2} metalness={0.2} clearcoat={1} />
                </mesh>
            </Float>

            <Sparkles count={150} scale={20} size={3} speed={0.5} opacity={0.6} color="#c7d2fe" />

            {/* Soft shadows */}
            <ContactShadows position={[0, -5, 0]} opacity={0.4} scale={20} blur={2} far={10} />
        </>
    );
};

/* ─── Interactive Dashboard Preview ─────────────────────────── */
const DashPreview = () => {
    const candidates = [
        { name: 'Arjun Sharma', role: 'Senior React Developer', score: 96, resume: 92, coding: 100, interview: 88, status: 'Top Pick', color: '#6366f1' },
        { name: 'Priya Nair', role: 'Full-Stack Engineer', score: 91, resume: 88, coding: 95, interview: 82, status: 'Shortlisted', color: '#8b5cf6' },
        { name: 'Rahul Verma', role: 'Node.js Developer', score: 84, resume: 78, coding: 88, interview: 80, status: 'Review', color: '#3b82f6' },
        { name: 'Sneha Iyer', role: 'Frontend Specialist', score: 79, resume: 82, coding: 76, interview: 74, status: 'Review', color: '#10b981' },
    ];
    const statusColor = { 'Top Pick': '#34d399', 'Shortlisted': '#818cf8', 'Review': '#fbbf24' };

    return (
        <div style={{ ...CARD, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', fontFamily: 'Inter,sans-serif' }}>
            {/* Window bar */}
            <div style={{ height: 44, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 8 }}>
                {['#ef4444', '#f59e0b', '#22c55e'].map(c => <span key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.75 }} />)}
                <span style={{ marginLeft: 16, fontSize: 12, color: '#334155', fontFamily: 'monospace' }}>intellihire.app / recruiter / candidates</span>
            </div>

            <div style={{ display: 'flex', height: 420 }}>
                {/* Sidebar */}
                <div style={{ width: 200, background: 'rgba(0,0,0,0.25)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 0', flexShrink: 0 }}>
                    <div style={{ padding: '4px 14px 14px', marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 7, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>IH</div>
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>IntelliHire</span>
                        </div>
                    </div>
                    {['Dashboard', 'Candidates', 'Leaderboard', 'Analytics', 'Settings'].map((item, i) => (
                        <div key={item} style={{
                            padding: '9px 16px', fontSize: 13, cursor: 'pointer',
                            color: i === 1 ? '#fff' : 'rgba(255,255,255,0.3)',
                            background: i === 1 ? 'rgba(99,102,241,0.12)' : 'transparent',
                            borderLeft: i === 1 ? '2px solid #6366f1' : '2px solid transparent',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: i === 1 ? '#6366f1' : 'transparent', flexShrink: 0 }} />
                            {item}
                        </div>
                    ))}
                </div>

                {/* Main */}
                <div style={{ flex: 1, padding: '20px 22px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                        <div>
                            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Candidate Pipeline</div>
                            <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>Senior React Dev · 28 applicants · AI analysis complete</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '5px 12px', fontSize: 12, color: '#94a3b8', cursor: 'pointer' }}>Filter</div>
                            <div style={{ background: GRAD, borderRadius: 7, padding: '5px 14px', fontSize: 12, color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Export →</div>
                        </div>
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
                        {[['28', 'Applied'], ['12', 'AI Scored'], ['4', 'Shortlisted'], ['96%', 'Top Match']].map(([v, l]) => (
                            <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                                <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 18 }}>{v}</div>
                                <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>{l}</div>
                            </div>
                        ))}
                    </div>

                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 80px 90px', gap: 8, padding: '6px 0', marginBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Candidate', 'Resume', 'Code', 'Interview', 'Score', 'Status'].map(h => (
                            <div key={h} style={{ fontSize: 10, color: '#334155', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                        ))}
                    </div>

                    {candidates.map((c, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 80px 90px', gap: 8, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                    {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style={{ color: '#e2e8f0', fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                                    <div style={{ color: '#475569', fontSize: 10 }}>{c.role}</div>
                                </div>
                            </div>
                            {[c.resume, c.coding, c.interview].map((v, j) => (
                                <div key={j} style={{ color: v >= 85 ? '#34d399' : v >= 70 ? '#fbbf24' : '#f87171', fontWeight: 700, fontSize: 13 }}>{v}</div>
                            ))}
                            <div style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 14 }}>{c.score}%</div>
                            <div style={{ background: `${statusColor[c.status]}18`, border: `1px solid ${statusColor[c.status]}30`, borderRadius: 6, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: statusColor[c.status], textAlign: 'center' }}>{c.status}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ─── Main Landing component ─────────────────────────────────── */
export default function Landing() {
    const [activeFaq, setActiveFaq] = useState(null);

    return (
        <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: '#e2e8f0', overflowX: 'hidden', lineHeight: 1.6 }}>

            {/* ══════════ 1. HERO ══════════ */}
            <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '130px 24px 80px', textAlign: 'center', overflow: 'hidden' }}>
                {/* 3D Background */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 0, cursor: 'grab' }}>
                    <Canvas dpr={[1, 2.5]} gl={{ antialias: true, alpha: true }}>
                        <CustomShapes />
                    </Canvas>
                </div>

                {/* Background glows & grids */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
                    <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 600, background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 60%)', filter: 'blur(1px)' }} />
                    <div style={{ position: 'absolute', bottom: '5%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 60%)' }} />
                    {/* Grid */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
                </div>

                {/* Main Hero Content Box (Positioned Above 3D Layer) */}
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', pointerEvents: 'none' }}>

                    {/* Badge */}
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 28, pointerEvents: 'auto' }}>
                        <Pill>🚀 Now with GPT-4 Resume Analysis</Pill>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
                        style={{ fontSize: 'clamp(2.8rem, 6vw, 5.2rem)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.045em', maxWidth: 820, margin: '0 auto 20px', pointerEvents: 'auto', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                        Hire the best engineers{' '}
                        <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10× faster</span>{' '}
                        with AI
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}
                        style={{ fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', color: '#94a3b8', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.8, pointerEvents: 'auto', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
                        IntelliHire automatically screens resumes, scores coding skills, and ranks candidates — so you spend time on interviews, not spreadsheets.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.27 }}
                        style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20, pointerEvents: 'auto' }}>
                        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GRAD, color: '#fff', padding: '14px 28px', borderRadius: 12, fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 0 40px rgba(99,102,241,0.45)' }}>
                            Start for Free — No CC Required
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </Link>
                    </motion.div>

                    {/* Orbit instruction */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8, duration: 1 }}
                        style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, fontSize: 13, color: '#94a3b8', marginBottom: 56, pointerEvents: 'auto' }}>
                        Press and drag to orbit 3D Scene
                    </motion.div>

                    {/* Dashboard preview 3D Animated */}
                    <motion.div
                        id="demo"
                        initial={{ opacity: 0, y: 120, rotateX: 25, rotateY: -10, rotateZ: 2, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, rotateX: 4, rotateY: -2, rotateZ: 1, scale: 1 }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}
                        whileHover={{
                            rotateX: 0,
                            rotateY: 0,
                            rotateZ: 0,
                            scale: 1.03,
                            y: -15,
                            transition: { duration: 0.6, ease: 'easeOut' }
                        }}
                        style={{
                            width: '100%',
                            maxWidth: 960,
                            perspective: '1400px',
                            transformStyle: 'preserve-3d',
                            pointerEvents: 'auto',
                            cursor: 'grab'
                        }}
                    >
                        <div style={{
                            boxShadow: '0 50px 100px -20px rgba(99, 102, 241, 0.25), 0 30px 60px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            pointerEvents: 'none' // allow hovering over the motion div without interacting with inner dash initially if desired, or leave it
                        }}>
                            <DashPreview />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ══════════ 2. LOGOS ══════════ */}
            <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '40px 24px' }}>
                <FadeIn>
                    <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#334155', marginBottom: 28 }}>
                        Trusted by engineering teams at
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px 52px', alignItems: 'center' }}>
                        {['Google', 'Stripe', 'Figma', 'Notion', 'Vercel', 'Atlassian', 'MongoDB'].map(l => (
                            <span key={l} style={{ color: '#1e293b', fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>{l}</span>
                        ))}
                    </div>
                </FadeIn>
            </section>

            {/* ══════════ 3. HOW IT WORKS ══════════ */}
            <section style={{ padding: '110px 0 100px' }}>
                <div style={SECTION}>
                    <SectionHead label="How it Works" title="From job post to shortlist in minutes." sub="IntelliHire replaces your entire manual screening workflow with a 4-step automated pipeline." />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                        {[
                            { step: '01', icon: '📋', title: 'Post a Job', desc: 'Define the role, required skills, and minimum experience. IntelliHire configures the AI scoring model automatically.' },
                            { step: '02', icon: '📄', title: 'Candidates Apply', desc: 'Applicants submit their resume and take optional coding assessments — all within a single link.' },
                            { step: '03', icon: '🤖', title: 'AI Analyzes', desc: 'GPT-4 parses each resume, extracts skills, and scores them against your job spec in under 30 seconds.' },
                            { step: '04', icon: '🏆', title: 'You Review Top 10', desc: 'See a ranked shortlist with scores, highlights, and side-by-side comparisons. Invite top picks to interview.' },
                        ].map((s, i) => (
                            <FadeUp key={i} delay={i * 0.1}>
                                <div style={{ position: 'relative', padding: '32px 28px', ...CARD }}>
                                    <div style={{ position: 'absolute', top: 24, right: 24, fontSize: 36, fontWeight: 900, color: 'rgba(99,102,241,0.08)', lineHeight: 1 }}>{s.step}</div>
                                    <div style={{ fontSize: 32, marginBottom: 18 }}>{s.icon}</div>
                                    <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>{s.step}. {s.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.75 }}>{s.desc}</p>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ 4. AI FEATURES ══════════ */}
            <section style={{ padding: '0 0 110px', position: 'relative' }}>
                <div style={{ position: 'absolute', left: '50%', top: '20%', transform: 'translateX(-50%)', width: 700, height: 500, background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
                <div style={SECTION}>
                    <SectionHead label="AI Intelligence" title="Resume screening that thinks." sub="Our multi-layer AI engine goes far beyond keyword matching — it understands context, seniority, and technical depth." />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden' }}>
                        {[
                            { icon: '🧠', title: 'Semantic Skill Extraction', desc: 'Identifies skills by meaning, not just keywords. "Built REST APIs" maps to Node.js, Express, and API architecture automatically.' },
                            { icon: '📊', title: 'Experience Calibration', desc: 'Weighs job titles, tenure, and progression. A "Senior" with 2 years is not the same as one with 8.' },
                            { icon: '💻', title: 'Live Coding Assessment', desc: 'Real-time coding tests with auto-judging across 10+ languages. Score updates to the dashboard instantly.' },
                            { icon: '🎯', title: 'Job-Spec Alignment', desc: 'Every candidate is scored against your exact JD — not a generic benchmark. Define weights for skills manually.' },
                            { icon: '🔍', title: 'Red Flag Detection', desc: 'Spots employment gaps, job-hopping patterns, or inconsistencies and flags them for recruiter review.' },
                            { icon: '📈', title: 'Continuous Learning', desc: 'Our model improves from your decisions. Accept/reject signals make future shortlists even more accurate.' },
                        ].map((f, i) => (
                            <FadeUp key={i} delay={i * 0.06}>
                                <motion.div whileHover={{ background: 'rgba(99,102,241,0.05)' }}
                                    style={{ padding: '36px 32px', background: BG, transition: 'background 0.2s', cursor: 'default' }}>
                                    <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>{f.icon}</div>
                                    <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{f.title}</h3>
                                    <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.75 }}>{f.desc}</p>
                                </motion.div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ 5. BENEFITS SPLIT ══════════ */}
            <section style={{ padding: '0 0 110px' }}>
                <div style={SECTION}>
                    <SectionHead label="Benefits" title="Built for every stakeholder." sub="Whether you're hiring, or applying — IntelliHire makes the process fair, fast, and transparent." />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {/* Recruiter */}
                        <FadeUp>
                            <div style={{ ...CARD, padding: '40px 36px', borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
                                <Pill color="#6366f1">For Recruiters</Pill>
                                <h3 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 22, marginTop: 20, marginBottom: 24, letterSpacing: '-0.02em' }}>Stop drowning in CVs.</h3>
                                {[
                                    'Get a ranked shortlist of your top 10 candidates automatically',
                                    'Save 12+ hours per role on manual screening',
                                    'Side-by-side candidate comparison with data',
                                    'One-click interview scheduling for shortlisted candidates',
                                    'Analytics on your hiring funnel and time-to-hire',
                                ].map((b, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                                        <span style={{ color: '#6366f1', fontSize: 16, flexShrink: 0, marginTop: 1 }}>→</span>
                                        <span style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6 }}>{b}</span>
                                    </div>
                                ))}
                                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, background: GRAD, color: '#fff', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                                    Start hiring →
                                </Link>
                            </div>
                        </FadeUp>

                        {/* Candidate */}
                        <FadeUp delay={0.1}>
                            <div style={{ ...CARD, padding: '40px 36px', borderColor: 'rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.03)' }}>
                                <Pill color="#10b981">For Candidates</Pill>
                                <h3 style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 22, marginTop: 20, marginBottom: 24, letterSpacing: '-0.02em' }}>A fair shot, every time.</h3>
                                {[
                                    'Know exactly how your resume compares against the JD',
                                    'Take structured coding tests from the application form',
                                    'Get real feedback on your score breakdown',
                                    'No more ghosting — real-time application status',
                                    'Your skills speak louder than your university name',
                                ].map((b, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                                        <span style={{ color: '#10b981', fontSize: 16, flexShrink: 0, marginTop: 1 }}>→</span>
                                        <span style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6 }}>{b}</span>
                                    </div>
                                ))}
                                <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff', padding: '11px 22px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                                    Apply smarter →
                                </Link>
                            </div>
                        </FadeUp>
                    </div>
                </div>
            </section>

            {/* ══════════ 6. METRICS ══════════ */}
            <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 24px' }}>
                <div style={{ ...SECTION, textAlign: 'center' }}>
                    <FadeUp style={{ marginBottom: 56 }}>
                        <Pill color="#f59e0b">Proven Results</Pill>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#f1f5f9', marginTop: 18, letterSpacing: '-0.03em' }}>Numbers that speak for themselves</h2>
                    </FadeUp>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
                        {[
                            { val: 10, suffix: '×', label: 'Faster Screening', sub: 'vs. manual process' },
                            { val: 94, suffix: '%', label: 'Match Accuracy', sub: 'on shortlisted candidates' },
                            { val: 2800, suffix: '+', label: 'Jobs Filled', sub: 'through IntelliHire' },
                            { val: 12, suffix: 'h', label: 'Saved Per Role', sub: 'average per recruiter' },
                        ].map((m, i) => (
                            <FadeUp key={i} delay={i * 0.1}>
                                <div>
                                    <div style={{ fontSize: 'clamp(2.5rem, 4vw, 3.8rem)', fontWeight: 900, letterSpacing: '-0.04em', background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                                        <Counter target={m.val} />{m.suffix}
                                    </div>
                                    <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16, marginTop: 10 }}>{m.label}</div>
                                    <div style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>{m.sub}</div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ 7. TESTIMONIALS ══════════ */}
            <section style={{ padding: '110px 0' }}>
                <div style={SECTION}>
                    <SectionHead label="Customer Stories" title="Loved by engineering leads." sub="Don't take our word for it — here's what real hiring managers say about IntelliHire." />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                        {[
                            { quote: 'IntelliHire cut our time-to-hire by 65%. We went from a 3-week screening cycle to 4 days. The AI scores are genuinely impressive.', name: 'Priya Singh', role: 'VP Engineering, Nexus', initials: 'PS', color: '#6366f1' },
                            { quote: "We had 340 applicants for a senior backend role. IntelliHire gave us a ranked shortlist of 8 in 2 hours. We hired #2 on that list.", name: 'Rahul Mehta', role: 'CTO, BuildFast', initials: 'RM', color: '#8b5cf6' },
                            { quote: "The candidate experience is also great. Our offer acceptance rate went up because applicants felt the process was fair and transparent.", name: 'Neha Sharma', role: 'Head of Talent, DevStudio', initials: 'NS', color: '#3b82f6' },
                        ].map((t, i) => (
                            <FadeUp key={i} delay={i * 0.1}>
                                <div style={{ ...CARD, padding: '32px 28px', borderTop: `2px solid ${t.color}` }}>
                                    <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
                                        {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: 15 }}>★</span>)}
                                    </div>
                                    <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8, marginBottom: 28, fontStyle: 'italic' }}>"{t.quote}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>{t.initials}</div>
                                        <div>
                                            <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                                            <div style={{ color: '#475569', fontSize: 12, marginTop: 2 }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ 8. FAQ ══════════ */}
            <section style={{ padding: '0 0 110px' }}>
                <div style={SECTION}>                    {/* FAQ */}
                    <div style={{ maxWidth: 680, margin: '72px auto 0' }}>
                        <FadeUp>
                            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 22, marginBottom: 24, textAlign: 'center', letterSpacing: '-0.02em' }}>Common questions</h3>
                        </FadeUp>
                        {[
                            { q: 'Is the free plan really free forever?', a: 'Yes. No time limit, no credit card required. You only need to upgrade when you hit the limits.' },
                            { q: 'How accurate is the AI scoring?', a: 'Our model achieves 94% match accuracy based on post-hire feedback from 2,800+ filled roles. We validate continuously.' },
                            { q: 'Can I customize the scoring criteria?', a: 'Yes. Pro and Enterprise plans let you define skill weights, custom scoring rubrics, and mandatory requirements.' },
                            { q: 'Does IntelliHire work for non-engineering roles?', a: 'Currently we are optimised for software engineering roles. Non-technical hiring support is on our roadmap.' },
                        ].map((faq, i) => (
                            <FadeUp key={i} delay={i * 0.05}>
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 0 }}>
                                    <button
                                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                                        style={{ width: '100%', background: 'none', border: 'none', color: '#f1f5f9', fontSize: 15, fontWeight: 600, padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: 16 }}
                                    >
                                        {faq.q}
                                        <motion.span animate={{ rotate: activeFaq === i ? 45 : 0 }} style={{ color: '#6366f1', fontSize: 22, flexShrink: 0, lineHeight: 1 }}>+</motion.span>
                                    </button>
                                    <AnimatePresence>
                                        {activeFaq === i && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                                                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.8, paddingBottom: 20 }}>{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </FadeUp>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ 9. FINAL CTA ══════════ */}
            <section style={{ padding: '0 24px 120px' }}>
                <FadeUp>
                    <div style={{
                        maxWidth: 780, margin: '0 auto', textAlign: 'center',
                        position: 'relative', padding: '80px 48px', borderRadius: 28,
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        boxShadow: '0 0 100px rgba(99,102,241,0.1)',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative glow */}
                        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />

                        <Pill>Get Started Today</Pill>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, color: '#f1f5f9', marginTop: 24, marginBottom: 16, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                            Your best hire is waiting.{' '}
                            <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Find them today.</span>
                        </h2>
                        <p style={{ color: '#64748b', fontSize: 16, maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.75 }}>
                            Join 1,200+ engineering teams who have replaced spreadsheets and gut feel with data-driven hiring.
                        </p>
                        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: GRAD, color: '#fff', padding: '15px 32px', borderRadius: 12, fontWeight: 800, fontSize: 16, textDecoration: 'none', boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}>
                                Start for Free →
                            </Link>
                            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '15px 32px', borderRadius: 12, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
                                Sign In
                            </Link>
                        </div>
                        <p style={{ color: '#334155', fontSize: 13, marginTop: 24 }}>No credit card · Free forever · Cancel anytime</p>
                    </div>
                </FadeUp>
            </section>

            {/* ══════════ FOOTER ══════════ */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '56px 24px 36px' }}>
                <div style={{ ...SECTION }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 56 }}>
                        {/* Brand */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 11 }}>IH</div>
                                <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em' }}>IntelliHire</span>
                            </div>
                            <p style={{ color: '#475569', fontSize: 14, maxWidth: 260, lineHeight: 1.75 }}>AI-powered hiring for engineering teams who want to hire the best, fast.</p>
                            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                                    <a key={s} href="#" style={{ color: '#334155', fontSize: 13, textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7 }}>{s}</a>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        {[
                            { heading: 'Product', links: [['Features', '/features'], ['Changelog', '/changelog'], ['Roadmap', '/roadmap']] },
                            { heading: 'Company', links: [['About', '/about'], ['Feedback', '/feedback']] },
                            { heading: 'Legal', links: [['Privacy', '/privacy'], ['Terms', '/terms'], ['Security', '/security'], ['GDPR', '/gdpr']] },
                        ].map(col => (
                            <div key={col.heading}>
                                <p style={{ color: '#475569', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{col.heading}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {col.links.map(([label, path]) => (
                                        <Link key={label} to={path} style={{ color: '#334155', fontSize: 14, textDecoration: 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                                            onMouseLeave={e => e.currentTarget.style.color = '#334155'}>{label}</Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                        <span style={{ color: '#334155', fontSize: 13 }}>© {new Date().getFullYear()} IntelliHire. All rights reserved.</span>
                        <span style={{ color: '#334155', fontSize: 13 }}>Built by <strong style={{ color: '#818cf8' }}>Prakul Dhiman</strong></span>
                    </div>
                </div>
            </footer>

        </div>
    );
}
