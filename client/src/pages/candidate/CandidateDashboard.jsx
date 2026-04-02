import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PageTransition, ScoreRing, Skeleton, FloatingBlob } from '../../components/Motion';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function CandidateDashboard() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/candidate/profile')
            .then((res) => setProfile(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const u = profile?.user || {};
    const finalScore = u.finalScore ?? 0;

    return (
        <PageTransition>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', position: 'relative' }}>
                <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
                    <FloatingBlob color="indigo" size={400} top="10%" right="5%" />
                    <FloatingBlob color="purple" size={300} bottom="20%" left="5%" delay={3} />
                </div>

                {/* Welcome Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 700, boxShadow: '0 8px 24px rgba(99,102,241,0.2)' }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>Welcome, {user?.name} 👋</h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Here's your performance snapshot</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} height="140px" />)}
                    </div>
                ) : (
                    <>
                        {/* Score Rings */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                            {[
                                { label: 'Resume', score: u.resumeScore ?? 0, color: '#34d399' },
                                { label: 'Coding', score: u.codingScore ?? 0, color: '#38bdf8' },
                                { label: 'Interview', score: u.interviewScore ?? 0, color: '#fbbf24' },
                                { label: 'Final Score', score: Math.round(finalScore), color: '#a78bfa' },
                            ].map(({ label, score, color }, i) => (
                                <motion.div key={label} style={{ ...card, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                    <ScoreRing score={score} size={100} strokeWidth={7} color={color} />
                                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '12px' }}>{label}</p>
                                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>out of 100</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Score Breakdown */}
                        <motion.div style={{ ...card, padding: '24px', marginBottom: '24px' }}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Score Breakdown</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { label: 'Resume', score: u.resumeScore ?? 0, weight: 0.3, color: '#34d399' },
                                    { label: 'Coding', score: u.codingScore ?? 0, weight: 0.5, color: '#38bdf8' },
                                    { label: 'Interview', score: u.interviewScore ?? 0, weight: 0.2, color: '#fbbf24' },
                                ].map(({ label, score, weight, color }) => (
                                    <div key={label}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8' }}>{label} <span style={{ color: '#475569' }}>× {weight}</span></span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '12px', color: '#475569' }}>= {(score * weight).toFixed(1)}</span>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color }}>{score}</span>
                                            </div>
                                        </div>
                                        <div className="progress-bar-track">
                                            <motion.div className="progress-bar-fill" style={{ background: `linear-gradient(90deg, ${color}cc, ${color})` }} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: 0.5 }} />
                                        </div>
                                    </div>
                                ))}
                                <div style={{ paddingTop: '12px', borderTop: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Final Score</span>
                                    <span style={{ fontSize: '24px', fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        {finalScore.toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            {[
                                { to: '/candidate/resume', icon: '📝', title: 'Resume', desc: 'Submit or update resume metadata' },
                                { to: '/candidate/code', icon: '⚡', title: 'Code Test', desc: 'Write and submit code solutions' },
                                { to: '/candidate/profile', icon: '👤', title: 'Profile', desc: 'View detailed scores & history' },
                            ].map((item, i) => (
                                <motion.div key={item.to} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                                    <Link to={item.to} style={{ textDecoration: 'none' }}>
                                        <div style={{ ...card, padding: '20px', transition: 'all 0.2s', cursor: 'pointer' }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '18px' }}>{item.icon}</span>
                                                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{item.title}</h3>
                                                    </div>
                                                    <p style={{ fontSize: '13px', color: '#64748b' }}>{item.desc}</p>
                                                </div>
                                                <span style={{ fontSize: '18px', color: '#475569' }}>→</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Recent Submissions */}
                        {profile?.recentSubmissions?.length > 0 && (
                            <motion.div style={{ ...card, overflow: 'hidden', marginBottom: '24px' }}
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Recent Code Submissions</h3>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table">
                                        <thead><tr><th>Language</th><th>Status</th><th>Score</th><th>Date</th></tr></thead>
                                        <tbody>
                                            {profile.recentSubmissions.slice(0, 5).map((s) => (
                                                <tr key={s._id}>
                                                    <td style={{ fontSize: '14px', fontWeight: 500, color: '#fff', textTransform: 'capitalize' }}>{s.language}</td>
                                                    <td><span className={`score-badge ${s.status === 'accepted' ? 'score-high' : s.status === 'pending' ? 'score-mid' : 'score-low'}`}>{s.status}</span></td>
                                                    <td style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{s.score}</td>
                                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* Application Tracking */}
                        <motion.div style={{ ...card, overflow: 'hidden' }}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>My Job Applications</h3>
                                <Link to="/candidate/jobs" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>Browse Jobs &rarr;</Link>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                {profile?.applications?.length > 0 ? (
                                    <table className="data-table" style={{ width: '100%', minWidth: '600px' }}>
                                        <thead><tr><th>Job Title</th><th>Company</th><th>Status</th><th>Match Score</th><th>Applied On</th></tr></thead>
                                        <tbody>
                                            {profile.applications.map((app) => (
                                                <tr key={app._id}>
                                                    <td style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{app.jobId?.title || 'Unknown Job'}</td>
                                                    <td style={{ fontSize: '14px', color: '#cbd5e1' }}>{app.jobId?.company || '-'}</td>
                                                    <td>
                                                        <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontWeight: 500, backgroundColor: app.status === 'Offer Sent' ? 'rgba(52,211,153,0.1)' : app.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)', color: app.status === 'Offer Sent' ? '#34d399' : app.status === 'Rejected' ? '#f87171' : '#a5b4fc' }}>
                                                            {app.status}
                                                        </span>
                                                        {app.scheduledInterviewDate && (
                                                            <div style={{ fontSize: '12px', color: '#34d399', marginTop: '6px', fontWeight: 500 }}>
                                                                🗓️ {new Date(app.scheduledInterviewDate).toLocaleString()}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '40px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                                <div style={{ height: '100%', width: `${app.aiMatchScore}%`, backgroundColor: '#34d399' }}></div>
                                                            </div>
                                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{app.aiMatchScore}%</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '13px', color: '#64748b' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                        <p style={{ marginBottom: '16px' }}>You haven't applied to any jobs yet.</p>
                                        <Link to="/candidate/jobs" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '14px' }}>Find Jobs</Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </PageTransition>
    );
}
