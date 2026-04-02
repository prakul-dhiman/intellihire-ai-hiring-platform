import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../../components/Motion';
import api from '../../api/axios';

const card = { backgroundColor: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '16px' };

export default function BulkAnalyzer() {
    const [files, setFiles] = useState([]);
    const [jobDesc, setJobDesc] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState([]);
    const [currentStep, setCurrentStep] = useState(1); // 1 = Upload, 2 = Analyze, 3 = Results
    const [filter, setFilter] = useState('ALL'); // ALL, TOP100, TOP50, TOP10, SCORE80

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    };

    const startAnalysis = async () => {
        if (files.length === 0) return;
        setCurrentStep(2);
        setAnalyzing(true);
        setProgress(0);
        setResults([]);

        const formData = new FormData();
        files.forEach(file => formData.append("files", file));
        if (jobDesc) formData.append("jobDesc", jobDesc);

        try {
            // Fake progress animation while waiting for backend
            const progressInterval = setInterval(() => {
                setProgress(p => (p >= 90 ? 90 : p + Math.floor(Math.random() * 5) + 1));
            }, 300);

            const res = await api.post('/admin/bulk-analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            clearInterval(progressInterval);
            setProgress(100);

            setTimeout(() => {
                setResults(res.data.data.results);
                setAnalyzing(false);
                setCurrentStep(3);
                setFilter('ALL');
            }, 600);

        } catch (error) {
            console.error("Bulk Analysis Error:", error);
            setAnalyzing(false);
            setCurrentStep(1);
            alert("Analysis failed. Ensure server is running and files are valid.");
        }
    };

    // Filter Logic
    let filteredResults = [...results];
    if (filter === 'TOP100') filteredResults = filteredResults.slice(0, 100);
    else if (filter === 'TOP50') filteredResults = filteredResults.slice(0, 50);
    else if (filter === 'TOP10') filteredResults = filteredResults.slice(0, 10);
    else if (filter === 'SCORE80') filteredResults = filteredResults.filter(r => r.score >= 80);

    const [selectedPDF, setSelectedPDF] = useState(null);
    const [aiReport, setAiReport] = useState(null);

    const getScoreBadge = (score) => {
        if (score >= 80) return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(52,211,153,0.1)', color: '#34d399', fontWeight: 700, fontSize: '12px' }}>{score} / 100</span>;
        if (score >= 65) return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontWeight: 700, fontSize: '12px' }}>{score} / 100</span>;
        return <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontWeight: 700, fontSize: '12px' }}>{score} / 100</span>;
    };

    const handleViewCV = (filename) => {
        const file = files.find(f => f.name === filename);
        if (file) {
            // Force the browser to render it inline as a PDF
            const blob = new Blob([file], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(blob);
            setSelectedPDF({ url: fileURL, name: filename });
        }
    };

    return (
        <PageTransition>
            <div>
                {/* PDF Viewer Modal */}
                <AnimatePresence>
                    {selectedPDF && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', flexDirection: 'column', padding: '40px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 700 }}>{selectedPDF.name}</h3>
                                <button
                                    onClick={() => setSelectedPDF(null)}
                                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Close Viewer
                                </button>
                            </div>
                            <iframe
                                src={selectedPDF.url}
                                style={{ flex: 1, width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                title="CV Viewer"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Report Modal */}
                <AnimatePresence>
                    {aiReport && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            onClick={() => setAiReport(null)}
                        >
                            <motion.div
                                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                                style={{ background: '#1e1b4b', border: '1px solid rgba(99,102,241,0.2)', padding: '32px', borderRadius: '16px', maxWidth: '600px', width: '90%' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h2 style={{ fontSize: '20px', color: '#fff', fontWeight: 700 }}>AI Deep Analysis</h2>
                                    <button onClick={() => setAiReport(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>JD Match</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>{aiReport.breakdown?.jdFit || 0} <span style={{ fontSize: '14px', color: '#64748b' }}>/ 30</span></div>
                                    </div>
                                    <div style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Skills</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#a78bfa' }}>{aiReport.breakdown?.skills || 0} <span style={{ fontSize: '14px', color: '#64748b' }}>/ 30</span></div>
                                    </div>
                                    <div style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Experience</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#fbbf24' }}>{aiReport.breakdown?.experience || 0} <span style={{ fontSize: '14px', color: '#64748b' }}>/ 25</span></div>
                                    </div>
                                    <div style={{ flex: 1, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Education</div>
                                        <div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>{aiReport.breakdown?.education || 0} <span style={{ fontSize: '14px', color: '#64748b' }}>/ 15</span></div>
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '14px', color: '#fff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Findings</h3>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                                    {aiReport.keyFindings?.map((finding, idx) => (
                                        <li key={idx} style={{ marginBottom: '8px' }}>{finding}</li>
                                    ))}
                                    {(!aiReport.keyFindings || aiReport.keyFindings.length === 0) && (
                                        <li>No granular findings available for this legacy analysis.</li>
                                    )}
                                </ul>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>CV Bulk Analyzer AI ✨</h1>
                    <p style={{ color: '#94a3b8', fontSize: '15px' }}>Upload hundreds or thousands of CVs at once. Let our AI instantly rank and shortlist the top talent based on your JD.</p>
                </div>

                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ ...card, padding: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 1fr', gap: '32px' }}>
                                {/* Dropzone */}
                                <div>
                                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Step 1: Upload CVs (PDF, DOCX)</h3>
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        style={{ border: '2px dashed rgba(99,102,241,0.3)', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', background: 'rgba(10,6,30,0.3)', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
                                        onClick={() => document.getElementById('bulkUpload').click()}
                                    >
                                        <input type="file" id="bulkUpload" multiple onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx" />
                                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
                                        <p style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>Click or Drag & Drop CVs here</p>
                                        <p style={{ color: '#64748b', fontSize: '13px' }}>Upload 10, 100, or 1000+ CVs</p>

                                        {files.length > 0 && (
                                            <div style={{ marginTop: '16px', display: 'inline-block', background: 'rgba(99,102,241,0.2)', color: '#a78bfa', padding: '6px 12px', borderRadius: '100px', fontSize: '13px', fontWeight: 700 }}>
                                                {files.length} Files Selected
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* JD setup */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>Step 2: Define Ideal Candidate (Optional JD)</h3>
                                    <textarea
                                        value={jobDesc}
                                        onChange={(e) => setJobDesc(e.target.value)}
                                        placeholder="Paste the Job Description or key skills here (e.g., 'Looking for 5+ years React exp, strong system design, Node.js, AWS...')"
                                        style={{ flex: 1, width: '100%', padding: '16px', background: 'rgba(10,6,30,0.3)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', color: '#fff', fontSize: '14px', outline: 'none', resize: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '32px', textAlign: 'right', borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '24px' }}>
                                <button
                                    onClick={startAnalysis}
                                    disabled={files.length === 0}
                                    style={{ background: files.length > 0 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#334155', color: '#fff', padding: '12px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: files.length > 0 ? 'pointer' : 'not-allowed', border: 'none', opacity: files.length > 0 ? 1 : 0.5 }}
                                >
                                    🚀 Start AI Analysis
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ ...card, padding: '60px 32px', textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '24px' }}>🤖</div>
                            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>AI is analyzing {files.length} resumes...</h2>
                            <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '400px', margin: '0 auto 32px' }}>
                                Combining machine parsing with natural language understanding to evaluate experience, skills, and context against your requirements.
                            </p>

                            {/* Progress bar */}
                            <div style={{ maxWidth: '500px', margin: '0 auto', background: 'rgba(255,255,255,0.05)', height: '12px', borderRadius: '100px', overflow: 'hidden' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    style={{ height: '100%', background: 'linear-gradient(90deg, #38bdf8, #8b5cf6, #ec4899)', borderRadius: '100px' }}
                                />
                            </div>
                            <p style={{ color: '#a78bfa', fontSize: '14px', fontWeight: 600, marginTop: '12px' }}>{progress}% Complete</p>
                        </motion.div>
                    )}

                    {currentStep === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,27,75,0.6)', border: '1px solid rgba(99,102,241,0.2)', padding: '16px 24px', borderRadius: '12px' }}>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>Analysis Complete</h3>
                                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>Processed {files.length} resumes. AI found {results.filter(r => r.score >= 80).length} highly qualified candidates.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[
                                        { id: 'ALL', label: 'All Candidates' },
                                        { id: 'SCORE80', label: 'Top Match (>80)' },
                                        { id: 'TOP10', label: 'Top 10' },
                                        { id: 'TOP50', label: 'Top 50' },
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setFilter(f.id)}
                                            style={{ padding: '8px 16px', background: filter === f.id ? 'rgba(99,102,241,0.2)' : 'transparent', border: filter === f.id ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.1)', color: filter === f.id ? '#a78bfa' : '#94a3b8', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => { setFiles([]); setCurrentStep(1); }}
                                        style={{ marginLeft: '16px', padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Upload More
                                    </button>
                                </div>
                            </div>

                            <div style={{ ...card, overflow: 'hidden' }}>
                                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'rgba(10,6,30,0.5)' }}>
                                        <tr>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Rank</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Candidate Name</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Source File</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>AI Status</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Fit Score</th>
                                            <th style={{ padding: '16px 24px', fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredResults.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No candidates match this filter.</td></tr>
                                        ) : (
                                            filteredResults.map((r, i) => (
                                                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>#{i + 1}</td>
                                                    <td style={{ padding: '16px 24px', color: '#fff', fontSize: '14px', fontWeight: 600 }}>{r.name}</td>
                                                    <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '13px' }}>{r.filename}</td>
                                                    <td style={{ padding: '16px 24px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: r.status === 'Shortlisted' ? '#34d399' : r.status === 'Review' ? '#fbbf24' : '#f87171' }}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>{getScoreBadge(r.score)}</td>
                                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={() => setAiReport(r)}
                                                                style={{ padding: '6px 12px', background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                                            >
                                                                🤖 Analysis
                                                            </button>
                                                            <button
                                                                onClick={() => handleViewCV(r.filename)}
                                                                style={{ padding: '6px 12px', background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                                            >
                                                                View PDF
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
