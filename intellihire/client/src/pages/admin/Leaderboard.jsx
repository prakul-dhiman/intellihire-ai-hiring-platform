import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { PageTransition, Skeleton } from '../../components/Motion';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

const PODIUM = [
    { badge: '🥇', glow: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' },
    { badge: '🥈', glow: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)' },
    { badge: '🥉', glow: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.25)' },
];

export default function Leaderboard() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const [limit, setLimit] = useState(10); // Dynamic limit for 'Top N' selection

    useEffect(() => {
        setLoading(true);
        // Note: For large Top N queries, we typically want them all on page 1
        api.get(`/admin/leaderboard?page=${page}&limit=${limit}`)
            .then((res) => {
                setCandidates(res.data.data.leaderboard || []);
                setPagination(res.data.data.pagination || {});
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [page, limit]);

    const scoreBadge = (s) => s >= 70 ? 'score-high' : s >= 40 ? 'score-mid' : 'score-low';

    // When showing big limits (Top N), we reset to page 1 to see the top performers
    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value));
        setPage(1);
    };

    const top3 = page === 1 ? candidates.slice(0, 3) : [];
    const rest = page === 1 ? candidates.slice(3) : candidates;

    return (
        <PageTransition>
            <div>
                <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Leaderboard</h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>Top candidates ranked by final score</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>Shortlist Top C.Vs:</span>
                        <select
                            value={limit}
                            onChange={handleLimitChange}
                            style={{
                                background: 'rgba(10,6,30,0.5)', border: '1px solid rgba(99,102,241,0.2)',
                                color: '#e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer'
                            }}
                        >
                            <option value={10}>Top 10 (Default)</option>
                            <option value={50}>Top 50</option>
                            <option value={100}>Top 100</option>
                            <option value={200}>Top 200</option>
                            <option value={500}>Top 500</option>
                            <option value={1000}>Top 1000</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height="60px" />)}
                    </div>
                ) : (
                    <>
                        {/* Podium */}
                        {top3.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '16px', marginBottom: '32px' }}>
                                {top3.map((c, i) => (
                                    <motion.div
                                        key={c.id || c._id}
                                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    >
                                        <Link to={`/admin/candidate/${c.id || c._id}`} style={{ textDecoration: 'none' }}>
                                            <div
                                                style={{
                                                    padding: '24px', borderRadius: '16px', textAlign: 'center',
                                                    backgroundColor: PODIUM[i].glow, border: `1px solid ${PODIUM[i].border}`,
                                                    transition: 'all 0.2s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                            >
                                                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{PODIUM[i].badge}</div>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#fff', fontSize: '22px', fontWeight: 700 }}>
                                                    {c.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{c.name}</h3>
                                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>{c.email}</p>
                                                <p style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                                    {c.finalScore?.toFixed(1)}
                                                </p>
                                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                                                    <span className={`score-badge ${scoreBadge(c.resumeScore)}`}>R:{c.resumeScore ?? 0}</span>
                                                    <span className={`score-badge ${scoreBadge(c.codingScore)}`}>C:{c.codingScore ?? 0}</span>
                                                    <span className={`score-badge ${scoreBadge(c.interviewScore)}`}>I:{c.interviewScore ?? 0}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Table */}
                        {rest.length > 0 && (
                            <div style={{ ...card, overflow: 'hidden', marginBottom: '16px' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="data-table">
                                        <thead><tr><th>Rank</th><th>Candidate</th><th>Resume</th><th>Coding</th><th>Interview</th><th>Final</th><th></th></tr></thead>
                                        <tbody>
                                            {rest.map((c, i) => {
                                                const rank = page === 1 ? i + 4 : (page - 1) * 10 + i + 1;
                                                return (
                                                    <tr key={c.id || c._id}>
                                                        <td><span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>#{rank}</span></td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                                                        <td><span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{c.finalScore?.toFixed(1)}</span></td>
                                                        <td><Link to={`/admin/candidate/${c.id || c._id}`} style={{ fontSize: '13px', fontWeight: 600, color: '#818cf8' }}>View →</Link></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage}
                                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#818cf8', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', cursor: 'pointer', opacity: pagination.hasPrevPage ? 1 : 0.3 }}>
                                    ← Prev
                                </button>
                                <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Page {pagination.currentPage} of {pagination.totalPages}</span>
                                <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNextPage}
                                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#818cf8', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', cursor: 'pointer', opacity: pagination.hasNextPage ? 1 : 0.3 }}>
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PageTransition>
    );
}
