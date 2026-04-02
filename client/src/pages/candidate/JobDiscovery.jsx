import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PageTransition, Skeleton } from '../../components/Motion';
import { HiOutlineSearch, HiOutlineBriefcase, HiOutlineLocationMarker, HiOutlineCurrencyDollar } from 'react-icons/hi';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function JobDiscovery() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', location: '', jobType: '', experience: '' });

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/jobs', { params: filters });
            setJobs(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [filters.location, filters.jobType, filters.experience]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchJobs();
    };

    return (
        <PageTransition>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Find Your Next Role</h1>
                    <p style={{ color: '#94a3b8' }}>Discover opportunities that match your skills and experience.</p>
                </div>

                {/* Filter Bar */}
                <div style={{ ...card, padding: '20px', marginBottom: '32px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 250px', position: 'relative' }}>
                            <HiOutlineSearch size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                            <input type="text" placeholder="Search by title, skill, or company" className="input-field" style={{ paddingLeft: '48px' }}
                                value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
                        </div>
                        <select className="input-field" style={{ flex: '1 1 150px' }} value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })}>
                            <option value="">All Locations</option>
                            <option value="Remote">Remote</option>
                            <option value="Onsite">Onsite</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                        <select className="input-field" style={{ flex: '1 1 150px' }} value={filters.jobType} onChange={e => setFilters({ ...filters, jobType: e.target.value })}>
                            <option value="">All Job Types</option>
                            <option value="Full-time">Full-time</option>
                            <option value="Internship">Internship</option>
                            <option value="Contract">Contract</option>
                        </select>
                        <select className="input-field" style={{ flex: '1 1 150px' }} value={filters.experience} onChange={e => setFilters({ ...filters, experience: e.target.value })}>
                            <option value="">Any Experience</option>
                            <option value="0-1">0-1 Years</option>
                            <option value="1-3">1-3 Years</option>
                            <option value="3-5">3-5 Years</option>
                            <option value="5+">5+ Years</option>
                        </select>
                        <button type="submit" className="btn-primary" style={{ flex: '0 0 auto', padding: '0 24px' }}>Search</button>
                    </form>
                </div>

                {/* Job List */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[1, 2, 3].map(i => <Skeleton key={i} height="150px" />)}
                    </div>
                ) : jobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'rgba(30,27,75,0.4)', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>No jobs found</h3>
                        <p style={{ color: '#94a3b8' }}>Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                        {jobs.map((job, i) => (
                            <motion.div key={job._id} style={{ ...card, padding: '24px', display: 'flex', flexDirection: 'column' }}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{job.title}</h3>
                                        <div style={{ fontSize: '14px', color: '#818cf8', fontWeight: 500 }}>{job.company}</div>
                                    </div>
                                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>
                                        {job.jobType}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', fontSize: '13px', color: '#94a3b8' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlineLocationMarker /> {job.location}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlineBriefcase /> {job.experience} Yrs</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><HiOutlineCurrencyDollar /> {job.salaryRange}</span>
                                </div>

                                <div style={{ marginBottom: '24px', flex: 1 }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {job.requiredSkills.slice(0, 4).map(skill => (
                                            <span key={skill} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '100px', backgroundColor: 'rgba(148,163,184,0.1)', color: '#cbd5e1' }}>
                                                {skill}
                                            </span>
                                        ))}
                                        {job.requiredSkills.length > 4 && (
                                            <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '100px', backgroundColor: 'rgba(148,163,184,0.1)', color: '#cbd5e1' }}>
                                                +{job.requiredSkills.length - 4}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Link to={`/candidate/jobs/${job._id}`} style={{ textDecoration: 'none' }}>
                                    <button className="btn-secondary" style={{ width: '100%', padding: '12px' }}>View Details & Apply</button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
