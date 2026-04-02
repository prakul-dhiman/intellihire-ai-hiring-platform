import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Smart rule-based responses about IntelliHire ──────────── */
const RESPONSES = {
    greet: { keys: ['hi', 'hello', 'hey', 'namaste', 'good', 'morning', 'evening'], reply: "Hi there! 👋 I'm IntelliBot, your AI guide for IntelliHire.\n\nI can help you with:\n• What IntelliHire does\n• How to get started\n• Features & modules\n• Interview & coding platform\n\nWhat would you like to know?" },
    about: { keys: ['what is', 'about', 'intellihire', 'platform', 'explain', 'tell me'], reply: "**IntelliHire** is an AI-powered hiring platform built by Prakul Dhiman. 🧠\n\nWe help companies:\n✅ Auto-screen resumes with AI\n✅ Assess coding skills (LeetCode-style)\n✅ Conduct AI-analyzed interviews\n✅ Rank candidates by score\n\nNo more manual screening — hire 10x faster!" },
    resume: { keys: ['resume', 'cv', 'upload', 'scan', 'parse', 'ats'], reply: "Our **AI Resume Scanner** 📄:\n\n• Upload your PDF resume\n• AI extracts skills, education, experience\n• Get an instant match score with job descriptions\n• Recruiters see your AI-ranked profile\n\nGo to Dashboard → Resume to get started!" },
    code: { keys: ['coding', 'code', 'practice', 'leetcode', 'problem', 'editor', 'test'], reply: "Our **Coding Practice Hub** 💻 is like LeetCode inside IntelliHire:\n\n• 150+ DSA problems (Easy/Medium/Hard)\n• Real-time code execution (Judge0)\n• Multiple languages: JS, Python, Java, C++\n• Hidden test cases on submit\n• AI hints when you're stuck\n\nFind it at Dashboard → Practice!" },
    interview: { keys: ['interview', 'live', 'video', 'proctored', 'camera', 'ai interview'], reply: "**Live Interview Module** 🎥:\n\n• Professional IDE (3-pane: Problem | Code | AI Chat)\n• Camera-proctored live session\n• Real code execution during interview\n• AI chatbot gives hints without spoiling\n• After submission: AI scores your code + time\n• Full feedback report\n\nAccess via Dashboard → Live Interview!" },
    score: { keys: ['score', 'marks', 'rank', 'leaderboard', 'rating', 'points'], reply: "**IntelliHire Scoring System** 📊:\n\n| Module | Weight |\n|--------|--------|\n| Resume Score | 30% |\n| Coding Score | 40% |\n| Interview Score | 30% |\n\nYour **Final Score** is a weighted average. Recruiters see candidates ranked by this score. Improve each module to climb the leaderboard!" },
    register: { keys: ['register', 'sign up', 'signup', 'create account', 'join', 'start'], reply: "Getting started is easy! 🚀\n\n1. Click **Get Started** at the top\n2. Fill in your name, email & password\n3. Choose your role: Candidate or Recruiter\n4. You're in!\n\nCandidates get a full dashboard with coding practice, resume builder, and AI interview access." },
    login: { keys: ['login', 'sign in', 'password', 'forgot', 'access', 'account'], reply: "To sign in:\n\n1. Click **Sign In** in the top navbar\n2. Enter your email & password\n3. You'll be redirected to your dashboard\n\nForgot password? Contact support at support@intellihire.com 📧" },
    recruiter: { keys: ['recruiter', 'hire', 'company', 'employer', 'post job', 'shortlist'], reply: "For **Recruiters** 🏢:\n\n• Post jobs with required skills\n• AI auto-ranks all applicants\n• See resume match scores\n• Schedule & conduct live coding interviews\n• Access full candidate analytics\n\nWe save your team 80% of screening time!" },
    pricing: { keys: ['price', 'cost', 'free', 'plan', 'paid', 'subscription'], reply: "IntelliHire is currently in **beta** — free to use! 🎉\n\nAll features are available at no cost:\n✅ Resume AI Scanner\n✅ Coding Practice Hub\n✅ Live Interview Room\n✅ AI Analysis & Scoring\n\nCreate your free account today!" },
    tech: { keys: ['tech', 'stack', 'built with', 'technology', 'react', 'node', 'mongodb'], reply: "**Tech Stack** ⚙️:\n\nFrontend: React 18 + Vite + Framer Motion\nBackend: Node.js + Express\nDatabase: MongoDB\nCode Runner: Judge0 API\nAI: GPT-4 powered analysis\nAuth: JWT + bcrypt\n\nBuilt by Prakul Dhiman 🚀" },
    contact: { keys: ['contact', 'support', 'help', 'email', 'reach'], reply: "Need help? 📬\n\n• Email: support@intellihire.com\n• Built by: Prakul Dhiman\n• GitHub: github.com/prakuldhiman\n\nFor bugs or feature requests, use the contact form or email directly. We respond within 24 hours!" },
    bye: { keys: ['bye', 'goodbye', 'thanks', 'thank you', 'ok done', 'great', 'awesome'], reply: "Thanks for chatting! 🙌\n\nGood luck with your hiring journey on IntelliHire. Feel free to ask me anything anytime!\n\n– IntelliBot 🤖" },
};

function getReply(msg) {
    const lower = msg.toLowerCase();
    for (const [, { keys, reply }] of Object.entries(RESPONSES)) {
        if (keys.some(k => lower.includes(k))) return reply;
    }
    return "Hmm, I'm not sure about that specific topic. 🤔\n\nTry asking me about:\n• Resume scanning\n• Coding practice\n• Live interviews\n• Scoring system\n• How to register\n\nOr email us at support@intellihire.com!";
}

const QUICK = ['What is IntelliHire?', 'How to register?', 'Coding Practice', 'Live Interview', 'Scoring system'];

/* ─── ChatbotWidget ──────────────────────────────────────────── */
export default function ChatbotWidget() {
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([
        { role: 'bot', text: "Hey! 👋 I'm **IntelliBot** — your AI guide for IntelliHire.\n\nAsk me anything about the platform, features, or how to get started!" }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [unread, setUnread] = useState(1);
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);
    useEffect(() => { if (open) setUnread(0); }, [open]);

    const send = (text) => {
        const q = (text || input).trim();
        if (!q) return;
        setInput('');
        setMsgs(m => [...m, { role: 'user', text: q }]);
        setTyping(true);
        setTimeout(() => {
            setTyping(false);
            setMsgs(m => [...m, { role: 'bot', text: getReply(q) }]);
            if (!open) setUnread(n => n + 1);
        }, 900 + Math.random() * 600);
    };

    const renderText = (t) => t.split('\n').map((line, i) => {
        const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <span key={i} dangerouslySetInnerHTML={{ __html: bold }} style={{ display: 'block', lineHeight: 1.65 }} />;
    });

    return (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>

            {/* Chat Window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.92 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                        style={{
                            position: 'absolute', bottom: 72, right: 0,
                            width: 360, height: 520, borderRadius: 20,
                            background: 'rgba(10, 10, 18, 0.97)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08)',
                            display: 'flex', flexDirection: 'column', overflow: 'hidden',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', borderBottom: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>🤖</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>IntelliBot</div>
                                <div style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 5px #22c55e' }} />
                                    Online · replies instantly
                                </div>
                            </div>
                            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4, borderRadius: 6, fontSize: 16, lineHeight: 1 }}
                                onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>✕</button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10, scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
                            {msgs.map((m, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                                    {m.role === 'bot' && <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, marginBottom: 2 }}>🤖</div>}
                                    <motion.div
                                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            maxWidth: '78%', padding: '9px 12px', borderRadius: m.role === 'user' ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                                            background: m.role === 'user' ? 'linear-gradient(135deg,rgba(99,102,241,0.25),rgba(139,92,246,0.2))' : 'rgba(30,30,50,0.8)',
                                            border: `1px solid ${m.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                            color: '#e2e8f0', fontSize: 13,
                                        }}
                                    >
                                        {renderText(m.text)}
                                    </motion.div>
                                    {m.role === 'user' && <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, color: '#818cf8', fontWeight: 700, marginBottom: 2 }}>U</div>}
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {typing && (
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
                                    <div style={{ padding: '10px 14px', borderRadius: '16px 16px 16px 3px', background: 'rgba(30,30,50,0.8)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 4, alignItems: 'center' }}>
                                        {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: `dotBounce 1.1s ${i * 0.18}s infinite ease-in-out` }} />)}
                                    </div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Quick replies */}
                        <div style={{ padding: '8px 12px 0', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
                            {QUICK.map(q => (
                                <button key={q} onClick={() => send(q)} style={{ fontSize: 10, padding: '4px 9px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: '#818cf8', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.18)'; e.currentTarget.style.color = '#c7d2fe'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.color = '#818cf8'; }}>
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Input */}
                        <div style={{ padding: '10px 12px 14px', flexShrink: 0 }}>
                            <div style={{ display: 'flex', gap: 8, background: 'rgba(20,20,35,0.8)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)', padding: '4px 4px 4px 12px', transition: 'border-color 0.2s' }}
                                onFocusCapture={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
                                onBlurCapture={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'}>
                                <input
                                    value={input} onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                                    placeholder="Ask me anything..."
                                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13, padding: '6px 0' }}
                                />
                                <button onClick={() => send()} disabled={!input.trim() || typing}
                                    style={{ width: 36, height: 36, borderRadius: 9, background: input.trim() && !typing ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.1)', color: input.trim() && !typing ? '#fff' : '#475569', border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all 0.2s', flexShrink: 0 }}>
                                    →
                                </button>
                            </div>
                            <p style={{ fontSize: 10, color: '#334155', textAlign: 'center', marginTop: 8 }}>Powered by IntelliHire AI · Ask anything</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                onClick={() => setOpen(o => !o)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.93 }}
                style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: open ? 'rgba(30,30,50,0.95)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    border: open ? '1px solid rgba(99,102,241,0.3)' : 'none',
                    color: '#fff', fontSize: open ? 22 : 26,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: open ? '0 4px 20px rgba(0,0,0,0.3)' : '0 8px 32px rgba(99,102,241,0.45)',
                    transition: 'background 0.3s, box-shadow 0.3s',
                    position: 'relative',
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.span key={open ? 'close' : 'open'} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: 0.2 }}>
                        {open ? '✕' : '🤖'}
                    </motion.span>
                </AnimatePresence>

                {/* Unread badge */}
                {!open && unread > 0 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                        position: 'absolute', top: -3, right: -3,
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#ef4444', color: '#fff',
                        fontSize: 10, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #07090f',
                    }}>
                        {unread}
                    </motion.div>
                )}

                {/* Pulse ring when closed */}
                {!open && (
                    <span style={{
                        position: 'absolute', inset: -4,
                        borderRadius: '50%', border: '2px solid rgba(99,102,241,0.4)',
                        animation: 'chatPulse 2s ease-out infinite',
                        pointerEvents: 'none',
                    }} />
                )}
            </motion.button>

            <style>{`
                @keyframes dotBounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
                @keyframes chatPulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
            `}</style>
        </div>
    );
}
