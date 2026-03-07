import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageTransition } from '../../components/Motion';
import { problems, allTags, tagCounts, stats } from '../../data/problems';
import {
    HiOutlineCode, HiOutlineChevronRight, HiOutlineSearch,
    HiOutlineCheck, HiOutlineStar, HiOutlinePlay,
    HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineLightningBolt,
    HiOutlineCollection, HiOutlineFire, HiOutlineTag,
    HiOutlineArrowRight, HiOutlineFilter, HiOutlineSortDescending,
} from 'react-icons/hi';

/* ─── Featured Courses ────────────────────────────────────── */
const courses = [
    { id: 1, tag: "Interview Crash Course", title: "Data Structures and Algorithms", ch: 13, items: 149, g: 'linear-gradient(135deg,#6366f1,#4338ca)' },
    { id: 2, tag: "Interview Crash Course", title: "System Design for Interviews", ch: 16, items: 81, g: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
    { id: 3, tag: "Beginner's Guide", title: "The IntelliHire Beginner's Guide", ch: 4, items: 17, g: 'linear-gradient(135deg,#ec4899,#db2777)' },
    { id: 4, tag: "Easy Collection", title: "Top Interview Questions", ch: 9, items: 48, g: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
    { id: 5, tag: "Detailed Explanation", title: "Dynamic Programming Patterns", ch: 6, items: 55, g: 'linear-gradient(135deg,#10b981,#059669)' },
    { id: 6, tag: "Advanced Topics", title: "Graph Theory & BFS/DFS", ch: 8, items: 42, g: 'linear-gradient(135deg,#f59e0b,#d97706)' },
];
const interviewCards = [
    { id: 1, tag: "Crash Course", title: "Cheatsheets", g: 'linear-gradient(135deg,#6366f1,#4338ca)' },
    { id: 2, tag: "Crash Course", title: "DSA Deep Dive", g: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
    { id: 3, tag: "Crash Course", title: "System Design", g: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
    { id: 4, tag: "Get Prepared for", title: "Google Interview", g: 'linear-gradient(135deg,#f59e0b,#d97706)', premium: true },
    { id: 5, tag: "Get Prepared for", title: "Amazon Interview", g: 'linear-gradient(135deg,#ef4444,#dc2626)', premium: true },
];
const filterTabs = ['All Topics', 'Algorithms', 'Database', 'JavaScript', 'Python', 'Design'];

function DiffBadge({ d }) {
    const c = { Easy: { c: '#34d399', bg: 'rgba(16,185,129,0.1)' }, Medium: { c: '#fbbf24', bg: 'rgba(245,158,11,0.1)' }, Hard: { c: '#f87171', bg: 'rgba(239,68,68,0.1)' } };
    const s = c[d] || c.Medium;
    return <span style={{ fontSize: '12px', fontWeight: 600, color: s.c, padding: '2px 10px', borderRadius: '4px', background: s.bg }}>{d}</span>;
}

export default function CodeHub() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('problems');
    const [search, setSearch] = useState('');
    const [diff, setDiff] = useState('All');
    const [selTag, setSelTag] = useState('All');
    const [sort, setSort] = useState('id');
    const [activeFilter, setActiveFilter] = useState('All Topics');

    const filtered = useMemo(() => {
        let list = [...problems];
        if (search) list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
        if (diff !== 'All') list = list.filter(p => p.d === diff);
        if (selTag !== 'All') list = list.filter(p => p.tags.includes(selTag));
        if (sort === 'id') list.sort((a, b) => a.id - b.id);
        if (sort === 'acc') list.sort((a, b) => parseFloat(a.acc) - parseFloat(b.acc));
        if (sort === 'diff') { const o = { Easy: 0, Medium: 1, Hard: 2 }; list.sort((a, b) => o[a.d] - o[b.d]); }
        return list;
    }, [search, diff, selTag, sort]);

    const card = { background: 'linear-gradient(135deg,rgba(30,27,75,0.6),rgba(20,16,55,0.5))', border: '1px solid rgba(99,102,241,0.12)', borderRadius: '12px' };

    return (
        <PageTransition>
            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px' }}>

                {/* ── HEADER ────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HiOutlineCode size={18} style={{ color: '#fff' }} />
                        </div>
                        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>IntelliHire <span style={{ color: '#fbbf24' }}>Code</span></h1>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', background: 'rgba(10,6,30,0.5)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(99,102,241,0.08)' }}>
                        {[{ k: 'explore', l: 'Explore', i: HiOutlineCollection }, { k: 'problems', l: 'Problems', i: HiOutlineBookOpen }].map(({ k, l, i: I }) => (
                            <button key={k} onClick={() => setTab(k)} style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                                border: 'none', cursor: 'pointer', color: tab === k ? '#fff' : '#64748b',
                                background: tab === k ? 'rgba(99,102,241,0.15)' : 'transparent', transition: 'all 0.15s',
                            }}><I size={14} /> {l}</button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(10,6,30,0.4)', border: '1px solid rgba(99,102,241,0.08)', minWidth: '200px' }}>
                        <HiOutlineSearch size={15} style={{ color: '#64748b' }} />
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#e2e8f0' }} />
                    </div>
                </motion.div>

                {/* ── EXPLORE TAB ───────────────────────────────────── */}
                {tab === 'explore' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Featured */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Featured</h2>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#818cf8', padding: '4px 14px', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>More</span>
                        </div>
                        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px', scrollbarWidth: 'thin' }}>
                            {courses.map((c, i) => (
                                <motion.div key={c.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                                    <Link to="/candidate/code/editor" style={{ textDecoration: 'none' }}>
                                        <div style={{ width: '210px', minHeight: '220px', borderRadius: '14px', background: c.g, padding: '20px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', flexShrink: 0, transition: 'transform 0.2s,box-shadow 0.2s', cursor: 'pointer' }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                                            <div><p style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '6px' }}>{c.tag}</p><h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{c.title}</h3></div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '14px' }}>
                                                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}><HiOutlinePlay size={14} style={{ color: '#1e1b4b', marginLeft: '2px' }} /></div>
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <div style={{ textAlign: 'center' }}><p style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{c.ch}</p><p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}>Chapters</p></div>
                                                    <div style={{ textAlign: 'center' }}><p style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{c.items}</p><p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}>Items</p></div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        {/* Interview */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Interview</h2>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#818cf8', padding: '4px 14px', borderRadius: '6px', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>More</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '28px' }}>
                            {interviewCards.map((c, i) => (
                                <motion.div key={c.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                                    <Link to="/candidate/code/editor" style={{ textDecoration: 'none' }}>
                                        <div style={{ width: '190px', height: '130px', borderRadius: '14px', background: c.g, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', flexShrink: 0, transition: 'transform 0.2s', cursor: 'pointer' }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                            {c.premium && <span style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, background: 'rgba(239,68,68,0.9)', color: '#fff' }}>Premium</span>}
                                            <p style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '4px' }}>{c.tag}</p>
                                            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{c.title}</h3>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        {/* CTA */}
                        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            style={{ ...card, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                            <div><h3 style={{ fontSize: '17px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Ready to code? 🚀</h3><p style={{ fontSize: '13px', color: '#94a3b8' }}>Jump straight into the editor — {stats.total} problems waiting.</p></div>
                            <Link to="/candidate/code/editor" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 24px', borderRadius: '10px', fontSize: '14px', fontWeight: 700, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 16px rgba(34,197,94,0.3)', transition: 'transform 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                <HiOutlinePlay size={15} /> Open Editor
                            </Link>
                        </motion.div>
                    </motion.div>
                )}

                {/* ── PROBLEMS TAB ──────────────────────────────────── */}
                {tab === 'problems' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {/* Stats bar */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }} className="stats-grid">
                            {[
                                { label: 'Total', value: stats.total, color: '#818cf8', bg: 'rgba(99,102,241,0.06)' },
                                { label: 'Easy', value: stats.easy, color: '#34d399', bg: 'rgba(16,185,129,0.06)' },
                                { label: 'Medium', value: stats.medium, color: '#fbbf24', bg: 'rgba(245,158,11,0.06)' },
                                { label: 'Hard', value: stats.hard, color: '#f87171', bg: 'rgba(239,68,68,0.06)' },
                            ].map(s => (
                                <div key={s.label} style={{ padding: '14px 16px', borderRadius: '10px', background: s.bg, border: `1px solid ${s.color}15`, textAlign: 'center' }}>
                                    <p style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</p>
                                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>{s.label}</p>
                                </div>
                            ))}
                        </motion.div>
                        {/* Progress */}
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                            style={{ ...card, padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Progress</span>
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#818cf8' }}>{stats.solved}/{stats.total} solved</span>
                                </div>
                                <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(10,6,30,0.5)', overflow: 'hidden' }}>
                                    <motion.div style={{ height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg,#6366f1,#818cf8)' }}
                                        initial={{ width: 0 }} animate={{ width: `${(stats.solved / stats.total) * 100}%` }} transition={{ duration: 1 }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
                                <span style={{ color: '#34d399' }}>✓ {stats.solved} solved</span>
                                <span style={{ color: '#fbbf24' }}>○ {stats.attempted} attempted</span>
                            </div>
                        </motion.div>
                        {/* Topic tags */}
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                            <button onClick={() => setSelTag('All')} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: selTag === 'All' ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.08)', color: selTag === 'All' ? '#fff' : '#64748b', background: selTag === 'All' ? 'rgba(99,102,241,0.15)' : 'transparent' }}>
                                All {stats.total}
                            </button>
                            {allTags.slice(0, 15).map(t => (
                                <button key={t} onClick={() => setSelTag(t === selTag ? 'All' : t)} style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: selTag === t ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.06)', color: selTag === t ? '#fff' : '#64748b', background: selTag === t ? 'rgba(99,102,241,0.15)' : 'transparent', transition: 'all 0.15s' }}>
                                    {t} <span style={{ opacity: 0.5 }}>{tagCounts[t]}</span>
                                </button>
                            ))}
                        </motion.div>
                        {/* Filters row */}
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '180px', padding: '7px 12px', borderRadius: '8px', background: 'rgba(10,6,30,0.4)', border: '1px solid rgba(99,102,241,0.08)' }}>
                                <HiOutlineSearch size={14} style={{ color: '#64748b' }} />
                                <input type="text" placeholder="Search questions" value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#e2e8f0' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {['All', 'Easy', 'Medium', 'Hard'].map(d => {
                                    const cl = { All: '#94a3b8', Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' };
                                    return <button key={d} onClick={() => setDiff(d)} style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', color: diff === d ? '#fff' : cl[d], background: diff === d ? 'rgba(99,102,241,0.15)' : 'rgba(10,6,30,0.3)', transition: 'all 0.15s' }}>{d}</button>;
                                })}
                            </div>
                            <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, background: 'rgba(10,6,30,0.4)', color: '#94a3b8', border: '1px solid rgba(99,102,241,0.1)', outline: 'none', cursor: 'pointer' }}>
                                <option value="id">Sort: #</option><option value="acc">Sort: Acceptance</option><option value="diff">Sort: Difficulty</option>
                            </select>
                            <span style={{ fontSize: '12px', color: '#475569' }}>{filtered.length}/{problems.length}</span>
                        </motion.div>
                        {/* Problems Table */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            style={{ ...card, overflow: 'hidden', marginTop: '6px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 80px 70px', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid rgba(99,102,241,0.08)', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <span></span><span>Title</span><span style={{ textAlign: 'right' }}>Accept.</span><span style={{ textAlign: 'right' }}>Diff.</span>
                            </div>
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {filtered.map((p, i) => (
                                    <Link key={p.id} to={`/candidate/code/editor?problem=${p.id}`} style={{
                                        display: 'grid', gridTemplateColumns: '36px 1fr 80px 70px', alignItems: 'center', padding: '11px 18px',
                                        textDecoration: 'none', borderBottom: '1px solid rgba(99,102,241,0.03)',
                                        background: i % 2 === 0 ? 'rgba(10,6,30,0.15)' : 'transparent', transition: 'background 0.12s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(10,6,30,0.15)' : 'transparent'}>
                                        <span>
                                            {p.status === 'solved' && <HiOutlineCheck size={15} style={{ color: '#34d399' }} />}
                                            {p.status === 'attempted' && <span style={{ color: '#fbbf24', fontSize: '13px' }}>○</span>}
                                        </span>
                                        <div>
                                            <span style={{ fontSize: '14px', fontWeight: 500, color: '#e2e8f0' }}>{p.id}. {p.title}</span>
                                            <div style={{ display: 'flex', gap: '4px', marginTop: '3px', flexWrap: 'wrap' }}>
                                                {p.tags.slice(0, 2).map(t => <span key={t} style={{ fontSize: '10px', fontWeight: 600, color: '#475569', padding: '1px 6px', borderRadius: '3px', background: 'rgba(99,102,241,0.04)' }}>{t}</span>)}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#64748b', textAlign: 'right' }}>{p.acc}</span>
                                        <span style={{ textAlign: 'right' }}><DiffBadge d={p.d} /></span>
                                    </Link>
                                ))}
                                {filtered.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No problems match your filters</div>}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
            <style>{`
                @media(max-width:640px){ .stats-grid{grid-template-columns:repeat(2,1fr)!important;} }
                ::-webkit-scrollbar{height:6px;width:6px;}
                ::-webkit-scrollbar-track{background:transparent;}
                ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.15);border-radius:3px;}
            `}</style>
        </PageTransition>
    );
}
