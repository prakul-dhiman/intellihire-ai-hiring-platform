import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { PageTransition, ScoreRing, Skeleton } from '../../components/Motion';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function CandidateDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scoreInput, setScoreInput] = useState('');
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchData = () => {
        api.get(`/admin/candidate/${id}`)
            .then((res) => setData(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [id]);

    const handleScoreSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/admin/interview-score', { candidateId: id, score: Number(scoreInput), feedback });
            setMessage({ type: 'success', text: 'Interview score assigned!' });
            setScoreInput(''); setFeedback(''); fetchData();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit' });
        } finally { setSubmitting(false); }
    };

    if (loading) return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
            <Skeleton height="80px" className="w-full mb-6" />
            <div className="grid grid-cols-3 gap-4 mb-6">{[1, 2, 3].map(i => <Skeleton key={i} height="120px" />)}</div>
        </div>
    );

    if (!data) return <div style={{ textAlign: 'center', padding: '80px 0', fontSize: '14px', color: '#64748b' }}>Candidate not found</div>;

    const { candidate, resume, submissions, interviewScores } = data;
    const scoreBadge = (s) => s >= 70 ? 'score-high' : s >= 40 ? 'score-mid' : 'score-low';

    return (
        <PageTransition>
            <div>
                <Link to="/admin/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 600, color: '#818cf8', marginBottom: '16px' }}>← Back to Dashboard</Link>

                {/* Header */}
                <div style={{ ...card, padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #6366f1, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', fontWeight: 700, flexShrink: 0 }}>
                        {candidate.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{candidate.name}</h1>
                        <p style={{ fontSize: '14px', color: '#64748b' }}>{candidate.email}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '2px' }}>Final Score</p>
                        <p style={{ fontSize: '28px', fontWeight: 800, background: 'linear-gradient(90deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {candidate.finalScore?.toFixed(1)}
                        </p>
                    </div>
                </div>

                {/* Score Rings */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Resume', score: candidate.resumeScore ?? 0, color: '#34d399' },
                        { label: 'Coding', score: candidate.codingScore ?? 0, color: '#38bdf8' },
                        { label: 'Interview', score: candidate.interviewScore ?? 0, color: '#fbbf24' },
                    ].map(({ label, score, color }, i) => (
                        <motion.div key={label} style={{ ...card, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                            <ScoreRing score={score} size={80} strokeWidth={6} color={color} />
                            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginTop: '12px' }}>{label}</p>
                        </motion.div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Resume */}
                    <div style={{ ...card, padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Resume Details</h3>
                        {resume ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>Skills</span>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                        {resume.skills?.map((s, i) => <span key={i} className="tag">{s}</span>)}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '14px', color: '#64748b' }}>Experience</span><span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{resume.experience} years</span></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '14px', color: '#64748b' }}>Education</span><span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{resume.education}</span></div>
                                {resume.summary && <div><span style={{ fontSize: '14px', color: '#64748b' }}>Summary</span><p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{resume.summary}</p></div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>Score</span>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>{resume.score}/100</span>
                                </div>
                            </div>
                        ) : (
                            <p style={{ fontSize: '14px', color: '#64748b' }}>No resume submitted</p>
                        )}

                        {/* Additional Resume Sections */}
                        {resume && (resume.projects?.length > 0 || resume.certifications?.length > 0 || resume.links) && (
                            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>
                                {resume.links && (Object.values(resume.links).some(v => v)) && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', display: 'block', marginBottom: '8px' }}>Links</span>
                                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                            {resume.links.linkedin && <a href={resume.links.linkedin} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none' }}>LinkedIn</a>}
                                            {resume.links.github && <a href={resume.links.github} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none' }}>GitHub</a>}
                                            {resume.links.portfolio && <a href={resume.links.portfolio} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#818cf8', textDecoration: 'none' }}>Portfolio</a>}
                                        </div>
                                    </div>
                                )}

                                {resume.certifications?.length > 0 && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', display: 'block', marginBottom: '8px' }}>Certifications</span>
                                        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#94a3b8' }}>
                                            {resume.certifications.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {resume.projects?.length > 0 && (
                                    <div>
                                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', display: 'block', marginBottom: '8px' }}>Projects</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {resume.projects.map((p, i) => (
                                                <div key={i} style={{ background: 'rgba(10,6,30,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.05)' }}>
                                                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{p.name}</h4>
                                                    <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{p.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Interview Score & AI Feedback */}
                    <div style={{ ...card, padding: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#8b5cf6' }}>🤖</span> AI Interview Evaluation
                        </h3>

                        {candidate.interviewScore > 0 ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(99,102,241,0.1)', marginBottom: '16px' }}>
                                    <div>
                                        <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '4px' }}>AI Generated Score</p>
                                        <p style={{ fontSize: '24px', fontWeight: 800, color: '#fbbf24' }}>{candidate.interviewScore}<span style={{ fontSize: '14px', color: '#64748b' }}>/100</span></p>
                                    </div>
                                    <div style={{ background: 'rgba(139,92,246,0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(139,92,246,0.2)' }}>
                                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa' }}>AUTOMATED ANALYZER</span>
                                    </div>
                                </div>

                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', marginBottom: '8px' }}>Analysis Feedback</p>
                                    <div style={{ background: 'rgba(10,6,30,0.4)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(99,102,241,0.08)' }}>
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>
                                            {candidate.interviewFeedback || "AI analysis completed. No detailed feedback provided."}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>Candidate has not completed the AI Video Interview yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Coding Submissions */}
                {submissions?.length > 0 && (
                    <div style={{ ...card, overflow: 'hidden', marginTop: '24px' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Coding Submissions</h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead><tr><th>Language</th><th>Status</th><th>Score</th><th>Date</th></tr></thead>
                                <tbody>
                                    {submissions.map((s) => (
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
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
