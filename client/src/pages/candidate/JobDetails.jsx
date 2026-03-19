import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PageTransition, Skeleton, ScoreRing } from '../../components/Motion';
import { HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineOfficeBuilding } from 'react-icons/hi';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [coverMessage, setCoverMessage] = useState('');
    const [portfolioUrl, setPortfolioUrl] = useState('');

    const [applicationResult, setApplicationResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/jobs/${id}`)
            .then(res => setJob(res.data.data))
            .catch(err => setError(err.response?.data?.message || 'Error fetching job'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleApply = async (e) => {
        e.preventDefault();
        setApplying(true);
        setError('');
        try {
            const res = await api.post(`/jobs/${id}/apply`, { coverMessage, portfolioUrl });
            setApplicationResult(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply. Make sure you have uploaded your resume.');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <PageTransition><div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}><Skeleton height="400px" /></div></PageTransition>
    );

    if (!job && !loading) return (
        <PageTransition><div style={{ textAlign: 'center', padding: '64px' }}>Job not found</div></PageTransition>
    );

    return (
        <PageTransition>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

                {/* Left Col: Details */}
                <div style={{ flex: 1 }}>
                    <motion.div style={{ ...card, padding: '32px', marginBottom: '24px' }}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{job.title}</h1>
                                <div style={{ fontSize: '18px', color: '#818cf8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineOfficeBuilding /> {job.company}
                                </div>
                            </div>
                            <span style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '8px', backgroundColor: job.status === 'open' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', color: job.status === 'open' ? '#34d399' : '#f87171', fontWeight: 600 }}>
                                {job.status.toUpperCase()}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}><HiOutlineLocationMarker size={20} className="text-indigo-400" /> {job.location}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}><HiOutlineBriefcase size={20} className="text-indigo-400" /> {job.experience} Yrs Experience</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}><HiOutlineCurrencyDollar size={20} className="text-indigo-400" /> {job.salaryRange}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}><HiOutlineCalendar size={20} className="text-indigo-400" /> Deadline: {new Date(job.deadline).toLocaleDateString()}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}><strong>Type:</strong> {job.jobType}</div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Job Description</h3>
                            <div style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {job.description}
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Required Skills</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {job.requiredSkills.map(skill => (
                                    <span key={skill} style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: '14px', fontWeight: 500 }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {job.preferredSkills?.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>Preferred Skills</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {job.preferredSkills.map(skill => (
                                        <span key={skill} style={{ padding: '6px 14px', borderRadius: '8px', backgroundColor: 'rgba(148,163,184,0.1)', color: '#cbd5e1', fontSize: '14px', fontWeight: 500 }}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Col: Apply Form or Success Result */}
                <div style={{ width: '350px', position: 'sticky', top: '100px' }}>
                    <AnimatePresence mode="wait">
                        {applicationResult ? (
                            <motion.div key="success" style={{ ...card, padding: '32px', textAlign: 'center' }}
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            >
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 13L9 17L19 7" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Application Submitted!</h3>
                                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>Your profile has been matched successfully.</p>

                                <div style={{ backgroundColor: 'rgba(10,6,30,0.5)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                                    <ScoreRing score={applicationResult.aiMatchScore} size={120} strokeWidth={8} color="#818cf8" />
                                    <div style={{ marginTop: '16px', fontSize: '15px', fontWeight: 600, color: '#fff' }}>AI Match Score</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Based on your resume and skills</div>
                                </div>

                                <button onClick={() => navigate('/candidate/dashboard')} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="apply" style={{ ...card, padding: '24px' }}
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            >
                                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '20px' }}>Apply for this job</h3>
                                {error && (
                                    <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '8px', fontSize: '13px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                                        {error}
                                    </div>
                                )}
                                <form onSubmit={handleApply}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Portfolio / GitHub URL (Optional)</label>
                                        <input type="url" className="input-field" placeholder="https://" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} />
                                    </div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Cover Message</label>
                                        <textarea className="input-field" rows="4" placeholder="Why are you a good fit?" value={coverMessage} onChange={e => setCoverMessage(e.target.value)} required></textarea>
                                    </div>

                                    <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                                        <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                                            <strong style={{ color: '#cbd5e1' }}>Note:</strong> Your existing uploaded resume and profile scores will be automatically attached to this application to be matched by our AI.
                                        </p>
                                    </div>

                                    <button type="submit" disabled={applying || job.status !== 'open'} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                                        {applying ? 'Submitting...' : job.status !== 'open' ? 'Job Closed' : 'Submit Application'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </PageTransition>
    );
}
