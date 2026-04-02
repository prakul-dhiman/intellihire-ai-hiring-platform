import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { PageTransition } from '../../components/Motion';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function CreateJob() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        title: '',
        company: '',
        description: '',
        requiredSkills: '',
        preferredSkills: '',
        experience: '0-1',
        jobType: 'Full-time',
        location: 'Remote',
        salaryRange: '',
        deadline: '',
        positions: 1,
        codingTestRequired: false,
        status: 'open'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const payload = {
            ...form,
            requiredSkills: form.requiredSkills.split(',').map(s => s.trim()).filter(s => s),
            preferredSkills: form.preferredSkills.split(',').map(s => s.trim()).filter(s => s)
        };

        try {
            await api.post('/jobs', payload);
            navigate('/recruiter/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Post a New Job</h1>
                    <p style={{ color: '#94a3b8' }}>Fill in the details to publish a new job posting.</p>
                </div>

                <motion.div style={{ ...card, padding: '32px' }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                >
                    {error && (
                        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Job Title</label>
                                <input type="text" name="title" className="input-field" placeholder="e.g. Senior Frontend Developer" required value={form.title} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Company Name</label>
                                <input type="text" name="company" className="input-field" placeholder="e.g. Acme Corp" required value={form.company} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Job Description</label>
                            <textarea name="description" className="input-field" rows="6" placeholder="Describe the role, responsibilities, and requirements in detail..." required value={form.description} onChange={handleChange}></textarea>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Required Skills (comma-separated)</label>
                                <input type="text" name="requiredSkills" className="input-field" placeholder="React, Node.js, TypeScript" value={form.requiredSkills} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Preferred Skills (Optional)</label>
                                <input type="text" name="preferredSkills" className="input-field" placeholder="Docker, AWS, GraphQL" value={form.preferredSkills} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Experience</label>
                                <select name="experience" className="input-field" value={form.experience} onChange={handleChange} required>
                                    <option value="0-1">0-1 Years</option>
                                    <option value="1-3">1-3 Years</option>
                                    <option value="3-5">3-5 Years</option>
                                    <option value="5+">5+ Years</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Job Type</label>
                                <select name="jobType" className="input-field" value={form.jobType} onChange={handleChange} required>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Location</label>
                                <select name="location" className="input-field" value={form.location} onChange={handleChange} required>
                                    <option value="Remote">Remote</option>
                                    <option value="Onsite">Onsite</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </div>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Status</label>
                                <select name="status" className="input-field" value={form.status} onChange={handleChange} required>
                                    <option value="draft">Draft</option>
                                    <option value="open">Open (Published)</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Salary Range</label>
                                <input type="text" name="salaryRange" className="input-field" placeholder="$80k - $120k" required value={form.salaryRange} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Positions</label>
                                <input type="number" name="positions" className="input-field" min="1" required value={form.positions} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="input-label" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Application Deadline</label>
                                <input type="date" name="deadline" className="input-field" required value={form.deadline} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', backgroundColor: 'rgba(99,102,241,0.05)', marginBottom: '32px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                <input type="checkbox" name="codingTestRequired" style={{ width: '20px', height: '20px', accentColor: '#818cf8', cursor: 'pointer' }} checked={form.codingTestRequired} onChange={handleChange} />
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>Require Coding Test</div>
                                    <div style={{ fontSize: '13px', color: '#94a3b8' }}>Candidates must complete a short coding assessment before being shortlisted.</div>
                                </div>
                            </label>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                            <button type="button" onClick={() => navigate('/recruiter/dashboard')} className="btn-secondary" style={{ padding: '12px 24px' }}>Cancel</button>
                            <button type="submit" className="btn-primary" style={{ padding: '12px 32px' }} disabled={loading}>
                                {loading ? 'Saving...' : 'Save Job Post'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </PageTransition>
    );
}
