import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { problems } from '../../data/problems';
import api from '../../api/axios';
import { useWebRTC } from '../../hooks/useWebRTC';
import CodeMirror from '@uiw/react-codemirror';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';

const LANGS = {
    javascript: { ext: javascript(), label: 'JavaScript' },
    python: { ext: python(), label: 'Python' },
    java: { ext: java(), label: 'Java' },
};

const GRAD = 'linear-gradient(135deg,#6366f1,#8b5cf6)';
const BG = '#07090f';
const DC = { Easy: '#34d399', Medium: '#fbbf24', Hard: '#f87171' };

export default function RecruiterRoom() {
    /* ── state ─────────────────────────────────────────────────── */
    const [phase, setPhase] = useState('create');   // create | lobby | live | ended
    const [sessionCode, setSessionCode] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [selectedProblem, setSelectedProblem] = useState(problems[0]);

    const [chatMsgs, setChatMsgs] = useState([
        { from: 'system', text: 'Session created. Share the code with your candidate.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [notes, setNotes] = useState('');
    const [rating, setRating] = useState(0);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);
    const [code, setCode] = useState('// Waiting for candidate to start...');
    const [lang, setLang] = useState('javascript');
    const blockRemoteUpdates = useRef(false);

    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    /* ── WebRTC — only active while in 'live' phase ─────────────── */
    const {
        localVideoRef,
        remoteVideoRef,
        connected,
        peerConnected,
        localReady,
        error: rtcError,
        sendChatMsg,
        sendCodeChange,
    } = useWebRTC({ sessionCode, role: 'recruiter', enabled: phase === 'live' });

    /* ── Interview timer ────────────────────────────────────────── */
    useEffect(() => {
        if (phase === 'live') {
            timerRef.current = setInterval(() => setTimer(s => s + 1), 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [phase]);

    const fmt = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

    /* ── Sync incoming chat from candidate ─────────────────────── */
    // The useWebRTC hook exposes sendChatMsg; incoming chat handled via socket events
    // We set up a listener inside useWebRTC. To forward messages to component state,
    // we do it via a custom event bus approach using the hook's socket event.
    // For simplicity, the hook fires window events when chat is received.
    useEffect(() => {
        const chatHandler = (e) => {
            const { from, text } = e.detail;
            setChatMsgs(m => [...m, { from, text }]);
        };
        const codeHandler = (e) => {
            blockRemoteUpdates.current = true;
            setCode(e.detail.code);
            setTimeout(() => blockRemoteUpdates.current = false, 50);
        };
        window.addEventListener('rtc-chat', chatHandler);
        window.addEventListener('rtc-code', codeHandler);
        return () => {
            window.removeEventListener('rtc-chat', chatHandler);
            window.removeEventListener('rtc-code', codeHandler);
        };
    }, []);

    /* ── Handlers ───────────────────────────────────────────────── */
    const createSession = async () => {
        setCreating(true);
        setCreateError('');
        try {
            const res = await api.post('/sessions/create', {
                candidateName,
                problemId: selectedProblem?.id,
                problemTitle: selectedProblem?.title,
                problemDifficulty: selectedProblem?.d,
            });
            setSessionCode(res.data.data.code);
            setPhase('lobby');
        } catch (err) {
            console.error('Session create error:', err.response?.data || err.message);
            setCreateError(err.response?.data?.message || 'Failed to create session. Try again.');
        } finally {
            setCreating(false);
        }
    };

    const startInterview = () => {
        setChatMsgs(m => [...m, { from: 'system', text: `Interview started! Code: ${sessionCode}` }]);
        setPhase('live');
    };

    const endInterview = () => {
        clearInterval(timerRef.current);
        setPhase('ended');
    };

    const sendChat = () => {
        if (!chatInput.trim()) return;
        const text = chatInput.trim();
        setChatMsgs(m => [...m, { from: 'recruiter', text }]);
        sendChatMsg(text);
        setChatInput('');
    };

    /* ════════════════════════════════════════════════════════════
       CREATE PHASE
    ═══════════════════════════════════════════════════════════════ */
    if (phase === 'create') return (
        <div style={{ background: BG, minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 640, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 36px' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 20px', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>👨‍💼</div>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', textAlign: 'center', marginBottom: 6, letterSpacing: '-0.04em' }}>Create Interview Session</h1>
                <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 32, lineHeight: 1.7 }}>Set up a proctored coding interview. A unique session code will be generated for your candidate.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 28 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Candidate Name</label>
                        <input value={candidateName} onChange={e => setCandidateName(e.target.value)}
                            placeholder="e.g. John Doe"
                            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Select Problem</label>
                        <select value={selectedProblem.id} onChange={e => setSelectedProblem(problems.find(p => p.id === +e.target.value) || problems[0])}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
                            {problems.map(p => <option key={p.id} value={p.id} style={{ background: '#0d0d14' }}>{p.id}. {p.title} [{p.d}]</option>)}
                        </select>
                    </div>
                </div>

                {createError && (
                    <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                        ⚠️ {createError}
                    </div>
                )}

                <button onClick={createSession} disabled={creating}
                    style={{ width: '100%', padding: '14px', borderRadius: 12, background: creating ? 'rgba(99,102,241,0.4)' : GRAD, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: creating ? 'default' : 'pointer', letterSpacing: '-0.01em' }}>
                    {creating ? '⏳ Creating...' : '🚀 Create Interview Session'}
                </button>
            </motion.div>
        </div>
    );

    /* ════════════════════════════════════════════════════════════
       LOBBY PHASE
    ═══════════════════════════════════════════════════════════════ */
    if (phase === 'lobby') return (
        <div style={{ background: BG, minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ width: '100%', maxWidth: 520, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '36px' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Session Code</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 42, fontWeight: 900, color: '#c7d2fe', letterSpacing: '0.18em', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '16px 24px', marginBottom: 10 }}>
                        {sessionCode}
                    </div>
                    <p style={{ color: '#475569', fontSize: 13 }}>Share this code with <strong style={{ color: '#94a3b8' }}>{candidateName || 'your candidate'}</strong></p>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Problem Assigned</div>
                    <div style={{ color: '#c7d2fe', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{selectedProblem.id}. {selectedProblem.title}</div>
                    <span style={{ padding: '2px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: DC[selectedProblem.d], background: `${DC[selectedProblem.d]}18` }}>{selectedProblem.d}</span>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setPhase('create')}
                        style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        ← New Session
                    </button>
                    <button onClick={startInterview}
                        style={{ flex: 2, padding: '12px', borderRadius: 10, background: GRAD, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                        🎙️ Start Interview Now
                    </button>
                </div>
            </motion.div>
        </div>
    );

    /* ════════════════════════════════════════════════════════════
       ENDED PHASE
    ═══════════════════════════════════════════════════════════════ */
    if (phase === 'ended') return (
        <div style={{ background: BG, minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 560, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 36px' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ fontSize: 52, marginBottom: 12 }}>🏁</div>
                    <h2 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', marginBottom: 6 }}>Interview Ended</h2>
                    <p style={{ color: '#64748b' }}>Duration: <strong style={{ color: '#818cf8' }}>{fmt}</strong></p>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <p style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 10, fontSize: 14 }}>⭐ Overall Rating</p>
                    <div style={{ display: 'flex', gap: 4 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setRating(s)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 30, color: s <= rating ? '#f59e0b' : '#1e293b', transition: 'transform 0.15s', transform: s <= rating ? 'scale(1.15)' : 'scale(1)' }}>★</button>
                        ))}
                    </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                    <p style={{ fontWeight: 700, color: '#94a3b8', marginBottom: 8, fontSize: 13 }}>📝 Session Notes</p>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add your interview notes..."
                        rows={5} style={{ width: '100%', background: 'rgba(15,15,25,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button onClick={() => { setPhase('create'); setTimer(0); setSessionCode(''); }}
                        style={{ padding: '12px 28px', borderRadius: 10, background: GRAD, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>New Session</button>
                    <button onClick={() => window.location.href = '/admin/leaderboard'}
                        style={{ padding: '12px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Leaderboard</button>
                </div>
            </motion.div>
        </div>
    );

    /* ════════════════════════════════════════════════════════════
       LIVE PHASE
    ═══════════════════════════════════════════════════════════════ */
    return (
        <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#050508', overflow: 'hidden' }}>

            {/* ── Top status bar ──────────────────────────────────────── */}
            <div style={{ height: 40, background: '#0d0d14', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 11, fontWeight: 700, color: '#34d399' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                    LIVE · <span style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{sessionCode}</span>
                </div>
                <span style={{ fontSize: 12, color: '#64748b' }}>👤 <strong style={{ color: '#94a3b8' }}>{candidateName || 'Candidate'}</strong></span>
                <span style={{ fontSize: 12, color: '#64748b' }}>📋 <strong style={{ color: '#818cf8' }}>{selectedProblem?.title || 'Problem Set'}</strong></span>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {/* WebRTC status */}
                    <span style={{ fontSize: 11, color: peerConnected ? '#34d399' : connected ? '#fbbf24' : '#f87171', fontWeight: 700 }}>
                        {peerConnected ? '● Video Connected' : connected ? '● Waiting for candidate...' : '○ Connecting...'}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#818cf8', fontWeight: 700 }}>⏱ {fmt}</span>
                    <button onClick={endInterview}
                        style={{ padding: '4px 14px', borderRadius: 7, background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        End Session
                    </button>
                </div>
            </div>

            {/* ── 3-pane layout: Problem | Code monitor | Video + Chat ─── */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '28% 1fr 300px', overflow: 'hidden' }}>

                {/* LEFT — Problem info + notes */}
                <div style={{ borderRight: '1px solid #1a1a2e', background: '#09090f', overflowY: 'auto', padding: '16px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>📋 Problem</p>
                    <div style={{ padding: '12px 14px', borderRadius: 10, background: '#0e0e1a', border: '1px solid #1a1a2e', marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 4, fontSize: 14 }}>{selectedProblem?.id}. {selectedProblem?.title}</div>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                            <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: DC[selectedProblem?.d] || '#34d399', background: `${DC[selectedProblem?.d] || '#34d399'}18` }}>{selectedProblem?.d}</span>
                            {selectedProblem?.tags?.map(t => <span key={t} style={{ padding: '1px 7px', borderRadius: 99, fontSize: 10, color: '#818cf8', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.12)' }}>{t}</span>)}
                        </div>
                        <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{selectedProblem?.desc?.split('\n\n')[0]?.substring(0, 200)}...</p>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>📝 Notes</p>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Type notes here..."
                        style={{ width: '100%', minHeight: 160, background: '#0e0e1a', border: '1px solid #1a1a2e', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box', lineHeight: 1.7 }} />
                </div>

                {/* CENTER — Live code monitor placeholder */}
                <div style={{ display: 'flex', flexDirection: 'column', background: '#06060e', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 14px', borderBottom: '1px solid #1a1a2e', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>👁️ LIVE CODE MONITOR (READ ONLY)</span>
                        <select value={lang} onChange={e => setLang(e.target.value)}
                            style={{ background: '#0e0e1a', border: '1px solid #1a1a2e', borderRadius: 6, color: '#94a3b8', fontSize: 10, padding: '2px 6px', cursor: 'pointer', outline: 'none' }}>
                            {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <span style={{ fontSize: 11, color: peerConnected ? '#34d399' : '#475569', marginLeft: 'auto' }}>
                            {peerConnected ? '● Viewing Candidate Stream' : '○ Waiting for candidate...'}
                        </span>
                    </div>
                    <div style={{ flex: 1, overflow: 'auto' }}>
                        <CodeMirror
                            value={code}
                            height="100%"
                            theme={vscodeDark}
                            extensions={[LANGS[lang].ext]}
                            readOnly={true}
                            style={{ fontSize: 13, height: '100%' }}
                        />
                    </div>
                </div>

                {/* RIGHT — Video call + Chat */}
                <div style={{ borderLeft: '1px solid #1a1a2e', background: '#09090f', display: 'flex', flexDirection: 'column' }}>

                    {/* Video call area */}
                    <div style={{ flexShrink: 0, height: 250, position: 'relative', background: '#000', borderBottom: '2px solid #1a1a2e', overflow: 'hidden' }}>

                        {/* Remote video (candidate) — full box */}
                        <video ref={remoteVideoRef} autoPlay playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />

                        {/* Offline overlay */}
                        {!peerConnected && (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#05050d', gap: 8 }}>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', border: '2px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>
                                <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Waiting for candidate to join...</span>
                                <span style={{ fontSize: 10, color: '#334155' }}>Code: <strong style={{ color: '#818cf8', fontFamily: 'monospace' }}>{sessionCode}</strong></span>
                            </div>
                        )}

                        {/* Candidate label */}
                        {peerConnected && (
                            <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 5, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fbbf24' }} />
                                <span style={{ fontSize: 9, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.06em' }}>CANDIDATE</span>
                            </div>
                        )}

                        {/* Local video PiP (recruiter's own cam) */}
                        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 88, height: 66, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(99,102,241,0.5)', background: '#000' }}>
                            <video ref={localVideoRef} autoPlay muted playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            {!localReady && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06060e' }}>
                                    <span style={{ fontSize: 16 }}>👨‍💼</span>
                                </div>
                            )}
                            <div style={{ position: 'absolute', bottom: 2, left: 3, fontSize: 7, fontWeight: 800, color: '#34d399' }}>YOU</div>
                        </div>

                        {/* RTC error badge */}
                        {rtcError && (
                            <div style={{ position: 'absolute', top: 8, right: 8, padding: '4px 8px', borderRadius: 5, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', fontSize: 9, color: '#f87171', maxWidth: 140 }}>{rtcError}</div>
                        )}
                    </div>

                    {/* Chat messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {chatMsgs.map((m, i) => (
                            <div key={i} style={{ padding: '7px 9px', borderRadius: 8, background: m.from === 'system' ? 'rgba(99,102,241,0.06)' : m.from === 'recruiter' ? 'rgba(99,102,241,0.12)' : 'rgba(30,30,50,0.8)', border: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: m.from === 'system' ? '#818cf8' : '#cbd5e1', lineHeight: 1.5 }}>
                                {m.from !== 'system' && <div style={{ fontSize: 9, fontWeight: 700, color: '#475569', marginBottom: 2, textTransform: 'uppercase' }}>{m.from}</div>}
                                {m.text}
                            </div>
                        ))}
                    </div>

                    {/* Chat input */}
                    <div style={{ padding: '8px 10px', borderTop: '1px solid #1a1a2e', display: 'flex', gap: 6 }}>
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                            placeholder="Message candidate..."
                            style={{ flex: 1, background: '#0e0e1a', border: '1px solid #1a1a2e', borderRadius: 7, padding: '7px 10px', fontSize: 12, color: '#e2e8f0', outline: 'none' }} />
                        <button onClick={sendChat}
                            style={{ padding: '7px 12px', borderRadius: 7, background: GRAD, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}>→</button>
                    </div>
                </div>
            </div>

            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        </div>
    );
}
