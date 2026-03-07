import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { problems } from '../../data/problems';
import api from '../../api/axios';
import { useWebRTC } from '../../hooks/useWebRTC';

/* ─── constants ─────────────────────────────────────── */
const GRAD = 'linear-gradient(135deg,#6366f1,#8b5cf6)';
const LOW_LIGHT = 60;          // brightness threshold
const FACE_TIMEOUT = 60;        // seconds before auto-exit

const LANGS = {
    javascript: { ext: javascript(), label: 'JavaScript', starter: '// Write your solution here\nfunction solution() {\n\n}\n' },
    python: { ext: python(), label: 'Python', starter: '# Write your solution here\ndef solution():\n    pass\n' },
    java: { ext: java(), label: 'Java', starter: '// Write your solution here\nclass Solution {\n    public void solve() {\n    }\n}\n' },
};

/* ─── helpers ───────────────────────────────────────── */
function analyzeFrame(videoEl, canvasEl) {
    if (!videoEl || !canvasEl || videoEl.readyState < 2) return { brightness: 128, facePresent: true };
    const ctx = canvasEl.getContext('2d');
    canvasEl.width = videoEl.videoWidth || 320;
    canvasEl.height = videoEl.videoHeight || 240;
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    const data = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const brightness = sum / (data.length / 4);
    // Crude "face present" — assume face present if brightness > 20 (not pitch black)
    const facePresent = brightness > 20;
    return { brightness, facePresent };
}

export default function LiveRoom() {
    /* ── join phase state ───────────────────────────── */
    const [phase, setPhase] = useState('join'); // join | camera | interview | ended
    const [codeInput, setCodeInput] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);
    const [sessionInfo, setSessionInfo] = useState(null);
    const [problem, setProblem] = useState(null);

    /* ── interview state ────────────────────────────── */
    const [lang, setLang] = useState('javascript');
    const [code, setCode] = useState(LANGS.javascript.starter);
    const [output, setOutput] = useState('');
    const [running, setRunning] = useState(false);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    /* ── chat ───────────────────────────────────────── */
    const [chatMsgs, setChatMsgs] = useState([]);
    const [chatInput, setChatInput] = useState('');

    /* ── proctoring state ───────────────────────────── */
    const [brightness, setBrightness] = useState(128);
    const [facePresent, setFacePresent] = useState(true);
    const [faceAbsentSecs, setFaceAbsentSecs] = useState(0);
    const [activeAlert, setActiveAlert] = useState(null);
    const [strikes, setStrikes] = useState(0);
    const [tabViolation, setTabViolation] = useState(false);

    /* ── refs ───────────────────────────────────────── */
    const canvasRef = useRef(null);
    const analysisInterval = useRef(null);
    const faceTimer = useRef(null);

    /* ── WebRTC — active only during interview ─────── */
    const {
        localVideoRef: rtcLocalRef,
        remoteVideoRef,
        connected,
        peerConnected,
        localReady,
        error: rtcError,
        sendChatMsg,
    } = useWebRTC({
        sessionCode: sessionInfo?.code || '',
        role: 'candidate',
        enabled: phase === 'interview',
    });

    /* ── Interview timer ────────────────────────────── */
    useEffect(() => {
        if (phase === 'interview') {
            timerRef.current = setInterval(() => setTimer(s => s + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [phase]);

    const fmt = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

    /* ── Listen for chat messages from recruiter ─────── */
    useEffect(() => {
        const handler = (e) => {
            const { from, text } = e.detail;
            setChatMsgs(m => [...m, { from, text }]);
        };
        window.addEventListener('rtc-chat', handler);
        return () => window.removeEventListener('rtc-chat', handler);
    }, []);

    /* ── AI Proctoring analysis loop ─────────────────── */
    useEffect(() => {
        if (phase !== 'interview') return;

        // Analysis every 2 seconds
        analysisInterval.current = setInterval(() => {
            const { brightness: b, facePresent: fp } = analyzeFrame(rtcLocalRef.current, canvasRef.current);
            setBrightness(b);
            setFacePresent(fp);

            if (b < LOW_LIGHT) {
                triggerAlert('⚠️ Low lighting detected');
            }
        }, 2000);

        return () => {
            clearInterval(analysisInterval.current);
        };
    }, [phase]);

    /* ── Face absence timer ──────────────────────────── */
    useEffect(() => {
        if (!facePresent && phase === 'interview') {
            faceTimer.current = setInterval(() => {
                setFaceAbsentSecs(s => {
                    const next = s + 1;
                    if (next >= FACE_TIMEOUT) {
                        endInterview('auto-exit: face not detected');
                    }
                    return next;
                });
            }, 1000);
        } else {
            clearInterval(faceTimer.current);
            setFaceAbsentSecs(0);
        }
        return () => clearInterval(faceTimer.current);
    }, [facePresent, phase]);

    /* ── Tab visibility detection ────────────────────── */
    useEffect(() => {
        if (phase !== 'interview') return;
        const handler = () => {
            if (document.hidden) {
                setTabViolation(true);
                triggerAlert('🚨 Tab switch detected!');
            }
        };
        document.addEventListener('visibilitychange', handler);
        return () => document.removeEventListener('visibilitychange', handler);
    }, [phase]);

    function triggerAlert(label) {
        setActiveAlert({ label });
        setStrikes(s => {
            const next = s + 1;
            if (next >= 3) endInterview('auto-exit: 3 violations');
            return next;
        });
        setTimeout(() => setActiveAlert(null), 4000);
    }

    /* ══════════════════════════════════════════════════
       HANDLERS
    ═══════════════════════════════════════════════════ */
    const handleJoin = async () => {
        const code = codeInput.trim().toUpperCase();
        if (!code || code.length !== 6) {
            setJoinError('Please enter the 6-character session code.');
            return;
        }
        setJoining(true);
        setJoinError('');
        try {
            const res = await api.post('/sessions/validate', { code });
            const info = res.data.data;
            const prob = problems.find(p => p.id === info.problemId) || problems[0];
            setSessionInfo(info);
            setProblem(prob);
            setCode(LANGS[lang].starter);
            setPhase('interview');
            setChatMsgs([{ from: 'system', text: `Joined session ${code}. Problem: ${prob.title}` }]);
        } catch (err) {
            setJoinError(err.response?.data?.message || 'Invalid session code. Please check and try again.');
        } finally {
            setJoining(false);
        }
    };

    const endInterview = (reason = 'ended') => {
        clearInterval(timerRef.current);
        clearInterval(analysisInterval.current);
        clearInterval(faceTimer.current);
        if (rtcLocalRef.current?.srcObject) {
            rtcLocalRef.current.srcObject.getTracks().forEach(t => t.stop());
        }
        setPhase('ended');
        console.log('Interview ended:', reason);
    };

    const runCode = async () => {
        setRunning(true);
        setOutput('');
        try {
            const res = await api.post('/code/run', {
                code,
                language: lang,
                testCases: problem?.testCases?.slice(0, 3) || [],
            });
            setOutput(res.data.output || 'No output');
        } catch (err) {
            setOutput(`Error: ${err.response?.data?.message || 'Execution failed'}`);
        } finally {
            setRunning(false);
        }
    };

    const sendChat = () => {
        if (!chatInput.trim()) return;
        const text = chatInput.trim();
        setChatMsgs(m => [...m, { from: 'you', text }]);
        sendChatMsg(text);
        setChatInput('');
    };

    /* ══════════════════════════════════════════════════
       JOIN PHASE
    ═══════════════════════════════════════════════════ */
    if (phase === 'join') return (
        <div style={{ background: '#07090f', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                style={{ width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 36px' }}>

                <div style={{ width: 64, height: 64, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>🛡️</div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', textAlign: 'center', marginBottom: 6 }}>AI Proctored Interview</h1>
                <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 1.7 }}>Enter the 6-character session code from your recruiter to join the proctored room.</p>

                {/* Code input */}
                <input
                    value={codeInput}
                    onChange={e => setCodeInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    maxLength={6}
                    placeholder="X X X X X X"
                    style={{ width: '100%', padding: '18px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${joinError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`, color: '#c7d2fe', fontSize: 28, fontFamily: 'monospace', fontWeight: 900, textAlign: 'center', letterSpacing: '0.18em', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
                />

                {joinError && (
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: 13, marginBottom: 12 }}>
                        ⚠️ {joinError}
                    </div>
                )}

                <button onClick={handleJoin} disabled={joining}
                    style={{ width: '100%', padding: '14px', borderRadius: 12, background: joining ? 'rgba(99,102,241,0.4)' : GRAD, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: joining ? 'default' : 'pointer', marginBottom: 24 }}>
                    {joining ? '⏳ Joining...' : 'Join Interview Room →'}
                </button>

                {/* Proctoring disclaimer */}
                <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 8 }}>🛡️ AI Proctoring Active In This Room:</div>
                    {['Camera + microphone monitoring', 'Face & lighting detection', 'Tab switching blocked', 'Auto-exit on 3 violations'].map(item => (
                        <div key={item} style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ color: '#34d399' }}>✓</span> {item}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );

    /* ══════════════════════════════════════════════════
       ENDED PHASE
    ═══════════════════════════════════════════════════ */
    if (phase === 'ended') return (
        <div style={{ background: '#07090f', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🏁</div>
                <h2 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', marginBottom: 8 }}>Interview Complete</h2>
                <p style={{ color: '#64748b', marginBottom: 24 }}>Duration: <strong style={{ color: '#818cf8' }}>{fmt}</strong></p>
                <p style={{ color: '#475569', marginBottom: 32 }}>Your session has ended. The recruiter will review your performance.</p>
                <button onClick={() => { setPhase('join'); setCodeInput(''); setTimer(0); }}
                    style={{ padding: '12px 28px', borderRadius: 10, background: GRAD, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    ← Back to Join
                </button>
            </motion.div>
        </div>
    );

    /* ══════════════════════════════════════════════════
       INTERVIEW PHASE
    ═══════════════════════════════════════════════════ */
    return (
        <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#050508', overflow: 'hidden', position: 'relative' }}>

            {/* ── Status bar ─────────────────────────────────── */}
            <div style={{ height: 38, background: '#0d0d14', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', fontSize: 11, fontWeight: 700, color: '#818cf8' }}>
                    🛡️ SESSION: <span style={{ fontFamily: 'monospace', color: '#c7d2fe', marginLeft: 4 }}>{sessionInfo?.code}</span>
                </div>

                {/* Proctoring indicators */}
                {[
                    { l: 'Face', ok: facePresent },
                    { l: 'Light', ok: brightness > LOW_LIGHT },
                    { l: 'Tab', ok: !tabViolation },
                ].map(ind => (
                    <div key={ind.l} style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '2px 8px', borderRadius: 5, background: ind.ok ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.08)', border: `1px solid ${ind.ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.2)'}` }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: ind.ok ? '#34d399' : '#f87171' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: ind.ok ? '#34d399' : '#f87171' }}>{ind.l}</span>
                    </div>
                ))}

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: peerConnected ? '#34d399' : connected ? '#fbbf24' : '#475569', fontWeight: 700 }}>
                        {peerConnected ? '● Recruiter Connected' : connected ? '● Connecting...' : '○ No video'}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#818cf8', fontWeight: 700 }}>⏱ {fmt}</span>
                    <span style={{ fontSize: 11, color: '#f87171', fontWeight: 700 }}>⚡ {strikes}/3 strikes</span>
                    <button onClick={() => endInterview('manual')}
                        style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                        Exit
                    </button>
                </div>
            </div>

            {/* ── 3-pane: Problem | Code editor | Camera + Chat ─── */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '26% 1fr 280px', overflow: 'hidden' }}>

                {/* LEFT — Problem description */}
                <div style={{ borderRight: '1px solid #1a1a2e', background: '#09090f', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📋 Problem</div>

                    {problem && (<>
                        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#0e0e1a', border: '1px solid #1a1a2e' }}>
                            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 6 }}>{problem?.id}. {problem?.title}</div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' }[problem?.d] || '#34d399', background: `${{ Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' }[problem?.d] || '#34d399'}18` }}>{problem?.d}</span>
                                {problem.tags?.map(t => <span key={t} style={{ padding: '1px 7px', borderRadius: 99, fontSize: 10, color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}>{t}</span>)}
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.8, margin: 0 }}>{problem.desc}</p>
                        </div>

                        {problem.examples?.length > 0 && (
                            <div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Examples</div>
                                {problem.examples.map((ex, i) => (
                                    <div key={i} style={{ background: '#0e0e1a', border: '1px solid #1a1a2e', borderRadius: 8, padding: '10px 12px', marginBottom: 8, fontFamily: 'monospace', fontSize: 11 }}>
                                        <div style={{ color: '#475569', marginBottom: 4 }}>Input: <span style={{ color: '#c7d2fe' }}>{ex.input}</span></div>
                                        <div style={{ color: '#475569' }}>Output: <span style={{ color: '#34d399' }}>{ex.output}</span></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {problem.constraints?.length > 0 && (
                            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.1)' }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Constraints</div>
                                {problem.constraints.map((c, i) => <div key={i} style={{ fontSize: 11, color: '#475569', marginBottom: 2 }}>• {c}</div>)}
                            </div>
                        )}
                    </>)}
                </div>

                {/* CENTER — Code editor */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#06060e' }}>
                    {/* Language selector + run button */}
                    <div style={{ padding: '6px 12px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <select value={lang} onChange={e => { setLang(e.target.value); setCode(LANGS[e.target.value].starter); }}
                            style={{ background: '#0e0e1a', border: '1px solid #1a1a2e', borderRadius: 6, color: '#94a3b8', fontSize: 12, padding: '4px 8px', cursor: 'pointer', outline: 'none' }}>
                            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            <button onClick={runCode} disabled={running}
                                style={{ padding: '5px 14px', borderRadius: 7, background: running ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.12)', color: '#34d399', border: '1px solid rgba(34,197,94,0.25)', fontSize: 12, fontWeight: 700, cursor: running ? 'default' : 'pointer' }}>
                                {running ? '⏳ Running...' : '▶ Run Code'}
                            </button>
                        </div>
                    </div>

                    {/* CodeMirror editor */}
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <CodeMirror
                            value={code}
                            height="100%"
                            theme={vscodeDark}
                            extensions={[LANGS[lang].ext]}
                            onChange={v => setCode(v)}
                            style={{ fontSize: 13, height: '100%' }}
                        />
                    </div>

                    {/* Output panel */}
                    {output && (
                        <div style={{ flexShrink: 0, maxHeight: 160, overflowY: 'auto', borderTop: '1px solid #1a1a2e', background: '#050810', padding: '10px 14px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Output</div>
                            <pre style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', margin: 0, whiteSpace: 'pre-wrap' }}>{output}</pre>
                        </div>
                    )}
                </div>

                {/* RIGHT — Camera view + Chat */}
                <div style={{ borderLeft: '1px solid #1a1a2e', background: '#09090f', display: 'flex', flexDirection: 'column' }}>

                    {/* Video call area */}
                    <div style={{ flexShrink: 0, height: 220, position: 'relative', background: '#000', borderBottom: '2px solid #1a1a2e', overflow: 'hidden' }}>

                        {/* Recruiter video (from WebRTC) — fills box */}
                        <video ref={remoteVideoRef} autoPlay playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

                        {/* Offline overlay */}
                        {!peerConnected && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#06060e', gap: 8 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '2px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👨‍💼</div>
                                <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Waiting for recruiter...</div>
                            </div>
                        )}

                        {/* Recruiter label */}
                        {peerConnected && (
                            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, padding: '2px 7px', borderRadius: 5, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#34d399' }} />
                                <span style={{ fontSize: 9, fontWeight: 800, color: '#34d399', letterSpacing: '0.06em' }}>RECRUITER</span>
                            </div>
                        )}

                        {/* Candidate self-cam PiP (proctoring camera) */}
                        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 80, height: 60, borderRadius: 7, overflow: 'hidden', border: '2px solid rgba(99,102,241,0.5)', background: '#000' }}>
                            <video ref={rtcLocalRef} autoPlay muted playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            <div style={{ position: 'absolute', bottom: 2, left: 2, fontSize: 7, fontWeight: 800, color: '#34d399' }}>YOU</div>
                        </div>

                        {/* Light indicator */}
                        <div style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 9, fontWeight: 700, color: brightness < LOW_LIGHT ? '#f87171' : '#34d399' }}>
                            {brightness < LOW_LIGHT ? '⚠️ Low light' : '✓ Light OK'}
                        </div>

                        {/* Canvas for analysis (hidden) */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    {/* Chat messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {chatMsgs.map((m, i) => (
                            <div key={i} style={{ padding: '7px 9px', borderRadius: 8, background: m.from === 'system' ? 'rgba(99,102,241,0.06)' : m.from === 'you' ? 'rgba(99,102,241,0.12)' : 'rgba(30,30,50,0.8)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: m.from === 'system' ? '#818cf8' : '#cbd5e1', lineHeight: 1.5 }}>
                                {m.from !== 'system' && <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 2, textTransform: 'uppercase' }}>{m.from === 'you' ? 'You' : 'Recruiter'}</div>}
                                {m.text}
                            </div>
                        ))}
                    </div>

                    {/* Chat input */}
                    <div style={{ padding: '8px 10px', borderTop: '1px solid #1a1a2e', display: 'flex', gap: 6, flexShrink: 0 }}>
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                            placeholder="Message recruiter..."
                            style={{ flex: 1, background: '#0e0e1a', border: '1px solid #1a1a2e', borderRadius: 7, padding: '7px 10px', fontSize: 12, color: '#e2e8f0', outline: 'none' }} />
                        <button onClick={sendChat}
                            style={{ padding: '7px 12px', borderRadius: 7, background: GRAD, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}>→</button>
                    </div>
                </div>
            </div>

            {/* ── VIOLATION ALERT OVERLAY ─────────────────────── */}
            <AnimatePresence>
                {activeAlert && (
                    <motion.div
                        initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
                        style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, padding: '14px 18px', borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', backdropFilter: 'blur(10px)', maxWidth: 280, boxShadow: '0 0 24px rgba(239,68,68,0.2)' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f87171', marginBottom: 4 }}>{activeAlert.label}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                            {strikes}/3 strikes used.
                            {strikes >= 2 && <strong style={{ color: '#f87171' }}> One more = auto-exit!</strong>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── FACE ABSENT OVERLAY ─────────────────────────── */}
            <AnimatePresence>
                {!facePresent && faceAbsentSecs >= 12 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.5)', borderRadius: 16, padding: '32px 40px', textAlign: 'center', backdropFilter: 'blur(16px)' }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
                            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#f87171', marginBottom: 6 }}>Face Not Detected!</h3>
                            <p style={{ color: '#94a3b8', marginBottom: 12 }}>Please return to frame immediately</p>
                            <div style={{ fontSize: 36, fontWeight: 900, color: '#f87171', fontFamily: 'monospace' }}>{FACE_TIMEOUT - faceAbsentSecs}s</div>
                            <p style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>Auto-exit if face not detected</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        </div>
    );
}
