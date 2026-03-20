import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { PageTransition, Skeleton } from '../../components/Motion';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function ManageJob() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    const stages = ['Applied', 'Resume Screening', 'Coding Test', 'Shortlisted', 'Interview Scheduled', 'Offer Sent', 'Hired', 'Rejected'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobRes, appRes] = await Promise.all([
                api.get(`/jobs/${id}`),
                api.get(`/jobs/${id}/applicants`)
            ]);
            setJob(jobRes.data.data);
            setApplicants(appRes.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const updateStatus = async (appId, status) => {
        let payload = { status };
        if (status === 'Interview Scheduled') {
            const dateStr = prompt('Enter interview date & time (e.g. 2026-03-10T14:00):');
            if (dateStr) {
                payload.scheduledInterviewDate = dateStr;
            } else {
                return; // cancelled
            }
        }

        try {
            await api.put(`/jobs/applications/${appId}/status`, payload);
            setApplicants(prev => prev.map(app => app._id === appId ? { ...app, ...payload } : app));
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const updateJobStatus = async (newStatus) => {
        try {
            await api.put(`/jobs/${id}`, { status: newStatus });
            setJob(prev => ({ ...prev, status: newStatus }));
        } catch (error) {
            alert('Failed to update job status');
        }
    };

    if (loading) return (
        <PageTransition><div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}><Skeleton height="400px" /></div></PageTransition>
    );

    if (!job) return (
        <PageTransition><div style={{ textAlign: 'center', padding: '64px' }}>Job not found</div></PageTransition>
    );

    return (
        <PageTransition>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Link to="/recruiter/dashboard" style={{ fontSize: '14px', color: '#94a3b8', textDecoration: 'none' }}>&larr; Back to Dashboard</Link>
                        </div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{job.title}</h1>
                        <p style={{ color: '#818cf8', fontWeight: 500 }}>{job.company} • {applicants.length} Applicants</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <select
                            className="input-field"
                            style={{ padding: '8px 16px', borderRadius: '8px', fontWeight: 600, backgroundColor: job.status === 'open' ? 'rgba(52,211,153,0.1)' : job.status === 'paused' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', color: job.status === 'open' ? '#34d399' : job.status === 'paused' ? '#fbbf24' : '#f87171', border: 'none', appearance: 'none', cursor: 'pointer' }}
                            value={job.status}
                            onChange={(e) => updateJobStatus(e.target.value)}
                        >
                            <option value="open">OPEN</option>
                            <option value="paused">PAUSED</option>
                            <option value="closed">CLOSED</option>
                            <option value="draft">DRAFT</option>
                        </select>
                    </div>
                </div>

                <motion.div style={{ ...card, overflow: 'hidden' }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>Applicant Tracking System</h2>
                    </div>

                    {applicants.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                            <p>No candidates have applied yet.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ width: '100%', minWidth: '1000px' }}>
                                <thead>
                                    <tr>
                                        <th>Candidate</th>
                                        <th>AI Score</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                        <th>Cover Message / Links</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.map(app => (
                                        <tr key={app._id}>
                                            <td>
                                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>{app.candidateId?.name}</div>
                                                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{app.candidateId?.email}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                                            </td>

                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '40px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${app.aiMatchScore}%`, backgroundColor: '#818cf8' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{Math.round(app.aiMatchScore)}%</span>
                                                </div>
                                            </td>

                                            <td>
                                                <select className="input-field" style={{ padding: '6px 12px', fontSize: '13px', minWidth: '160px' }}
                                                    value={app.status} onChange={e => updateStatus(app._id, e.target.value)}
                                                >
                                                    {stages.map(st => (
                                                        <option key={st} value={st}>{st}</option>
                                                    ))}
                                                </select>
                                                {app.scheduledInterviewDate && (
                                                    <div style={{ fontSize: '12px', color: '#34d399', marginTop: '6px' }}>
                                                        🗓️ {new Date(app.scheduledInterviewDate).toLocaleString()}
                                                    </div>
                                                )}
                                            </td>

                                            <td>
                                                <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {['Shortlisted', 'Offer Sent'].includes(app.status) || ['Hired'].includes(app.status) ? null : (
                                                            <>
                                                                <button onClick={() => updateStatus(app._id, 'Shortlisted')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>Shortlist</button>
                                                                <button onClick={() => updateStatus(app._id, 'Rejected')} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', backgroundColor: 'transparent', color: '#f87171', cursor: 'pointer' }}>Reject</button>
                                                            </>
                                                        )}
                                                    </div>
                                                    <Link to={`/recruiter/messages?user=${app.candidateId?._id}`} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8', textDecoration: 'none', textAlign: 'center', fontWeight: 600 }}>Message</Link>
                                                </div>
                                            </td>

                                            <td>
                                                <div style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {app.coverMessage || 'No cover message'}
                                                </div>
                                                {app.portfolioUrl && (
                                                    <a href={app.portfolioUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#818cf8', display: 'block', marginTop: '4px' }}>View Portfolio</a>
                                                )}
                                                {app.resumeUrl && (
                                                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#34d399', display: 'block', marginTop: '4px' }}>View Resume PDF</a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </PageTransition>
    );
}
