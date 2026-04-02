import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { PageTransition, Skeleton } from '../../components/Motion';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function AdminDashboard() {
    const [candidates, setCandidates] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [topN, setTopN] = useState('ALL'); // 'ALL' or a number like 100, 500
    const [sortedCandidates, setSortedCandidates] = useState([]);

    useEffect(() => {
        api.get('/admin/candidates').then((res) => {
            const cands = res.data.data.candidates || [];
            setCandidates(cands);
            const evaluated = cands.filter(c => c.interviewScore > 0).length;
            const avgScore = cands.length ? (cands.reduce((a, c) => a + (c.finalScore || 0), 0) / cands.length) : 0;
            const passed = cands.filter(c => c.finalScore >= 70).length;
            setStats({ total: cands.length, evaluated, avg: avgScore.toFixed(1), passed, passRate: cands.length ? ((passed / cands.length) * 100).toFixed(0) : 0 });
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    // Effect to handle sorting/limiting when topN changes
    useEffect(() => {
        let sorted = [...candidates];
        if (topN !== 'ALL') {
            // Sort by final score descending
            sorted.sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
            sorted = sorted.slice(0, Number(topN));
        } else {
            // Default: Most recent first (how the backend sends them)
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        setSortedCandidates(sorted);
    }, [topN, candidates]);

    const scoreBadge = (s) => s >= 70 ? 'score-high' : s >= 40 ? 'score-mid' : 'score-low';

    return (
        <PageTransition>
            <div>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Dashboard</h1>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Platform overview and recent candidates</p>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height="100px" />)}
                    </div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5" style={{ gap: '16px', marginBottom: '32px' }}>
                            {[
                                { icon: '👥', label: 'Total Candidates', value: stats.total, color: '#818cf8' },
                                { icon: '✅', label: 'Evaluated', value: stats.evaluated, color: '#34d399' },
                                { icon: '📊', label: 'Avg Score', value: stats.avg, color: '#38bdf8' },
                                { icon: '🎯', label: 'Passed (≥70)', value: stats.passed, color: '#fbbf24' },
                                { icon: '📈', label: 'Pass Rate', value: `${stats.passRate}%`, color: '#a78bfa' },
                            ].map(({ icon, label, value, color }, i) => (
                                <motion.div
                                    key={label}
                                    style={{ ...card, padding: '20px' }}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '20px' }}>{icon}</span>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}></div>
                                    </div>
                                    <p style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{value}</p>
                                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginTop: '2px' }}>{label}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px', marginBottom: '32px' }}>
                            {[
                                { to: '/admin/leaderboard', icon: '🏆', title: 'Leaderboard', desc: 'View ranked candidates' },
                                { to: '/admin/analytics', icon: '📊', title: 'Analytics', desc: 'Platform insights & charts' },
                                { to: '/admin/dashboard', icon: '⚡', title: 'Evaluate', desc: 'Score interview candidates' },
                            ].map(({ to, icon, title, desc }) => (
                                <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                                    <div style={{ ...card, padding: '20px', transition: 'all 0.2s', cursor: 'pointer' }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '24px' }}>{icon}</span>
                                            <div>
                                                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{title}</h3>
                                                <p style={{ fontSize: '13px', color: '#64748b' }}>{desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Candidates Table */}
                        <div style={{ ...card, overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(99,102,241,0.1)', flexWrap: 'wrap', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Candidates List</h3>
                                    <span className="tag" style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                                        {sortedCandidates.length} showing {topN === 'ALL' ? `(out of ${candidates.length} total)` : ''}
                                    </span>
                                </div>

                                {/* Top N Selector */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Select Top:</span>
                                    <select
                                        value={topN}
                                        onChange={(e) => setTopN(e.target.value)}
                                        style={{
                                            background: 'rgba(10,6,30,0.5)', border: '1px solid rgba(99,102,241,0.2)',
                                            color: '#e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        <option value="ALL">All Candidates</option>
                                        <option value="10">Top 10</option>
                                        <option value="50">Top 50</option>
                                        <option value="100">Top 100</option>
                                        <option value="500">Top 500</option>
                                        <option value="1000">Top 1000</option>
                                    </select>
                                    {topN !== 'ALL' && (
                                        <span style={{ fontSize: '11px', color: '#10b981', marginLeft: '4px', fontStyle: 'italic' }}>Sorted by Highest Final Score</span>
                                    )}
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Rank / Candidate</th>
                                            <th>Resume</th>
                                            <th>Coding</th>
                                            <th>Interview</th>
                                            <th>Final Score</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedCandidates.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No candidates found.</td>
                                            </tr>
                                        ) : sortedCandidates.map((c, idx) => (
                                            <tr key={c._id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        {topN !== 'ALL' && (
                                                            <div style={{
                                                                width: '24px', height: '24px', borderRadius: '50%', background: idx < 3 ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.1)',
                                                                color: idx < 3 ? '#fbbf24' : '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700
                                                            }}>
                                                                #{idx + 1}
                                                            </div>
                                                        )}
                                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                                                            {c.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{c.name}</p>
                                                            <p style={{ fontSize: '12px', color: '#475569' }}>{c.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span className={`score-badge ${scoreBadge(c.resumeScore)}`}>{c.resumeScore ?? 0}</span></td>
                                                <td><span className={`score-badge ${scoreBadge(c.codingScore)}`}>{c.codingScore ?? 0}</span></td>
                                                <td><span className={`score-badge ${scoreBadge(c.interviewScore)}`}>{c.interviewScore ?? 0}</span></td>
                                                <td><span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{c.finalScore?.toFixed(1) ?? '0.0'}</span></td>
                                                <td><Link to={`/admin/candidate/${c._id}`} style={{ fontSize: '13px', fontWeight: 600, color: '#818cf8' }}>View →</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </PageTransition>
    );
}
