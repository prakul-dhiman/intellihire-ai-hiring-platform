import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import { PageTransition, ScoreRing, Skeleton } from '../../components/Motion';
import {
    HiOutlineDocumentText, HiOutlineUpload, HiOutlineAcademicCap,
    HiOutlineBriefcase, HiOutlineLightningBolt, HiOutlineUser,
    HiOutlineStar, HiOutlineCheck, HiOutlinePlusCircle, HiOutlineX,
    HiOutlineChartBar, HiOutlineClipboardList, HiOutlineLink,
} from 'react-icons/hi';

const card = { background: 'linear-gradient(135deg,rgba(30,27,75,0.55),rgba(20,16,55,0.45))', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '14px' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', fontFamily: "'Inter',sans-serif", background: 'rgba(10,6,30,0.5)', border: '1px solid rgba(99,102,241,0.1)', color: '#e2e8f0', outline: 'none', transition: 'border-color 0.2s' };

/* ─── Skill Tag Input ─────────────────────────────────────── */
function SkillInput({ skills, setSkills }) {
    const [input, setInput] = useState('');
    const add = () => {
        const s = input.trim();
        if (s && !skills.includes(s)) { setSkills([...skills, s]); setInput(''); }
    };
    const remove = (i) => setSkills(skills.filter((_, idx) => idx !== i));
    return (
        <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {skills.map((s, i) => (
                    <motion.span key={s} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        {s}
                        <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, display: 'flex' }}><HiOutlineX size={12} /></button>
                    </motion.span>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a skill and press Enter..."
                    style={inputStyle}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.1)'} />
                <button type="button" onClick={add} style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HiOutlinePlusCircle size={14} /> Add
                </button>
            </div>
        </div>
    );
}

/* ─── Score Breakdown ─────────────────────────────────────── */
function ScoreBreakdown({ resume }) {
    if (!resume) return null;
    const skillPts = Math.min(30, (resume.skills?.length || 0) * 5);
    const expPts = Math.min(30, (resume.experience || 0) * 5);
    const eduPts = resume.education ? 20 : 0;
    const sumPts = (resume.summary?.length || 0) >= 50 ? 20 : 0;
    const items = [
        { label: 'Skills', pts: skillPts, max: 30, color: '#818cf8', icon: HiOutlineLightningBolt },
        { label: 'Experience', pts: expPts, max: 30, color: '#34d399', icon: HiOutlineBriefcase },
        { label: 'Education', pts: eduPts, max: 20, color: '#fbbf24', icon: HiOutlineAcademicCap },
        { label: 'Summary', pts: sumPts, max: 20, color: '#06b6d4', icon: HiOutlineUser },
    ];
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {items.map(({ label, pts, max, color, icon: Icon }) => (
                <div key={label} style={{ padding: '12px 14px', borderRadius: '10px', background: 'rgba(10,6,30,0.4)', border: '1px solid rgba(99,102,241,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Icon size={14} style={{ color }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>{label}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '13px', fontWeight: 700, color }}>{pts}/{max}</span>
                    </div>
                    <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(10,6,30,0.5)', overflow: 'hidden' }}>
                        <motion.div style={{ height: '100%', borderRadius: '2px', background: color }}
                            initial={{ width: 0 }} animate={{ width: `${(pts / max) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── File Upload ─────────────────────────────────────────── */
function FileUpload({ file, setFile }) {
    const ref = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); };
    return (
        <div
            onClick={() => ref.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
                border: `2px dashed ${dragOver ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.15)'}`,
                borderRadius: '12px', padding: '28px 20px', textAlign: 'center', cursor: 'pointer',
                background: dragOver ? 'rgba(99,102,241,0.04)' : 'rgba(10,6,30,0.3)',
                transition: 'all 0.2s',
            }}
        >
            <input ref={ref} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                onChange={e => e.target.files[0] && setFile(e.target.files[0])} />
            {file ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <HiOutlineDocumentText size={24} style={{ color: '#34d399' }} />
                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>{file.name}</p>
                        <p style={{ fontSize: '11px', color: '#64748b' }}>{(file.size / 1024).toFixed(0)} KB — Click to change</p>
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: '4px' }}>
                        <HiOutlineX size={16} />
                    </button>
                </div>
            ) : (
                <>
                    <HiOutlineUpload size={28} style={{ color: '#818cf8', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#c7d2fe', marginBottom: '4px' }}>
                        Drop your resume here or <span style={{ color: '#818cf8', textDecoration: 'underline' }}>browse</span>
                    </p>
                    <p style={{ fontSize: '12px', color: '#475569' }}>PDF, DOC, DOCX — Max 5 MB</p>
                </>
            )}
        </div>
    );
}

/* ━━━ MAIN COMPONENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function ResumeForm() {
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [skills, setSkills] = useState([]);
    const [experience, setExperience] = useState('');
    const [education, setEducation] = useState('');
    const [summary, setSummary] = useState('');
    const [file, setFile] = useState(null);
    const [activeSection, setActiveSection] = useState(0);
    const [isScanning, setIsScanning] = useState(false);

    // AI Scanner Specific Logic
    const handleAIScan = async () => {
        if (!file) return;
        setIsScanning(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('resumeFile', file);

        try {
            const res = await api.post('/candidate/resume/scan', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const extracted = res.data.data.extracted;

            if (extracted.skills?.length) setSkills(extracted.skills);
            if (extracted.experience) setExperience(extracted.experience);
            if (extracted.education) setEducation(extracted.education);
            if (extracted.summary) setSummary(extracted.summary);
            if (extracted.projects?.length) setProjects(extracted.projects);
            if (extracted.certifications?.length) setCertifications(extracted.certifications);

            setIsScanning(false);
            setActiveSection(1); // Jump to Skills section
            setMessage({ type: 'success', text: 'AI successfully analyzed and scored your CV. Review the extracted details.' });
        } catch (error) {
            setIsScanning(false);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to parse CV. Ensure it is a valid PDF.' });
        }
    };

    // Links & Projects (client-side only, for premium feel)
    const [linkedin, setLinkedin] = useState('');
    const [github, setGithub] = useState('');
    const [portfolio, setPortfolio] = useState('');
    const [projects, setProjects] = useState([{ name: '', desc: '' }]);
    const [certifications, setCertifications] = useState(['']);

    useEffect(() => {
        api.get('/candidate/resume')
            .then((res) => {
                const r = res.data.data.resume;
                setResume(r);
                setSkills(r.skills || []);
                setExperience(r.experience?.toString() || '');
                setEducation(r.education || '');
                setSummary(r.summary || '');
                if (r.projects?.length) setProjects(r.projects);
                if (r.certifications?.length) setCertifications(r.certifications);
                if (r.links) {
                    setLinkedin(r.links.linkedin || '');
                    setGithub(r.links.github || '');
                    setPortfolio(r.links.portfolio || '');
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setMessage({ type: '', text: '' });
        const payload = {
            skills,
            experience: Number(experience),
            education,
            summary,
            certifications: certifications.filter(c => c.trim() !== ''),
            projects: projects.filter(p => p.name.trim() !== ''),
            links: { linkedin, github, portfolio }
        };
        try {
            const res = resume
                ? await api.put('/candidate/resume', payload)
                : await api.post('/candidate/resume', payload);
            setResume(res.data.data.resume);
            setMessage({ type: 'success', text: resume ? 'Resume updated!' : 'Resume submitted!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Something went wrong' });
        } finally { setSaving(false); }
    };

    // Live score calculation
    const liveScore = Math.min(100,
        Math.min(30, skills.length * 5) +
        Math.min(30, (Number(experience) || 0) * 5) +
        (education ? 20 : 0) +
        ((summary?.length || 0) >= 50 ? 20 : 0)
    );

    const sections = [
        { icon: HiOutlineUpload, label: 'Upload' },
        { icon: HiOutlineLightningBolt, label: 'Skills' },
        { icon: HiOutlineBriefcase, label: 'Experience' },
        { icon: HiOutlineAcademicCap, label: 'Education' },
        { icon: HiOutlineLink, label: 'Links' },
        { icon: HiOutlineClipboardList, label: 'Projects' },
    ];

    if (loading) return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
            <Skeleton height="40px" className="w-48 mb-6" />
            <Skeleton height="400px" className="w-full" />
        </div>
    );

    return (
        <PageTransition>
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 24px 60px' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <HiOutlineDocumentText size={18} style={{ color: '#fff' }} />
                            </div>
                            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff' }}>Resume Builder</h1>
                        </div>
                        <p style={{ fontSize: '13px', color: '#64748b', marginLeft: '46px' }}>
                            {resume ? 'Update your resume to improve your score' : 'Build your professional profile to get scored'}
                        </p>
                    </div>
                    {/* Live score */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>Live Score</p>
                            <p style={{ fontSize: '28px', fontWeight: 800, color: liveScore >= 70 ? '#34d399' : liveScore >= 40 ? '#fbbf24' : '#f87171', lineHeight: 1 }}>
                                {liveScore}<span style={{ fontSize: '14px', color: '#475569' }}>/100</span>
                            </p>
                        </div>
                        <ScoreRing score={liveScore} size={56} strokeWidth={5} color={liveScore >= 70 ? '#34d399' : liveScore >= 40 ? '#fbbf24' : '#f87171'} />
                    </div>
                </motion.div>

                {/* Score Breakdown */}
                {resume && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        style={{ marginBottom: '20px' }}>
                        <ScoreBreakdown resume={{ ...resume, skills, experience: Number(experience), education, summary }} />
                    </motion.div>
                )}

                {/* Message */}
                <AnimatePresence>
                    {message.text && (
                        <motion.div style={{
                            marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', fontSize: '13px',
                            background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                            color: message.type === 'success' ? '#34d399' : '#f87171', display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            {message.type === 'success' ? <HiOutlineCheck size={16} /> : <HiOutlineX size={16} />}
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Section Tabs */}
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    style={{ display: 'flex', gap: '4px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {sections.map(({ icon: Icon, label }, i) => (
                        <button key={label} type="button" onClick={() => setActiveSection(i)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                color: activeSection === i ? '#fff' : '#64748b',
                                background: activeSection === i ? 'rgba(99,102,241,0.15)' : 'transparent',
                                transition: 'all 0.15s',
                            }}>
                            <Icon size={13} /> {label}
                        </button>
                    ))}
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <motion.div key={activeSection} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} style={{ ...card, padding: '28px' }}>

                        {/* Upload Section */}
                        {activeSection === 0 && (
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineUpload size={18} style={{ color: '#818cf8' }} /> Upload Resume
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Upload your resume file for reference (scoring is based on the form data below)</p>
                                <FileUpload file={file} setFile={setFile} />

                                {file && (
                                    <div style={{ marginTop: '24px' }}>
                                        {isScanning ? (
                                            <div style={{ background: 'rgba(30,27,75,0.8)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                                                <HiOutlineLightningBolt size={32} style={{ color: '#8b5cf6', margin: '0 auto 12px', animation: 'pulse 1s infinite' }} />
                                                <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>AI Engine Scanning Resume...</p>
                                                <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>Extracting structured data and evaluating experience metrics...</p>
                                                <div style={{ height: '6px', background: 'rgba(99,102,241,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3.2, ease: 'linear' }} style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #c084fc)' }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={handleAIScan} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(124,58,237,0.15))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#c084fc', fontSize: '15px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(124,58,237,0.1)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                                <HiOutlineLightningBolt size={20} />
                                                Auto-Scan CV & Calculate Score with AI
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Skills Section */}
                        {activeSection === 1 && (
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineLightningBolt size={18} style={{ color: '#fbbf24' }} /> Technical Skills
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Each skill adds 5 points (max 30 points) — Add your strongest skills first</p>
                                <SkillInput skills={skills} setSkills={setSkills} />
                                <p style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
                                    {skills.length} skill{skills.length !== 1 ? 's' : ''} added — <span style={{ color: skills.length >= 6 ? '#34d399' : '#fbbf24' }}>{Math.min(30, skills.length * 5)} / 30 points</span>
                                </p>
                                {/* Suggested skills */}
                                <div style={{ marginTop: '14px', padding: '12px', borderRadius: '8px', background: 'rgba(10,6,30,0.3)', border: '1px solid rgba(99,102,241,0.06)' }}>
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>💡 Suggested Skills</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'REST API', 'GraphQL', 'System Design'].filter(s => !skills.includes(s)).slice(0, 10).map(s => (
                                            <button key={s} type="button" onClick={() => setSkills([...skills, s])}
                                                style={{ padding: '3px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, color: '#64748b', background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.06)', cursor: 'pointer', transition: 'all 0.15s' }}
                                                onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.06)'; }}>
                                                + {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Experience Section */}
                        {activeSection === 2 && (
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineBriefcase size={18} style={{ color: '#34d399' }} /> Work Experience
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Each year adds 5 points (max 30 points)</p>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Years of Experience</label>
                                <input type="number" min={0} max={50} value={experience} onChange={e => setExperience(e.target.value)}
                                    placeholder="e.g. 3" style={{ ...inputStyle, maxWidth: '200px' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.1)'} />
                                <p style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>
                                    <span style={{ color: Number(experience) >= 6 ? '#34d399' : '#fbbf24' }}>{Math.min(30, (Number(experience) || 0) * 5)} / 30 points</span>
                                </p>
                            </div>
                        )}

                        {/* Education Section */}
                        {activeSection === 3 && (
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineAcademicCap size={18} style={{ color: '#fbbf24' }} /> Education & Summary
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Your educational background and professional summary</p>

                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Highest Education</label>
                                <input type="text" value={education} onChange={e => setEducation(e.target.value)} required
                                    placeholder="e.g. B.Tech Computer Science, IIT Delhi" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.1)'} />
                                <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px', marginBottom: '18px' }}>
                                    <span style={{ color: education ? '#34d399' : '#f87171' }}>{education ? '20/20' : '0/20'} points</span>
                                </p>

                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Profile Summary</label>
                                <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4}
                                    placeholder="A brief summary of your experience, skills, and career goals (50+ characters for full points)..."
                                    style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.1)'} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                    <p style={{ fontSize: '11px', color: '#475569' }}>
                                        <span style={{ color: (summary?.length || 0) >= 50 ? '#34d399' : '#fbbf24' }}>{(summary?.length || 0) >= 50 ? '20/20' : '0/20'} points</span>
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#475569' }}>{summary?.length || 0} / 1000 characters</p>
                                </div>
                            </div>
                        )}

                        {/* Links Section */}
                        {activeSection === 4 && (
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineLink size={18} style={{ color: '#06b6d4' }} /> Social Links & Profiles
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Add your professional profile links</p>
                                {[
                                    { label: 'LinkedIn URL', icon: '🔗', value: linkedin, set: setLinkedin, ph: 'https://linkedin.com/in/yourprofile' },
                                    { label: 'GitHub URL', icon: '💻', value: github, set: setGithub, ph: 'https://github.com/yourusername' },
                                    { label: 'Portfolio / Website', icon: '🌐', value: portfolio, set: setPortfolio, ph: 'https://yourwebsite.com' },
                                ].map(({ label, icon, value, set, ph }) => (
                                    <div key={label} style={{ marginBottom: '14px' }}>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>{icon} {label}</label>
                                        <input type="url" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.1)'} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Projects Section */}
                        {activeSection === 5 && (
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <HiOutlineClipboardList size={18} style={{ color: '#ec4899' }} /> Projects & Certifications
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>Showcase your best work and credentials</p>

                                <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Projects</p>
                                {projects.map((p, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', marginBottom: '8px', alignItems: 'start' }}>
                                        <input value={p.name} onChange={e => { const u = [...projects]; u[i].name = e.target.value; setProjects(u); }}
                                            placeholder="Project Name" style={{ ...inputStyle, fontSize: '13px' }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.1)'} />
                                        <input value={p.desc} onChange={e => { const u = [...projects]; u[i].desc = e.target.value; setProjects(u); }}
                                            placeholder="Brief description of the project" style={{ ...inputStyle, fontSize: '13px' }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.1)'} />
                                        {projects.length > 1 && <button type="button" onClick={() => setProjects(projects.filter((_, idx) => idx !== i))}
                                            style={{ padding: '8px', borderRadius: '6px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', display: 'flex' }}>
                                            <HiOutlineX size={14} />
                                        </button>}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setProjects([...projects, { name: '', desc: '' }])}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)', cursor: 'pointer', marginBottom: '20px' }}>
                                    <HiOutlinePlusCircle size={14} /> Add Project
                                </button>

                                <p style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Certifications</p>
                                {certifications.map((c, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input value={c} onChange={e => { const u = [...certifications]; u[i] = e.target.value; setCertifications(u); }}
                                            placeholder="e.g. AWS Solutions Architect, Google Cloud Professional" style={{ ...inputStyle, fontSize: '13px' }}
                                            onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                            onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.1)'} />
                                        {certifications.length > 1 && <button type="button" onClick={() => setCertifications(certifications.filter((_, idx) => idx !== i))}
                                            style={{ padding: '8px', borderRadius: '6px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', display: 'flex' }}>
                                            <HiOutlineX size={14} />
                                        </button>}
                                    </div>
                                ))}
                                <button type="button" onClick={() => setCertifications([...certifications, ''])}
                                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)', cursor: 'pointer' }}>
                                    <HiOutlinePlusCircle size={14} /> Add Certification
                                </button>
                            </div>
                        )}
                    </motion.div>

                    {/* Navigation + Submit */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {activeSection > 0 && (
                                <button type="button" onClick={() => setActiveSection(activeSection - 1)}
                                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#94a3b8', background: 'rgba(10,6,30,0.4)', border: '1px solid rgba(99,102,241,0.1)', cursor: 'pointer' }}>
                                    ← Back
                                </button>
                            )}
                            {activeSection < sections.length - 1 && (
                                <button type="button" onClick={() => setActiveSection(activeSection + 1)}
                                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', cursor: 'pointer' }}>
                                    Next →
                                </button>
                            )}
                        </div>
                        <button type="submit" disabled={saving}
                            style={{
                                padding: '10px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                                background: saving ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#22c55e,#16a34a)',
                                boxShadow: saving ? 'none' : '0 4px 16px rgba(34,197,94,0.3)', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                            {saving ? (
                                <><motion.span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }}
                                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /> Saving...</>
                            ) : (<><HiOutlineCheck size={16} /> {resume ? 'Update Resume' : 'Submit Resume'}</>)}
                        </button>
                    </div>

                    {/* Step indicator */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
                        {sections.map((_, i) => (
                            <div key={i} onClick={() => setActiveSection(i)} style={{
                                width: activeSection === i ? '20px' : '8px', height: '8px', borderRadius: '4px', cursor: 'pointer',
                                background: i <= activeSection ? '#818cf8' : 'rgba(99,102,241,0.15)', transition: 'all 0.2s',
                            }} />
                        ))}
                    </div>
                </form>
            </div>
        </PageTransition>
    );
}
