import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { problems } from '../../data/problems';
import {
    HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlinePlay,
    HiOutlineCheck, HiOutlineCode, HiOutlineBookOpen,
    HiOutlineLightningBolt, HiOutlineClipboardList, HiOutlineTerminal,
    HiOutlineClock, HiOutlineStar, HiOutlineRefresh,
} from 'react-icons/hi';

const LANGS = [
    { v: 'javascript', l: 'JavaScript' }, { v: 'python', l: 'Python' }, { v: 'java', l: 'Java' }, { v: 'cpp', l: 'C++' },
    { v: 'c', l: 'C' }, { v: 'go', l: 'Go' }, { v: 'ruby', l: 'Ruby' }, { v: 'typescript', l: 'TypeScript' },
];
const STARTER = {
    javascript: '// Write your solution here\nconsole.log("Hello, IntelliHire!");',
    python: '# Write your solution here\nprint("Hello, IntelliHire!")',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, IntelliHire!");\n    }\n}',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, IntelliHire!" << endl;\n    return 0;\n}',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, IntelliHire!\\n");\n    return 0;\n}',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, IntelliHire!")\n}',
    ruby: '# Write your solution here\nputs "Hello, IntelliHire!"',
    typescript: '// Write your solution here\nconsole.log("Hello, IntelliHire!");',
};
const defaultProblem = {
    id: 0, title: 'Playground', d: 'Easy', tags: ['General'],
    desc: 'Welcome to the **IntelliHire Code Playground**!\n\nWrite any code, choose your language, and click **Submit** to execute & score it.',
    examples: [{ input: 'Any valid code', output: 'Program output' }], constraints: ['Max execution: 10s', 'Max memory: 256 MB'],
    testCases: [{ input: '', expected: '' }]
};
const DC = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' };

/* ─── Timer Hook ──────────────────────────────────────────── */
function useTimer() {
    const [s, setS] = useState(0); const [on, setOn] = useState(false); const ref = useRef(null);
    useEffect(() => { if (on) ref.current = setInterval(() => setS(p => p + 1), 1000); else clearInterval(ref.current); return () => clearInterval(ref.current); }, [on]);
    const fmt = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    return { time: fmt, start: () => setOn(true), stop: () => setOn(false), reset: () => { setS(0); setOn(false) }, running: on };
}

/* ─── Description Panel ───────────────────────────────────── */
function DescPanel({ problem, navigate }) {
    const [tab, setTab] = useState('description');
    const idx = problems.findIndex(p => p.id === problem.id);
    const prev = idx > 0 ? problems[idx - 1] : null;
    const next = idx < problems.length - 1 && idx >= 0 ? problems[idx + 1] : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(99,102,241,0.08)', padding: '0 12px', background: 'rgba(10,6,30,0.3)', flexShrink: 0 }}>
                {[{ k: 'description', l: 'Description', i: HiOutlineBookOpen }, { k: 'editorial', l: 'Editorial', i: HiOutlineLightningBolt }, { k: 'solutions', l: 'Solutions', i: HiOutlineCode }, { k: 'submissions', l: 'Submissions', i: HiOutlineClipboardList }].map(({ k, l, i: I }) => (
                    <button key={k} onClick={() => setTab(k)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px', fontSize: '11px', fontWeight: 600, color: tab === k ? '#818cf8' : '#64748b', background: 'transparent', border: 'none', cursor: 'pointer', borderBottom: tab === k ? '2px solid #818cf8' : '2px solid transparent' }}><I size={12} /> {l}</button>
                ))}
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 16px 60px' }}>
                {tab === 'description' ? (
                    <>
                        {/* Title */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{problem.id !== 0 ? `${problem.id}. ` : ''}{problem.title}</h2>
                            {problem.status === 'solved' && <span style={{ fontSize: '11px', fontWeight: 600, color: '#34d399' }}>Solved ✓</span>}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, color: DC[problem.d], background: `${DC[problem.d]}12` }}>{problem.d}</span>
                            {problem.tags.map(t => <span key={t} style={{ padding: '2px 7px', borderRadius: '999px', fontSize: '10px', fontWeight: 600, color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.1)' }}>{t}</span>)}
                        </div>
                        {/* Description */}
                        <div style={{ fontSize: '14px', lineHeight: 1.8, color: '#c7d2fe', marginBottom: '18px' }}>
                            {problem.desc.split('\n\n').map((p, i) => <p key={i} style={{ marginBottom: '10px' }} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />)}
                        </div>
                        {/* Examples */}
                        {problem.examples.map((ex, i) => (
                            <div key={i} style={{ marginBottom: '14px' }}>
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Example {i + 1}:</p>
                                <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(10,6,30,0.5)', borderLeft: '3px solid rgba(99,102,241,0.3)', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', lineHeight: 1.7 }}>
                                    <p style={{ color: '#94a3b8' }}><strong style={{ color: '#fff' }}>Input:</strong> {ex.input}</p>
                                    <p style={{ color: '#94a3b8' }}><strong style={{ color: '#fff' }}>Output:</strong> {ex.output}</p>
                                    {ex.exp && <p style={{ color: '#94a3b8' }}><strong style={{ color: '#fff' }}>Explanation:</strong> {ex.exp}</p>}
                                </div>
                            </div>
                        ))}
                        {/* Constraints */}
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '6px', marginTop: '14px' }}>Constraints:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {problem.constraints.map((c, i) => (
                                <li key={i} style={{ fontSize: '12px', color: '#94a3b8', padding: '2px 0', display: 'flex', gap: '6px' }}>
                                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#475569', flexShrink: 0, marginTop: '7px' }} />
                                    <code style={{ padding: '1px 5px', borderRadius: '3px', fontSize: '12px', background: 'rgba(99,102,241,0.06)', color: '#c7d2fe', fontFamily: "'JetBrains Mono',monospace" }}>{c}</code>
                                </li>
                            ))}
                        </ul>
                        {/* Prev / Next navigation */}
                        {problem.id !== 0 && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(99,102,241,0.06)' }}>
                                {prev && <button onClick={() => navigate(`/candidate/code/editor?problem=${prev.id}`)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}><HiOutlineChevronLeft size={12} /> {prev.id}. {prev.title}</button>}
                                {next && <button onClick={() => navigate(`/candidate/code/editor?problem=${next.id}`)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.08)', color: '#94a3b8', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>{next.id}. {next.title} <HiOutlineChevronRight size={12} /></button>}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: '#475569' }}>
                        <HiOutlineLightningBolt size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} /><p style={{ fontSize: '13px' }}>Coming soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ━━━ MAIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function CodeEditor() {
    const [sp] = useSearchParams();
    const navigate = useNavigate();
    const pid = sp.get('problem');
    const problem = problems.find(p => p.id === Number(pid)) || defaultProblem;
    const timer = useTimer();

    const [lang, setLang] = useState('javascript');
    const [code, setCode] = useState(STARTER.javascript);
    const [submitting, setSub] = useState(false);
    const [polling, setPoll] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [btab, setBtab] = useState('testcase');
    const [activeTC, setActiveTC] = useState(0);
    const [fontSize, setFontSize] = useState(14);

    const tc = problem.testCases || [{ input: '', expected: '' }];
    const isRunning = submitting || polling;

    // Reset code on language change
    const changeLang = (l) => { setLang(l); setCode(STARTER[l] || ''); setResult(null); };

    // Reset on problem change
    useEffect(() => { setResult(null); setError(''); setActiveTC(0); setBtab('testcase'); timer.reset(); }, [pid]);

    const handleSubmit = async () => {
        setSub(true); setResult(null); setError(''); setBtab('result');
        if (!timer.running) timer.start();
        try {
            const stdin = tc[activeTC]?.input || '';
            const expectedOutput = tc[activeTC]?.expected || '';
            const res = await api.post('/code/submit', { language: lang, sourceCode: code, stdin, expectedOutput });
            const { judge0Token } = res.data.data;
            setPoll(true); setSub(false);
            let att = 0;
            const poll = async () => {
                att++;
                try {
                    const r = await api.get(`/code/result/${judge0Token}`);
                    if (r.data.data.status === 'pending' && att < 20) setTimeout(poll, 2000);
                    else { setResult(r.data.data); setPoll(false); timer.stop(); }
                } catch { setError('Failed to fetch results'); setPoll(false); timer.stop(); }
            };
            setTimeout(poll, 3000);
        } catch (err) { setError(err.response?.data?.message || 'Submission failed'); setSub(false); timer.stop(); }
    };

    return (
        <div style={{ height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a061e' }}>
            {/* ── TOP BAR ───────────────────────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', borderBottom: '1px solid rgba(99,102,241,0.08)', background: 'linear-gradient(90deg,rgba(10,6,30,0.8),rgba(20,16,55,0.6))', height: '40px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Link to="/candidate/code" style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', fontWeight: 600, color: '#64748b', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c7d2fe'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
                        <HiOutlineChevronLeft size={13} /> Problems
                    </Link>
                    {problem.id !== 0 && <>
                        <span style={{ color: 'rgba(99,102,241,0.15)' }}>|</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{problem.id}. {problem.title}</span>
                        <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '9px', fontWeight: 700, color: DC[problem.d], background: `${DC[problem.d]}12` }}>{problem.d}</span>
                    </>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* Timer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '6px', background: 'rgba(10,6,30,0.4)', border: '1px solid rgba(99,102,241,0.06)' }}>
                        <HiOutlineClock size={12} style={{ color: timer.running ? '#34d399' : '#475569' }} />
                        <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: timer.running ? '#34d399' : '#64748b' }}>{timer.time}</span>
                        <button onClick={timer.running ? timer.stop : timer.start} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 0 }}>
                            {timer.running ? '⏸' : '▶'}
                        </button>
                        <button onClick={timer.reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex', padding: 0 }}>
                            <HiOutlineRefresh size={11} />
                        </button>
                    </div>
                    {/* Font size */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button onClick={() => setFontSize(f => Math.max(10, f - 1))} style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(10,6,30,0.4)', border: '1px solid rgba(99,102,241,0.06)', color: '#64748b', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A-</button>
                        <button onClick={() => setFontSize(f => Math.min(22, f + 1))} style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(10,6,30,0.4)', border: '1px solid rgba(99,102,241,0.06)', color: '#64748b', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>A+</button>
                    </div>
                    {/* Run */}
                    <button onClick={handleSubmit} disabled={isRunning || !code.trim()} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '5px', fontSize: '12px', fontWeight: 700, background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer', opacity: isRunning ? 0.5 : 1 }}>
                        <HiOutlinePlay size={12} /> Run
                    </button>
                    {/* Submit */}
                    <button onClick={handleSubmit} disabled={isRunning || !code.trim()} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '5px', fontSize: '12px', fontWeight: 700, background: isRunning ? 'rgba(34,197,94,0.3)' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', border: 'none', cursor: isRunning ? 'not-allowed' : 'pointer' }}>
                        <HiOutlineCheck size={12} /> {submitting ? 'Submitting...' : polling ? 'Judging...' : 'Submit'}
                    </button>
                </div>
            </div>

            {/* ── SPLIT PANE ────────────────────────────────────── */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }} className="editor-split">
                {/* LEFT: Description */}
                <div style={{ borderRight: '1px solid rgba(99,102,241,0.08)', background: 'rgba(15,10,30,0.4)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <DescPanel problem={problem} navigate={navigate} />
                </div>
                {/* RIGHT: Editor + Tests */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Code header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px', borderBottom: '1px solid rgba(99,102,241,0.08)', background: 'rgba(10,6,30,0.3)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><HiOutlineTerminal size={12} style={{ color: '#818cf8' }} /><span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Code</span></div>
                        <select value={lang} onChange={e => changeLang(e.target.value)} style={{ padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, background: 'rgba(10,6,30,0.5)', color: '#c7d2fe', border: '1px solid rgba(99,102,241,0.12)', outline: 'none', cursor: 'pointer' }}>
                            {LANGS.map(l => <option key={l.v} value={l.v} style={{ background: '#1e1b4b' }}>{l.l}</option>)}
                        </select>
                    </div>
                    {/* Editor */}
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <div style={{ display: 'flex', minHeight: '100%' }}>
                            <div style={{ padding: '8px 0', fontSize: `${fontSize - 2}px`, fontFamily: "'JetBrains Mono',monospace", color: '#334155', textAlign: 'right', userSelect: 'none', minWidth: '34px', background: 'rgba(10,6,30,0.4)', borderRight: '1px solid rgba(99,102,241,0.04)' }}>
                                {code.split('\n').map((_, i) => <div key={i} style={{ padding: '0 7px', lineHeight: '1.7' }}>{i + 1}</div>)}
                            </div>
                            <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false}
                                style={{ flex: 1, resize: 'none', outline: 'none', border: 'none', padding: '8px 12px', fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: `${fontSize}px`, lineHeight: 1.7, tabSize: 4, backgroundColor: 'rgba(10,6,30,0.3)', color: '#e2e8f0', minHeight: '100%' }} />
                        </div>
                    </div>
                    {/* BOTTOM: Testcase / Result */}
                    <div style={{ borderTop: '2px solid rgba(99,102,241,0.08)', minHeight: '160px', maxHeight: '240px', overflow: 'auto', background: 'rgba(10,6,30,0.4)', flexShrink: 0 }}>
                        {/* Tabs */}
                        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(99,102,241,0.06)', padding: '0 10px', background: 'rgba(10,6,30,0.3)' }}>
                            {['testcase', 'result'].map(k => (
                                <button key={k} onClick={() => setBtab(k)} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: btab === k ? (k === 'result' && result?.status === 'accepted' ? '#34d399' : '#818cf8') : '#64748b', background: 'none', border: 'none', borderBottom: btab === k ? `2px solid ${k === 'result' && result?.status === 'accepted' ? '#34d399' : '#818cf8'}` : '2px solid transparent', cursor: 'pointer' }}>
                                    {k === 'result' && result?.status === 'accepted' ? '✓ ' : ''}{{ testcase: 'Testcase', result: 'Test Result' }[k]}
                                </button>
                            ))}
                            {isRunning && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', padding: '0 8px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', animation: 'pulse 1s infinite' }} />
                                <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 600 }}>{polling ? 'Judging...' : 'Running...'}</span>
                            </div>}
                        </div>
                        <div style={{ padding: '10px 12px' }}>
                            {btab === 'testcase' && (
                                <>
                                    {/* Test case tabs */}
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                                        {tc.map((_, i) => (
                                            <button key={i} onClick={() => setActiveTC(i)} style={{
                                                padding: '4px 12px', borderRadius: '5px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                                                color: activeTC === i ? '#fff' : '#64748b', background: activeTC === i ? 'rgba(99,102,241,0.15)' : 'rgba(10,6,30,0.3)', border: activeTC === i ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(99,102,241,0.06)'
                                            }}>
                                                Case {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Input / Expected */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div>
                                            <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' }}>Input</label>
                                            <pre style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(10,6,30,0.5)', border: '1px solid rgba(99,102,241,0.06)', fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", color: '#c7d2fe', minHeight: '40px', whiteSpace: 'pre-wrap', margin: 0 }}>
                                                {tc[activeTC]?.input || '(empty)'}
                                            </pre>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' }}>Expected Output</label>
                                            <pre style={{ padding: '8px 10px', borderRadius: '6px', background: 'rgba(10,6,30,0.5)', border: '1px solid rgba(99,102,241,0.06)', fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", color: '#34d399', minHeight: '40px', whiteSpace: 'pre-wrap', margin: 0 }}>
                                                {tc[activeTC]?.expected || '(any)'}
                                            </pre>
                                        </div>
                                    </div>
                                </>
                            )}
                            {btab === 'result' && (result ? (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '15px', fontWeight: 700, color: result.status === 'accepted' ? '#34d399' : result.status === 'pending' ? '#fbbf24' : '#f87171' }}>
                                            {result.status === 'accepted' ? '✓ Accepted' : result.status === 'pending' ? '⏳ Pending' : '✗ ' + result.status}
                                        </span>
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99,102,241,0.1)' }}>Score: {result.submission?.score ?? 0}</span>
                                        {result.result?.time && <span style={{ fontSize: '11px', color: '#64748b' }}>⏱ {result.result.time}s</span>}
                                        {result.result?.memory && <span style={{ fontSize: '11px', color: '#64748b' }}>💾 {(result.result.memory / 1024).toFixed(1)}MB</span>}
                                    </div>
                                    {result.result?.stdout && <div style={{ marginBottom: '6px' }}><p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>STDOUT</p><pre style={{ padding: '6px 8px', borderRadius: '5px', background: 'rgba(10,6,30,0.5)', fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", color: '#34d399', overflowX: 'auto', margin: 0 }}>{result.result.stdout}</pre></div>}
                                    {result.result?.stderr && <div style={{ marginBottom: '6px' }}><p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>STDERR</p><pre style={{ padding: '6px 8px', borderRadius: '5px', background: 'rgba(10,6,30,0.5)', fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", color: '#f87171', overflowX: 'auto', margin: 0 }}>{result.result.stderr}</pre></div>}
                                    {result.result?.compile_output && <div><p style={{ fontSize: '10px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>COMPILE</p><pre style={{ padding: '6px 8px', borderRadius: '5px', background: 'rgba(10,6,30,0.5)', fontSize: '12px', fontFamily: "'JetBrains Mono',monospace", color: '#fbbf24', overflowX: 'auto', margin: 0 }}>{result.result.compile_output}</pre></div>}
                                </div>
                            ) : <div style={{ textAlign: 'center', padding: '16px', color: '#475569', fontSize: '12px' }}>{isRunning ? 'Running your code...' : 'Run your code first'}</div>)}
                            {error && <div style={{ padding: '6px 10px', borderRadius: '5px', marginTop: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '12px', color: '#f87171' }}>{error}</div>}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @media(max-width:768px){ .editor-split{grid-template-columns:1fr!important;} }
                @keyframes pulse{ 0%,100%{opacity:1;} 50%{opacity:0.4;} }
            `}</style>
        </div>
    );
}
