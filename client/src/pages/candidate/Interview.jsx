import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import { problems } from '../../data/problems';

/* ─── Constants ─────────────────────────────────────────────── */
const CATS = [
    { id: 'dsa', icon: '</>', label: 'DSA', sub: '150+ problems' },
    { id: 'system', icon: '🖥️', label: 'System Design', sub: '38 problems' },
    { id: 'behavioral', icon: '👥', label: 'Behavioral', sub: '40 problems' },
    { id: 'ml', icon: '🧠', label: 'AI / ML', sub: '65 problems' },
];
const LANGS = [
    { v: 'javascript', l: 'JavaScript' }, { v: 'python', l: 'Python' },
    { v: 'java', l: 'Java' }, { v: 'cpp', l: 'C++' }, { v: 'c', l: 'C' },
];
const STARTER = {
    javascript: '// Write your solution here\n',
    python: '# Write your solution here\n',
    java: 'public class Solution {\n    public static void main(String[] args) {\n        // your code\n    }\n}',
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // your code\n    return 0;\n}',
    c: '#include <stdio.h>\nint main() {\n    // your code\n    return 0;\n}',
};
const DC = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' };
const BG = '#0a0a0f';

function useTimer() {
    const [s, setS] = useState(0); const [on, setOn] = useState(false); const ref = useRef(null);
    useEffect(() => { if (on) ref.current = setInterval(() => setS(p => p + 1), 1000); else clearInterval(ref.current); return () => clearInterval(ref.current); }, [on]);
    return { time: `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} `, start: () => setOn(true), stop: () => setOn(false), running: on, seconds: s };
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function Interview() {
    const [step, setStep] = useState('category'); // category | setup | ide | processing | results
    const [category, setCategory] = useState(null);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null); const streamRef = useRef(null);

    // IDE state — problem locked once at mount, never changes on re-render
    const [problem] = useState(() => problems[Math.floor(Math.random() * problems.length)] || problems[0]);
    const [lang, setLang] = useState('javascript');
    const [code, setCode] = useState(STARTER.javascript);
    const [btab, setBtab] = useState('testcase');
    const [activeTC, setActiveTC] = useState(0);
    const [result, setResult] = useState(null);
    const [running, setRunning] = useState(false);
    const [fontSize, setFontSize] = useState(14);
    const timer = useTimer();

    // Chat state
    const [chatMsgs, setChatMsgs] = useState([
        { role: 'ai', text: '👋 Hi! I\'m your AI Interview Assistant. Ask me for hints, approach ideas, or edge cases. I won\'t give you the full solution though — that\'s your job! 💪' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Results
    const [finalScore, setFinalScore] = useState(null);
    const [feedback, setFeedback] = useState('');

    /* Camera */
    const startCamera = async () => {
        try {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            const ms = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setStream(ms); streamRef.current = ms;
            if (videoRef.current) videoRef.current.srcObject = ms;
        } catch { alert("Allow camera access to continue."); }
    };
    const stopCamera = () => {
        if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
        if (videoRef.current) videoRef.current.srcObject = null;
        setStream(null);
    };
    useEffect(() => { if (step === 'setup') startCamera(); return () => { if (step !== 'ide') stopCamera(); }; }, [step]);
    useEffect(() => { if (stream && videoRef.current) videoRef.current.srcObject = stream; }, [stream, step]);
    useEffect(() => () => stopCamera(), []);

    /* Run / Submit code */
    const runCode = async (isSubmit = false) => {
        setRunning(true); setResult(null); setBtab('result');
        if (!timer.running) timer.start();
        try {
            const tc = problem.testCases?.[activeTC] || { input: '', expected: '' };
            const res = await api.post('/code/submit', { language: lang, sourceCode: code, stdin: tc.input, expectedOutput: tc.expected });
            const token = res.data.data.judge0Token;
            let att = 0;
            const poll = async () => {
                att++;
                try {
                    const r = await api.get(`/ code / result / ${token} `);
                    if (r.data.data.status === 'pending' && att < 20) setTimeout(poll, 2000);
                    else { setResult(r.data.data); setRunning(false); }
                } catch { setResult({ error: 'Failed to get result' }); setRunning(false); }
            };
            setTimeout(poll, 3000);
        } catch (e) { setResult({ error: e.response?.data?.message || 'Run failed' }); setRunning(false); }
    };

    /* AI Chatbot */
    const sendChat = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const q = chatInput.trim(); setChatInput('');
        setChatMsgs(m => [...m, { role: 'user', text: q }]);
        setChatLoading(true);
        try {
            const res = await api.post('/candidate/interview/hint', { problem: problem.title, code, language: lang, question: q });
            setChatMsgs(m => [...m, { role: 'ai', text: res.data.data.hint }]);
        } catch {
            setChatMsgs(m => [...m, { role: 'ai', text: 'Hint: Think about breaking the problem into smaller steps. What is the simplest case you can solve first?' }]);
        }
        setChatLoading(false);
    };
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

    /* End interview → AI score */
    const endInterview = async () => {
        setStep('processing'); stopCamera(); timer.stop();
        try {
            const r = result?.submission?.score ?? 0;
            const timeBonus = Math.max(0, 40 - Math.floor(timer.seconds / 60));
            const score = Math.min(100, r + timeBonus + (code.length > 50 ? 20 : 0));
            await new Promise(res => setTimeout(res, 3000));
            setFinalScore(score);
            setFeedback(generateFeedback(score, timer.seconds, result));
            setStep('results');
        } catch { setStep('results'); setFinalScore(50); setFeedback('Interview completed. AI analysis unavailable.'); }
    };

    function generateFeedback(score, secs, res) {
        const mins = Math.floor(secs / 60);
        let fb = `🧠 AI Code Analysis\n\n`;
        fb += score >= 75 ? `✅ Strong solution — demonstrates solid problem - solving ability.\n` : score >= 50 ? `⚠️ Partial solution — core logic present but needs refinement.\n` : `❌ Solution needs significant improvement.\n`;
        fb += `\n⏱️ Time taken: ${mins} min — ${mins < 20 ? 'good pacing' : 'could be faster'}.\n`;
        fb += res?.result?.status === 'accepted' ? `\n✅ Code passed the visible test cases.\n` : `\n⚠️ Code did not pass all test cases — review edge cases.\n`;
        fb += `\n📐 Code length: ${code.length} characters.${code.length > 100 ? 'Good detail.' : 'Consider a more complete solution.'} \n`;
        fb += `\n💡 Recommendation: Practice similar problems on the Code Practice hub to improve your score.`;
        return fb;
    }

    const changeLang = (l) => { setLang(l); setCode(STARTER[l] || ''); };
    const tc = problem.testCases || [{ input: '', expected: '' }];

    /* ── RENDER ─────────────────────────────────────────────── */

    if (step === 'category') return <CategoryStep category={category} setCategory={setCategory} onNext={() => setStep('setup')} />;
    if (step === 'setup') return <SetupStep stream={stream} videoRef={videoRef} onStart={() => setStep('ide')} />;
    if (step === 'processing') return <Processing />;
    if (step === 'results') return <Results score={finalScore} feedback={feedback} />;

    /* ── IDE STEP ─────────────────────────────────────────────── */
    return (
        <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: BG, overflow: 'hidden', fontFamily: "'Inter', sans-serif" }}>

            {/* TOP BAR */}
            <div style={{ height: 44, background: '#111117', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0, gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Interview Room</span>
                    <span style={{ color: '#1e1e2e' }}>›</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{problem.id}. {problem.title}</span>
                    <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: DC[problem.d], background: `${DC[problem.d]} 18` }}>{problem.d}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, background: '#1e1e2e', border: '1px solid #2d2d3d', fontFamily: 'monospace', fontSize: 12, color: timer.running ? '#34d399' : '#64748b' }}>
                        ⏱ {timer.time}
                    </div>
                    <span style={{ fontSize: 11, color: '#475569' }}>A-</span>
                    <input type="range" min={11} max={20} value={fontSize} onChange={e => setFontSize(+e.target.value)} style={{ width: 60, accentColor: '#6366f1' }} />
                    <span style={{ fontSize: 11, color: '#475569' }}>A+</span>
                    <select value={lang} onChange={e => changeLang(e.target.value)} style={{ background: '#1e1e2e', color: '#c7d2fe', border: '1px solid #2d2d3d', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>
                        {LANGS.map(l => <option key={l.v} value={l.v} style={{ background: '#111117' }}>{l.l}</option>)}
                    </select>
                    <button onClick={() => runCode(false)} disabled={running} style={{ padding: '5px 14px', borderRadius: 6, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        ▶ Run
                    </button>
                    <button onClick={() => runCode(true)} disabled={running} style={{ padding: '5px 16px', borderRadius: 6, background: running ? '#2d2d3d' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer' }}>
                        {running ? 'Judging...' : '✓ Submit'}
                    </button>
                    <button onClick={endInterview} style={{ padding: '5px 14px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        End
                    </button>
                </div>
            </div>

            {/* 3-PANE BODY */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '30% 1fr 280px', overflow: 'hidden' }}>

                {/* LEFT — Problem */}
                <div style={{ borderRight: '1px solid #1e1e2e', background: '#0d0d12', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <ProblemTabs problem={problem} tc={tc} activeTC={activeTC} setActiveTC={setActiveTC} />
                </div>

                {/* CENTER — Editor + Console */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Editor */}
                    <div style={{ flex: 1, display: 'flex', overflow: 'auto', background: '#0d0d12' }}>
                        <div style={{ padding: '10px 0', fontSize: fontSize - 2, fontFamily: 'JetBrains Mono,monospace', color: '#2d2d3d', textAlign: 'right', userSelect: 'none', minWidth: 38, background: '#0a0a0f', borderRight: '1px solid #1e1e2e' }}>
                            {code.split('\n').map((_, i) => <div key={i} style={{ padding: '0 8px', lineHeight: 1.7, color: '#334155' }}>{i + 1}</div>)}
                        </div>
                        <textarea value={code} onChange={e => setCode(e.target.value)} spellCheck={false}
                            style={{ flex: 1, resize: 'none', outline: 'none', border: 'none', padding: '10px 14px', fontFamily: 'JetBrains Mono,Fira Code,monospace', fontSize, lineHeight: 1.7, tabSize: 4, background: '#0d0d12', color: '#e2e8f0', minHeight: '100%' }}
                            onKeyDown={e => { if (e.key === 'Tab') { e.preventDefault(); const s = e.target.selectionStart; setCode(c => c.substring(0, s) + '    ' + c.substring(s)); setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 4; }, 0); } }} />
                    </div>

                    {/* Console / Test Results */}
                    <div style={{ height: 200, borderTop: '2px solid #1e1e2e', background: '#0a0a0f', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid #1e1e2e', background: '#0d0d12' }}>
                            {['testcase', 'result'].map(k => (
                                <button key={k} onClick={() => setBtab(k)} style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, color: btab === k ? '#818cf8' : '#475569', background: 'none', border: 'none', borderBottom: btab === k ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>
                                    {k === 'testcase' ? 'Testcase' : 'Test Result'}
                                    {running && k === 'result' && <span style={{ marginLeft: 6, width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', display: 'inline-block', animation: 'pulse 1s infinite' }} />}
                                </button>
                            ))}
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
                            {btab === 'testcase' && (
                                <>
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                                        {tc.map((_, i) => (
                                            <button key={i} onClick={() => setActiveTC(i)} style={{ padding: '3px 10px', borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: activeTC === i ? '#fff' : '#64748b', background: activeTC === i ? 'rgba(99,102,241,0.2)' : 'rgba(30,30,46,0.5)', border: `1px solid ${activeTC === i ? 'rgba(99,102,241,0.4)' : '#2d2d3d'} ` }}>
                                                Case {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Input</p>
                                            <pre style={{ padding: '8px 10px', borderRadius: 6, background: '#111117', border: '1px solid #1e1e2e', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: '#c7d2fe', margin: 0, whiteSpace: 'pre-wrap' }}>{tc[activeTC]?.input || '(none)'}</pre>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>Expected Output</p>
                                            <pre style={{ padding: '8px 10px', borderRadius: 6, background: '#111117', border: '1px solid #1e1e2e', fontSize: 12, fontFamily: 'JetBrains Mono,monospace', color: '#34d399', margin: 0, whiteSpace: 'pre-wrap' }}>{tc[activeTC]?.expected || '(any)'}</pre>
                                        </div>
                                    </div>
                                </>
                            )}
                            {btab === 'result' && (
                                result ? (
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: result.result?.status === 'accepted' ? '#34d399' : result.error ? '#f87171' : '#fbbf24' }}>
                                                {result.error ? `✗ ${result.error} ` : result.result?.status === 'accepted' ? '✓ Accepted' : `✗ ${result.result?.status || 'Error'} `}
                                            </span>
                                            {result.submission?.score !== undefined && <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 700 }}>Score: {result.submission.score}</span>}
                                            {result.result?.time && <span style={{ fontSize: 11, color: '#64748b' }}>⏱ {result.result.time}s</span>}
                                            {result.result?.memory && <span style={{ fontSize: 11, color: '#64748b' }}>💾 {(result.result.memory / 1024).toFixed(1)}MB</span>}
                                        </div>
                                        {result.result?.stdout && <><p style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 3 }}>STDOUT</p><pre style={{ padding: '6px 8px', borderRadius: 5, background: '#111117', fontSize: 12, fontFamily: 'monospace', color: '#34d399', margin: '0 0 6px' }}>{result.result.stdout}</pre></>}
                                        {result.result?.stderr && <><p style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 3 }}>STDERR</p><pre style={{ padding: '6px 8px', borderRadius: 5, background: '#111117', fontSize: 12, fontFamily: 'monospace', color: '#f87171', margin: 0 }}>{result.result.stderr}</pre></>}
                                        {result.result?.compile_output && <><p style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 3 }}>COMPILE</p><pre style={{ padding: '6px 8px', borderRadius: 5, background: '#111117', fontSize: 12, fontFamily: 'monospace', color: '#fbbf24', margin: 0 }}>{result.result.compile_output}</pre></>}
                                    </div>
                                ) : <div style={{ textAlign: 'center', padding: 24, color: '#475569', fontSize: 13 }}>{running ? '⏳ Running your code...' : 'Click Run or Submit to see results'}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT — AI Chat + Video pip */}
                <div style={{ borderLeft: '1px solid #1e1e2e', background: '#0d0d12', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Camera pip */}
                    <div style={{ height: 160, background: '#000', position: 'relative', flexShrink: 0, borderBottom: '1px solid #1e1e2e' }}>
                        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {stream && <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(34,197,94,0.2)', color: '#34d399', padding: '2px 8px', borderRadius: 5, fontSize: 10, fontWeight: 700, border: '1px solid rgba(34,197,94,0.3)' }}>● LIVE</div>}
                    </div>

                    {/* Chat header */}
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🤖</div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>AI Assistant</div>
                            <div style={{ fontSize: 10, color: '#22c55e' }}>● Online — ask for hints</div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {chatMsgs.map((m, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{ maxWidth: '85%', padding: '8px 10px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: m.role === 'user' ? 'rgba(99,102,241,0.2)' : '#1e1e2e', color: m.role === 'user' ? '#c7d2fe' : '#cbd5e1', fontSize: 12, lineHeight: 1.6, border: `1px solid ${m.role === 'user' ? 'rgba(99,102,241,0.3)' : '#2d2d3d'} `, whiteSpace: 'pre-wrap' }}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {chatLoading && <div style={{ display: 'flex', gap: 4, padding: 8 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: `bounce 0.8s ${i * 0.15}s infinite` }} />)}</div>}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat input */}
                    <div style={{ padding: 10, borderTop: '1px solid #1e1e2e', flexShrink: 0 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <input
                                value={chatInput} onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                                placeholder="Ask for a hint..."
                                style={{ flex: 1, background: '#111117', border: '1px solid #2d2d3d', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#e2e8f0', outline: 'none' }}
                            />
                            <button onClick={sendChat} disabled={chatLoading} style={{ padding: '8px 12px', borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>→</button>
                        </div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                            {['Hint?', 'Edge cases?', 'Time complexity?', 'Approach?'].map(q => (
                                <button key={q} onClick={() => { setChatInput(q); }} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', cursor: 'pointer' }}>{q}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
@keyframes pulse { 0 %, 100 % { opacity: 1 } 50 % { opacity: 0.3 } }
@keyframes bounce { 0 %, 100 % { transform: translateY(0) } 50 % { transform: translateY(-4px) } }
`}</style>
        </div>
    );
}

/* ─── Problem Tabs ───────────────────────────────────────────── */
function ProblemTabs({ problem, tc, activeTC, setActiveTC }) {
    const [tab, setTab] = useState('desc');
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #1e1e2e', background: '#0a0a0f', flexShrink: 0 }}>
                {[['desc', '📄 Description'], ['testcase', '☑️ Test Cases'], ['hints', '💡 Hints']].map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: tab === k ? '#818cf8' : '#475569', background: 'none', border: 'none', borderBottom: tab === k ? '2px solid #6366f1' : '2px solid transparent', cursor: 'pointer' }}>{l}</button>
                ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 18px' }}>
                {tab === 'desc' && <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{problem.id}. {problem.title}</h2>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                        <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, color: { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' }[problem.d], background: `${{ Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' }[problem.d]} 15` }}>{problem.d}</span>
                        {problem.tags?.map(t => <span key={t} style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}>{t}</span>)}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.85, color: '#c7d2fe', marginBottom: 20 }}>
                        {problem.desc?.split('\n\n').map((p, i) => <p key={i} style={{ marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>').replace(/`(.*?)`/g, '<code style="background:rgba(99,102,241,0.1);padding:1px 5px;borderRadius:3px;color:#c7d2fe;fontFamily:monospace">$1</code>') }} />)}
                    </div>
                    {problem.examples?.map((ex, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Example {i + 1}:</p>
                            <div style={{ padding: '10px 12px', borderRadius: 8, background: '#111117', borderLeft: '3px solid rgba(99,102,241,0.4)', fontFamily: 'JetBrains Mono,monospace', fontSize: 12, lineHeight: 1.7 }}>
                                <p style={{ color: '#94a3b8', margin: 0 }}><strong style={{ color: '#fff' }}>Input:</strong> {ex.input}</p>
                                <p style={{ color: '#94a3b8', margin: 0 }}><strong style={{ color: '#fff' }}>Output:</strong> {ex.output}</p>
                                {ex.exp && <p style={{ color: '#94a3b8', margin: 0 }}><strong style={{ color: '#fff' }}>Explanation:</strong> {ex.exp}</p>}
                            </div>
                        </div>
                    ))}
                    {problem.constraints && <><p style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 16, marginBottom: 6 }}>Constraints:</p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>{problem.constraints.map((c, i) => <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#94a3b8', padding: '2px 0' }}><span>•</span><code style={{ background: 'rgba(99,102,241,0.06)', padding: '1px 5px', borderRadius: 3, color: '#c7d2fe', fontFamily: 'monospace' }}>{c}</code></li>)}</ul></>}
                </>}
                {tab === 'testcase' && (
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 12 }}>SAMPLE TEST CASES</p>
                        {tc.map((t, i) => (
                            <div key={i} style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#111117', border: '1px solid #1e1e2e' }}>
                                <p style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>Case {i + 1}</p>
                                <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#c7d2fe', margin: '0 0 4px' }}>Input: <strong>{t.input || '—'}</strong></p>
                                <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#34d399', margin: 0 }}>Expected: <strong>{t.expected || '—'}</strong></p>
                            </div>
                        ))}
                        <div style={{ padding: 12, borderRadius: 8, background: 'rgba(99,102,241,0.05)', border: '1px dashed rgba(99,102,241,0.2)', textAlign: 'center' }}>
                            <p style={{ fontSize: 11, color: '#475569', margin: 0 }}>🔒 Hidden test cases revealed after submission</p>
                        </div>
                    </div>
                )}
                {tab === 'hints' && (
                    <div>
                        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Use the AI chatbot on the right for personalised hints. Here are some general strategies:</p>
                        {['Start with brute force, then optimise.', 'Identify the bottleneck: is it time or space?', 'Draw out the problem — visualise with a small example.', 'Think about what data structure fits best.', 'Read the constraints — they reveal the expected complexity.'].map((h, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, padding: '10px 12px', borderRadius: 8, background: '#111117', border: '1px solid #1e1e2e' }}>
                                <span style={{ color: '#6366f1', fontWeight: 700, fontSize: 13 }}>{i + 1}.</span>
                                <p style={{ fontSize: 13, color: '#c7d2fe', margin: 0, lineHeight: 1.6 }}>{h}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Category Select ────────────────────────────────────────── */
function CategoryStep({ category, setCategory, onNext }) {
    return (
        <div style={{ background: '#07090f', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 640 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em', marginBottom: 8 }}>Live Interview</h1>
                <p style={{ color: '#64748b', marginBottom: 32 }}>Select a category, then enter the AI-proctored coding room.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 28 }}>
                    {CATS.map(c => (
                        <div key={c.id} onClick={() => setCategory(c.id)} style={{ padding: '20px 18px', borderRadius: 14, background: category === c.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${category === c.id ? '#6366f1' : 'rgba(255,255,255,0.07)'} `, cursor: 'pointer', transition: 'all 0.2s' }}>
                            <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
                            <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 3 }}>{c.label}</div>
                            <div style={{ color: '#475569', fontSize: 12 }}>{c.sub}</div>
                        </div>
                    ))}
                </div>
                <button onClick={onNext} disabled={!category} style={{ width: '100%', padding: '14px 0', borderRadius: 12, background: category ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)', color: category ? '#fff' : '#475569', border: 'none', fontSize: 15, fontWeight: 700, cursor: category ? 'pointer' : 'not-allowed' }}>
                    Continue → Camera Setup
                </button>
            </motion.div>
        </div>
    );
}

/* ─── Camera Setup ───────────────────────────────────────────── */
function SetupStep({ stream, videoRef, onStart }) {
    return (
        <div style={{ background: '#07090f', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ width: 580, textAlign: 'center' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>System Check</h2>
                <p style={{ color: '#64748b', marginBottom: 28 }}>Ensure your camera is working before entering the interview room.</p>
                <div style={{ borderRadius: 14, overflow: 'hidden', background: '#000', height: 320, marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {stream && <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(34,197,94,0.2)', color: '#34d399', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: '1px solid rgba(34,197,94,0.3)' }}>● Camera Active</div>}
                </div>
                <button onClick={onStart} disabled={!stream} style={{ padding: '14px 48px', borderRadius: 12, background: stream ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.05)', color: stream ? '#fff' : '#475569', border: 'none', fontSize: 15, fontWeight: 700, cursor: stream ? 'pointer' : 'not-allowed', boxShadow: stream ? '0 8px 24px rgba(99,102,241,0.3)' : 'none' }}>
                    Enter Interview Room →
                </button>
            </motion.div>
        </div>
    );
}

/* ─── Processing ─────────────────────────────────────────────── */
function Processing() {
    return (
        <div style={{ background: '#07090f', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
            <div style={{ position: 'relative', width: 80, height: 80 }}>
                <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(99,102,241,0.1)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', inset: 0, border: '3px solid #6366f1', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>AI Analysing...</h2>
            <p style={{ color: '#64748b', fontSize: 15 }}>Evaluating code quality, efficiency, and correctness</p>
            <style>{`@keyframes spin{from{ transform: rotate(0) }to{ transform: rotate(360deg) } } `}</style>
        </div>
    );
}

/* ─── Results ────────────────────────────────────────────────── */
function Results({ score, feedback }) {
    return (
        <div style={{ background: '#07090f', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 720 }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(99,102,241,0.3)' }}>
                        <span style={{ fontSize: 36, fontWeight: 900, background: 'linear-gradient(135deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{score ?? '—'}</span>
                    </div>
                    <h2 style={{ fontSize: 30, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.03em', marginBottom: 6 }}>Interview Complete!</h2>
                    <p style={{ color: '#64748b' }}>Your AI-evaluated score is shown above.</p>
                </div>
                <div style={{ padding: '28px 32px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 24 }}>
                    <h3 style={{ color: '#818cf8', fontWeight: 700, marginBottom: 14, fontSize: 14 }}>📊 AI Feedback</h3>
                    <pre style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', fontSize: 14, lineHeight: 1.8, margin: 0, fontFamily: 'Inter,sans-serif' }}>{feedback}</pre>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button onClick={() => window.location.href = '/candidate/dashboard'} style={{ padding: '12px 32px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Back to Dashboard</button>
                    <button onClick={() => window.location.reload()} style={{ padding: '12px 32px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Try Again</button>
                </div>
            </motion.div>
        </div>
    );
}
