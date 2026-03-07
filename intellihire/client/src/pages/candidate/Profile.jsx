import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PageTransition, ScoreRing, Skeleton } from '../../components/Motion';
import {
    HiOutlineMail, HiOutlineCalendar, HiOutlineBriefcase,
    HiOutlineAcademicCap, HiOutlineCode, HiOutlineStar,
    HiOutlineChartBar, HiOutlineChatAlt2, HiOutlineClipboardCheck,
    HiOutlineDocumentText, HiOutlineLightningBolt, HiOutlineBadgeCheck,
    HiOutlineTrendingUp, HiOutlineEye, HiOutlineSearch,
    HiOutlinePencil, HiOutlinePlus, HiOutlineLocationMarker,
    HiOutlineGlobe, HiOutlineCheck, HiOutlineLink, HiOutlineFolder,
} from 'react-icons/hi';

/* ─── Card base ───────────────────────────────────────────── */
const card = {
    background: 'linear-gradient(135deg, rgba(30,27,75,0.6), rgba(20,16,55,0.5))',
    border: '1px solid rgba(99,102,241,0.12)', borderRadius: '12px',
    backdropFilter: 'blur(16px)',
};

/* ─── Section Header ──────────────────────────────────────── */
function SectionHeader({ title, icon: Icon, actionLabel, onAction }) {
    return (
        <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '20px',
        }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {title}
            </h2>
            {onAction && (
                <button
                    onClick={onAction}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '13px', fontWeight: 600, color: '#818cf8',
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '6px 12px', borderRadius: '8px',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                    {actionLabel || 'Show all'} →
                </button>
            )}
        </div>
    );
}

/* ─── Main Profile Component ──────────────────────────────── */
export default function Profile() {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAllSkills, setShowAllSkills] = useState(false);

    useEffect(() => {
        api.get('/candidate/profile')
            .then((res) => setProfile(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    /* Loading skeleton */
    if (loading) return (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
            <Skeleton height="200px" className="w-full mb-4" />
            <Skeleton height="160px" className="w-full mb-4" />
            <Skeleton height="200px" className="w-full mb-4" />
            <Skeleton height="180px" className="w-full" />
        </div>
    );

    const u = profile?.user || {};
    const resume = profile?.resume;
    const submissions = profile?.recentSubmissions || [];
    const interviews = profile?.interviews || [];

    /* Derived */
    const acceptedCount = submissions.filter(s => s.status === 'accepted').length;
    const totalSubmissions = submissions.length;
    const successRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;
    const joinDate = u.joinedAt ? new Date(u.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A';
    const languagesUsed = [...new Set(submissions.map(s => s.language))];

    const getTier = (score) => {
        if (score >= 90) return { label: 'Elite', color: '#f59e0b', icon: '🏆' };
        if (score >= 75) return { label: 'Advanced', color: '#34d399', icon: '⭐' };
        if (score >= 50) return { label: 'Intermediate', color: '#38bdf8', icon: '📈' };
        if (score >= 25) return { label: 'Beginner', color: '#fbbf24', icon: '🌱' };
        return { label: 'Newcomer', color: '#94a3b8', icon: '🆕' };
    };
    const tier = getTier(u.finalScore ?? 0);

    return (
        <PageTransition>
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 1: BANNER + PROFILE INFO (LinkedIn Header Style)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <motion.div
                    style={{ ...card, overflow: 'hidden', marginBottom: '8px' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Cover Banner */}
                    <div style={{
                        position: 'relative', height: '180px',
                        background: 'linear-gradient(135deg, #1e0a3e 0%, #312e81 25%, #4338ca 50%, #6366f1 75%, #818cf8 100%)',
                        overflow: 'hidden',
                    }}>
                        {/* Dot pattern */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
                            backgroundSize: '20px 20px',
                        }} />
                        {/* Glow orbs */}
                        <div style={{
                            position: 'absolute', top: '-40%', right: '-10%', width: '400px', height: '400px',
                            background: 'radial-gradient(circle, rgba(167,139,250,0.3), transparent 60%)',
                            borderRadius: '50%', filter: 'blur(50px)',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: '-30%', left: '20%', width: '300px', height: '300px',
                            background: 'radial-gradient(circle, rgba(99,102,241,0.2), transparent 60%)',
                            borderRadius: '50%', filter: 'blur(40px)',
                        }} />
                        {/* Floating geometric */}
                        <motion.div
                            style={{
                                position: 'absolute', top: '15%', right: '10%',
                                width: '80px', height: '80px', border: '1.5px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                            }}
                            animate={{ rotate: [45, 55, 45], y: [0, -6, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </div>

                    {/* Profile Info Below Banner */}
                    <div style={{ padding: '0 28px 28px', position: 'relative' }}>
                        {/* Avatar (overlapping banner - LinkedIn style) */}
                        <div style={{ marginTop: '-52px', marginBottom: '16px' }}>
                            <motion.div
                                style={{
                                    width: '104px', height: '104px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #6366f1, #7c3aed, #a78bfa)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontSize: '40px', fontWeight: 800,
                                    boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
                                    border: '4px solid #0f0a1e',
                                }}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            >
                                {authUser?.name?.charAt(0).toUpperCase()}
                            </motion.div>
                        </div>

                        {/* Name + Headline */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ flex: 1, minWidth: '250px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                                        {u.name || 'Candidate'}
                                    </h1>
                                    {/* Verification badge */}
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                                        padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
                                        background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                                        border: '1px solid rgba(99,102,241,0.2)',
                                    }}>
                                        <HiOutlineCheck size={11} /> Verified
                                    </span>
                                </div>

                                {/* Headline */}
                                <p style={{ fontSize: '14px', color: '#c7d2fe', marginBottom: '6px', lineHeight: 1.5 }}>
                                    {resume
                                        ? `${resume.education} · ${resume.experience} ${resume.experience === 1 ? 'year' : 'years'} experience`
                                        : 'IntelliHire Candidate'
                                    }
                                    {resume?.skills?.length > 0 && (
                                        <span style={{ color: '#94a3b8' }}> | Strong in {resume.skills.slice(0, 3).join(', ')}</span>
                                    )}
                                </p>

                                {/* Location / Contact */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <HiOutlineMail size={13} /> {u.email}
                                    </span>
                                    <span style={{ color: '#334155' }}>·</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <HiOutlineCalendar size={13} /> Joined {joinDate}
                                    </span>
                                    {resume?.links?.linkedin && (
                                        <>
                                            <span style={{ color: '#334155' }}>·</span>
                                            <a href={resume.links.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', textDecoration: 'none' }}>
                                                LinkedIn
                                            </a>
                                        </>
                                    )}
                                    {resume?.links?.github && (
                                        <>
                                            <span style={{ color: '#334155' }}>·</span>
                                            <a href={resume.links.github} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', textDecoration: 'none' }}>
                                                GitHub
                                            </a>
                                        </>
                                    )}
                                    {resume?.links?.portfolio && (
                                        <>
                                            <span style={{ color: '#334155' }}>·</span>
                                            <a href={resume.links.portfolio} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', textDecoration: 'none' }}>
                                                Portfolio
                                            </a>
                                        </>
                                    )}
                                </div>

                                {/* Tier badge */}
                                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                                        background: `${tier.color}15`, color: tier.color,
                                        border: `1px solid ${tier.color}30`,
                                    }}>
                                        {tier.icon} {tier.label} Tier
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                        Final Score: <span style={{ color: '#fff', fontWeight: 700 }}>{(u.finalScore ?? 0).toFixed(1)}</span>
                                    </span>
                                </div>

                                {/* Action buttons (LinkedIn-style) */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => navigate('/candidate/resume')}
                                        style={{
                                            padding: '7px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: 700,
                                            background: 'linear-gradient(135deg, #6366f1, #7c3aed)', color: '#fff',
                                            border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                            boxShadow: '0 2px 10px rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}>
                                        <HiOutlinePencil size={14} /> Edit Profile
                                    </button>
                                    <button
                                        onClick={() => navigate('/candidate/resume')}
                                        style={{
                                            padding: '7px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: 700,
                                            background: 'transparent', color: '#818cf8',
                                            border: '1.5px solid #818cf8', cursor: 'pointer', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', gap: '4px'
                                        }}>
                                        <HiOutlinePlus size={14} /> Add Section
                                    </button>
                                    <button style={{
                                        padding: '7px 20px', borderRadius: '999px', fontSize: '13px', fontWeight: 700,
                                        background: 'transparent', color: '#94a3b8',
                                        border: '1.5px solid rgba(99,102,241,0.2)', cursor: 'pointer', transition: 'all 0.2s',
                                    }}>
                                        More
                                    </button>
                                </div>
                            </div>

                            {/* Right side — Education badge */}
                            {resume && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 14px', borderRadius: '10px',
                                    background: 'rgba(10,6,30,0.4)',
                                }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        background: 'rgba(99,102,241,0.12)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: '#818cf8',
                                    }}>
                                        <HiOutlineAcademicCap size={18} />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{resume.education}</p>
                                        <p style={{ fontSize: '11px', color: '#64748b' }}>Education</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 2: ANALYTICS (LinkedIn "Analytics" style)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <motion.div
                    style={{ ...card, padding: '24px', marginBottom: '8px' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <SectionHeader title="Analytics" />
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '-14px', marginBottom: '18px' }}>
                        <HiOutlineEye size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Private to you
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}
                        className="analytics-grid"
                    >
                        {[
                            { icon: HiOutlineClipboardCheck, label: 'Total submissions', value: totalSubmissions, sub: 'Code submissions to date', color: '#818cf8' },
                            { icon: HiOutlineStar, label: 'Accepted solutions', value: acceptedCount, sub: `${successRate}% success rate`, color: '#34d399' },
                            { icon: HiOutlineSearch, label: 'Interview evaluations', value: interviews.length, sub: 'Feedback received', color: '#fbbf24' },
                        ].map(({ icon: Icon, label, value, sub, color }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 + i * 0.06 }}
                                style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                                    padding: '16px', borderRadius: '10px',
                                    background: 'rgba(10,6,30,0.35)',
                                    border: '1px solid rgba(99,102,241,0.06)',
                                    cursor: 'pointer', transition: 'border-color 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.06)'}
                            >
                                <Icon size={20} style={{ color, flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <p style={{ fontSize: '22px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</p>
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>{label}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 3: ABOUT
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <motion.div
                    style={{ ...card, padding: '24px', marginBottom: '8px' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <SectionHeader title="About" />
                    {resume?.summary ? (
                        <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#c7d2fe' }}>
                            {resume.summary}
                        </p>
                    ) : (
                        <p style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>
                            No summary added yet. Add your resume to populate this section.
                        </p>
                    )}
                    {resume && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(99,102,241,0.08)' }}>
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                                <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{resume.experience}</span> {resume.experience === 1 ? 'year' : 'years'} of experience · <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{resume.education}</span>
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 4: PERFORMANCE SCORES
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <motion.div
                    style={{ ...card, padding: '24px', marginBottom: '8px' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <SectionHeader title="Performance" />

                    {/* Score cards row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}
                        className="perf-grid"
                    >
                        {[
                            { label: 'Resume', score: u.resumeScore ?? 0, color: '#34d399', icon: HiOutlineDocumentText },
                            { label: 'Coding', score: u.codingScore ?? 0, color: '#38bdf8', icon: HiOutlineCode },
                            { label: 'Interview', score: u.interviewScore ?? 0, color: '#fbbf24', icon: HiOutlineChatAlt2 },
                            { label: 'Final', score: (u.finalScore ?? 0).toFixed(1), color: '#a78bfa', icon: HiOutlineTrendingUp },
                        ].map(({ label, score, color, icon: Icon }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.05 }}
                                style={{
                                    padding: '20px 16px', borderRadius: '12px', textAlign: 'center',
                                    background: 'rgba(10,6,30,0.4)', border: '1px solid rgba(99,102,241,0.08)',
                                }}
                            >
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '10px', margin: '0 auto 10px',
                                    background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color,
                                }}>
                                    <Icon size={18} />
                                </div>
                                <p style={{ fontSize: '28px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{score}</p>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Formula breakdown */}
                    <div style={{
                        padding: '18px 20px', borderRadius: '10px',
                        background: 'rgba(10,6,30,0.3)', border: '1px solid rgba(99,102,241,0.06)',
                    }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                            Score Formula
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { label: 'Resume', weight: 0.3, score: u.resumeScore ?? 0, color: '#34d399' },
                                { label: 'Coding', weight: 0.5, score: u.codingScore ?? 0, color: '#38bdf8' },
                                { label: 'Interview', weight: 0.2, score: u.interviewScore ?? 0, color: '#fbbf24' },
                            ].map(({ label, weight, score, color }) => (
                                <div key={label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                                            {label} <span style={{ color: '#475569' }}>× {weight}</span>
                                        </span>
                                        <span style={{ fontSize: '13px' }}>
                                            <span style={{ color: '#475569' }}>= {(score * weight).toFixed(1)}</span>
                                            <span style={{ fontWeight: 700, color, marginLeft: '8px' }}>{score}</span>
                                        </span>
                                    </div>
                                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(10,6,30,0.5)', overflow: 'hidden' }}>
                                        <motion.div
                                            style={{ height: '100%', borderRadius: '3px', background: `linear-gradient(90deg, ${color}bb, ${color})` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(99,102,241,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Final Score</span>
                            <span style={{
                                fontSize: '22px', fontWeight: 800,
                                background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            }}>
                                {(u.finalScore ?? 0).toFixed(1)}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 5: ACTIVITY (Code Submissions)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <motion.div
                    style={{ ...card, padding: '24px', marginBottom: '8px' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <SectionHeader title="Activity" />
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '-14px', marginBottom: '16px' }}>
                        {totalSubmissions} code {totalSubmissions === 1 ? 'submission' : 'submissions'}
                    </p>
                    {submissions.length > 0 ? (
                        <>
                            {/* Submission cards — LinkedIn post style */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}
                                className="activity-grid"
                            >
                                {submissions.slice(0, 4).map((s, i) => {
                                    const statusConfig = {
                                        accepted: { color: '#34d399', bg: 'rgba(16,185,129,0.08)', label: '✓ Accepted' },
                                        pending: { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)', label: '⏳ Pending' },
                                        wrong_answer: { color: '#f87171', bg: 'rgba(239,68,68,0.08)', label: '✗ Wrong' },
                                        error: { color: '#f87171', bg: 'rgba(239,68,68,0.08)', label: '⚠ Error' },
                                        timeout: { color: '#fb923c', bg: 'rgba(249,115,22,0.08)', label: '⏱ Timeout' },
                                    };
                                    const sc = statusConfig[s.status] || statusConfig.pending;
                                    return (
                                        <motion.div
                                            key={s._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + i * 0.05 }}
                                            style={{
                                                padding: '16px', borderRadius: '10px',
                                                background: 'rgba(10,6,30,0.35)', border: '1px solid rgba(99,102,241,0.06)',
                                                transition: 'border-color 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.06)'}
                                        >
                                            {/* Header (like LinkedIn post header) */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '11px', fontWeight: 700,
                                                }}>
                                                    {authUser?.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{u.name}</p>
                                                    <p style={{ fontSize: '11px', color: '#64748b' }}>
                                                        {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Code block preview */}
                                            <div style={{
                                                padding: '12px', borderRadius: '8px', marginBottom: '12px',
                                                background: 'rgba(10,6,30,0.6)', border: '1px solid rgba(99,102,241,0.06)',
                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                fontSize: '11px', color: '#94a3b8', lineHeight: 1.6,
                                                maxHeight: '60px', overflow: 'hidden',
                                            }}>
                                                {s.sourceCode
                                                    ? s.sourceCode.substring(0, 120) + (s.sourceCode.length > 120 ? '...' : '')
                                                    : `// ${s.language} submission`
                                                }
                                            </div>
                                            {/* Footer */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                    background: sc.bg, color: sc.color,
                                                }}>
                                                    {sc.label}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontSize: '11px', fontWeight: 600, color: '#64748b',
                                                        padding: '3px 8px', borderRadius: '4px',
                                                        background: 'rgba(99,102,241,0.06)', textTransform: 'capitalize',
                                                    }}>
                                                        {s.language}
                                                    </span>
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{s.score}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                            {submissions.length > 4 && (
                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    <button style={{
                                        fontSize: '13px', fontWeight: 700, color: '#818cf8',
                                        background: 'none', border: '1.5px solid rgba(99,102,241,0.2)',
                                        padding: '8px 24px', borderRadius: '999px', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                                    >
                                        Show all →
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                            <HiOutlineCode size={28} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                            <p style={{ fontSize: '14px' }}>No activity yet</p>
                        </div>
                    )}
                </motion.div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 6: SKILLS
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <motion.div
                    style={{ ...card, padding: '24px', marginBottom: '8px' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <SectionHeader title="Skills" />
                    {resume?.skills?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {(showAllSkills ? resume.skills : resume.skills.slice(0, 5)).map((skill, i) => (
                                <motion.div
                                    key={skill}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.35 + i * 0.04 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '14px 0',
                                        borderBottom: i < (showAllSkills ? resume.skills.length : Math.min(resume.skills.length, 5)) - 1 ? '1px solid rgba(99,102,241,0.06)' : 'none',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            background: `hsl(${(i * 47) % 360}, 70%, 65%)`,
                                        }} />
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{skill}</span>
                                    </div>
                                    <HiOutlineBadgeCheck size={16} style={{ color: '#34d399', opacity: 0.6 }} />
                                </motion.div>
                            ))}
                            {resume.skills.length > 5 && (
                                <button
                                    onClick={() => setShowAllSkills(!showAllSkills)}
                                    style={{
                                        marginTop: '12px', fontSize: '13px', fontWeight: 700, color: '#818cf8',
                                        background: 'none', border: '1.5px solid rgba(99,102,241,0.2)',
                                        padding: '8px 20px', borderRadius: '999px', cursor: 'pointer',
                                        alignSelf: 'center', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                >
                                    {showAllSkills ? 'Show less' : `Show all ${resume.skills.length} skills`}
                                </button>
                            )}
                        </div>
                    ) : (
                        <p style={{ fontSize: '14px', color: '#64748b', fontStyle: 'italic' }}>No skills added yet</p>
                    )}
                </motion.div>

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 7: EDUCATION
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {resume && (
                    <motion.div
                        style={{ ...card, padding: '24px', marginBottom: '8px' }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <SectionHeader title="Education" />
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '8px',
                                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#818cf8', flexShrink: 0,
                            }}>
                                <HiOutlineAcademicCap size={22} />
                            </div>
                            <div>
                                <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{resume.education}</p>
                                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Education</p>
                                {resume.skills?.length > 0 && (
                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                        <span style={{ color: '#818cf8' }}>◆</span> {resume.skills.slice(0, 4).join(', ')} {resume.skills.length > 4 && `and +${resume.skills.length - 4} skills`}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 7.5: PROJECTS & CERTIFICATIONS
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {resume && (resume.projects?.length > 0 || resume.certifications?.length > 0) && (
                    <motion.div
                        style={{ ...card, padding: '24px', marginBottom: '8px' }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.38 }}
                    >
                        <SectionHeader title="Projects & Certifications" />

                        {resume.projects?.length > 0 && (
                            <div style={{ marginBottom: resume.certifications?.length > 0 ? '24px' : '0' }}>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px' }}>Projects</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {resume.projects.map((p, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '8px',
                                                background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.12)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#ec4899', flexShrink: 0,
                                            }}>
                                                <HiOutlineFolder size={20} />
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{p.name}</p>
                                                <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.5 }}>
                                                    {p.desc}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {resume.certifications?.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '12px', borderTop: resume.projects?.length > 0 ? '1px solid rgba(99,102,241,0.08)' : 'none', paddingTop: resume.projects?.length > 0 ? '16px' : '0' }}>Certifications</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {resume.certifications.map((c, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(10,6,30,0.3)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.06)' }}>
                                            <HiOutlineBadgeCheck size={20} style={{ color: '#fbbf24' }} />
                                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{c}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 8: EXPERIENCE
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {resume && (
                    <motion.div
                        style={{ ...card, padding: '24px', marginBottom: '8px' }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <SectionHeader title="Experience" />
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '8px',
                                background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#38bdf8', flexShrink: 0,
                            }}>
                                <HiOutlineBriefcase size={22} />
                            </div>
                            <div>
                                <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                                    {resume.experience} {resume.experience === 1 ? 'Year' : 'Years'} of Experience
                                </p>
                                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Professional Experience</p>
                                {languagesUsed.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                                        {languagesUsed.map(lang => (
                                            <span key={lang} style={{
                                                padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                                                background: 'rgba(56,189,248,0.08)', color: '#38bdf8',
                                                border: '1px solid rgba(56,189,248,0.12)', textTransform: 'capitalize',
                                            }}>
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 9: INTERVIEW EVALUATIONS (like Recommendations)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {interviews.length > 0 && (
                    <motion.div
                        style={{ ...card, padding: '24px', marginBottom: '8px' }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                    >
                        <SectionHeader title="Evaluations & Feedback" />
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '-14px', marginBottom: '18px' }}>
                            {interviews.length} interview {interviews.length === 1 ? 'evaluation' : 'evaluations'} received
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {interviews.map((iv, i) => (
                                <motion.div
                                    key={iv._id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.06 }}
                                    style={{
                                        padding: '18px', borderRadius: '12px',
                                        background: 'rgba(10,6,30,0.35)', border: '1px solid rgba(99,102,241,0.06)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: iv.feedback ? '14px' : 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontSize: '14px', fontWeight: 700,
                                            }}>
                                                {iv.evaluatorId?.name?.charAt(0)?.toUpperCase() || 'E'}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                                                    {iv.evaluatorId?.name || 'Evaluator'}
                                                </p>
                                                <p style={{ fontSize: '12px', color: '#64748b' }}>
                                                    Evaluated on {new Date(iv.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{
                                            padding: '6px 14px', borderRadius: '8px',
                                            background: iv.score >= 70 ? 'rgba(16,185,129,0.1)' : iv.score >= 40 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                                        }}>
                                            <span style={{
                                                fontSize: '20px', fontWeight: 800,
                                                color: iv.score >= 70 ? '#34d399' : iv.score >= 40 ? '#fbbf24' : '#f87171',
                                            }}>
                                                {iv.score}
                                            </span>
                                        </div>
                                    </div>
                                    {iv.feedback && (
                                        <div style={{
                                            padding: '14px 16px', borderRadius: '10px',
                                            background: 'rgba(99,102,241,0.04)',
                                            borderLeft: '3px solid rgba(99,102,241,0.2)',
                                        }}>
                                            <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#c7d2fe', fontStyle: 'italic' }}>
                                                "{iv.feedback}"
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    SECTION 10: SCORE RINGS (Certifications equivalent)
                   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                <motion.div
                    style={{ ...card, padding: '24px', marginBottom: '24px' }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <SectionHeader title="Certifications & Scores" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}
                        className="rings-grid"
                    >
                        {[
                            { label: 'Resume Score', score: u.resumeScore ?? 0, color: '#34d399' },
                            { label: 'Coding Score', score: u.codingScore ?? 0, color: '#38bdf8' },
                            { label: 'Interview Score', score: u.interviewScore ?? 0, color: '#fbbf24' },
                            { label: 'Final Score', score: Math.round(u.finalScore ?? 0), color: '#a78bfa' },
                        ].map(({ label, score, color }, i) => (
                            <motion.div
                                key={label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.55 + i * 0.06 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
                            >
                                <ScoreRing score={score} size={80} strokeWidth={5} color={color} />
                                <p style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textAlign: 'center' }}>{label}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </div>

            {/* ── Responsive ───────────────────────────────────────── */}
            <style>{`
                @media (max-width: 768px) {
                    .analytics-grid { grid-template-columns: 1fr !important; }
                    .perf-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .activity-grid { grid-template-columns: 1fr !important; }
                    .rings-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 480px) {
                    .perf-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </PageTransition>
    );
}
