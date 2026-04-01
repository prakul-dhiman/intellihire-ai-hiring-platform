import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PageTransition, Skeleton } from '../../components/Motion';
import { HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineDocumentText } from 'react-icons/hi';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function RecruiterDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/jobs/recruiter/my-jobs')
            .then(res => setJobs(res.data.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const openJobs = jobs.filter(j => j.status === 'open').length;

    return (
        <PageTransition>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Recruiter Dashboard</h1>
                        <p style={{ color: '#94a3b8' }}>Manage your job postings and applicants</p>
                    </div>
                    <Link to="/recruiter/jobs/create" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        + Post New Job
                    </Link>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                    <motion.div style={{ ...card, padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineBriefcase size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{jobs.length}</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Total Jobs Posted</div>
                        </div>
                    </motion.div>
                    <motion.div style={{ ...card, padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(52,211,153,0.1)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineBriefcase size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{openJobs}</div>
                            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Active Open Jobs</div>
                        </div>
                    </motion.div>
                </div>

                {/* Job Postings */}
                <motion.div style={{ ...card, overflow: 'hidden' }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>Your Job Postings</h2>
                    </div>
                    {loading ? (
                        <div style={{ padding: '24px' }}><Skeleton height="200px" /></div>
                    ) : jobs.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                            <p style={{ marginBottom: '16px' }}>You haven't posted any jobs yet.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table" style={{ width: '100%', minWidth: '800px' }}>
                                <thead>
                                    <tr>
                                        <th>Job Title</th>
                                        <th>Job Type</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Created On</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map(job => (
                                        <tr key={job._id}>
                                            <td style={{ fontWeight: 600, color: '#fff' }}>{job.title}</td>
                                            <td style={{ color: '#cbd5e1' }}>{job.jobType}</td>
                                            <td style={{ color: '#cbd5e1' }}>{job.location}</td>
                                            <td>
                                                <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', fontWeight: 500, backgroundColor: job.status === 'open' ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', color: job.status === 'open' ? '#34d399' : '#f87171' }}>
                                                    {job.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ color: '#64748b' }}>{new Date(job.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <Link to={`/recruiter/jobs/${job._id}`} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px', textDecoration: 'none' }}>
                                                    Manage Candidates
                                                </Link>
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
