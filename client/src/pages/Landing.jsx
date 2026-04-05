import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LogoSVG from '../components/LogoSVG';

const THEME = {
  obsidian: '#0A0B0F',
  carbon: '#13151C',
  slate: '#1E2130',
  blue: '#4F8EF7',
  violet: '#7B5EF8',
  green: '#2ECC8A',
  gold: '#F5C842',
  text: '#FFFFFF',
  textMuted: '#8F9BB3',
};

const FONTS = {
  sans: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", monospace',
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=DM+Sans:wght@400;500;700&display=swap');
    
    .landing-wrapper {
        background-color: ${THEME.obsidian};
        color: ${THEME.text};
        font-family: ${FONTS.sans};
        min-height: 100vh;
    }
    .landing-wrapper * { box-sizing: border-box; }
    
    .landing-wrapper .fade-in { animation: fadeIn 0.8s ease-out forwards; opacity: 0; }
    .landing-wrapper .fade-in-delay-1 { animation: fadeIn 0.8s ease-out 0.2s forwards; opacity: 0; }
    .landing-wrapper .fade-in-delay-2 { animation: fadeIn 0.8s ease-out 0.4s forwards; opacity: 0; }
    
    @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } }
    @keyframes fillBar { from { width: 0; } to { width: 100%; } }

    .landing-wrapper .btn-primary {
      background: linear-gradient(135deg, ${THEME.blue}, ${THEME.violet});
      color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    }
    .landing-wrapper .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 20px rgba(123, 94, 248, 0.4); }
    
    .landing-wrapper .btn-ghost {
      background: transparent; color: ${THEME.text}; border: 1px solid ${THEME.slate}; padding: 12px 24px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: all 0.2s; text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
    }
    .landing-wrapper .btn-ghost:hover { background: rgba(255,255,255,0.05); border-color: ${THEME.textMuted}; }
    
    .landing-wrapper .nav-link { color: ${THEME.textMuted}; text-decoration: none; font-weight: 500; transition: color 0.2s; cursor: pointer; }
    .landing-wrapper .nav-link:hover { color: ${THEME.text}; }
    
    .landing-wrapper .feature-card { background: ${THEME.carbon}; border: 1px solid ${THEME.slate}; border-radius: 12px; padding: 24px; transition: transform 0.2s; }
    .landing-wrapper .feature-card:hover { transform: translateY(-4px); border-color: ${THEME.blue}; }
    
    .landing-wrapper .test-card { background: ${THEME.carbon}; border: 1px solid ${THEME.slate}; border-radius: 12px; padding: 24px; }
    .landing-wrapper .dash-kpi { background: ${THEME.carbon}; border: 1px solid ${THEME.slate}; border-radius: 12px; padding: 20px; }
    .landing-wrapper .dash-nav-item { padding: 16px 20px; color: ${THEME.textMuted}; cursor: pointer; transition: all 0.2s; font-weight: 500; border-bottom: 2px solid transparent; }
    .landing-wrapper .dash-nav-item:hover { color: ${THEME.text}; }
    .landing-wrapper .dash-nav-item.active { color: ${THEME.blue}; border-bottom-color: ${THEME.blue}; }
    
    .landing-wrapper .insight-card { background: linear-gradient(90deg, ${THEME.carbon}, ${THEME.obsidian}); border-left: 4px solid ${THEME.violet}; border-radius: 8px; padding: 16px 20px; display: flex; align-items: flex-start; gap: 16px; margin-bottom: 24px; }
    .landing-wrapper .anim-fill-bar { animation: fillBar 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; transform-origin: left; }
  `}</style>
);

// ----------------------------------------------------
// 1. Animated SVG Hero Graphic
// ----------------------------------------------------
const AnimatedSVGHero = () => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId;
    const start = Date.now();
    const renderLoop = () => {
      setTime((Date.now() - start) / 1000);
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const cx = 300, cy = 250;
  const nodes = [
    { x: 100, y: 150, score: 98, l: 'Code' },
    { x: 500, y: 120, score: 95, l: 'Exp' },
    { x: 150, y: 380, score: 88, l: 'DSA' },
    { x: 450, y: 400, score: 92, l: 'Role' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: 500, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="600" height="500" viewBox="0 0 600 500">
        <defs>
          <radialGradient id="glowBig" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={THEME.violet} stopOpacity="0.2" />
            <stop offset="100%" stopColor={THEME.obsidian} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Radial Background */}
        <circle cx={cx} cy={cy} r="250" fill="url(#glowBig)" />

        {/* Edges */}
        {nodes.map((n, i) => (
          <line key={`edge-${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={THEME.slate} strokeWidth="2" strokeDasharray="4,4" />
        ))}

        {/* Realtime Data Packets */}
        {nodes.map((n, i) => {
          const progress = (time * 0.4 + i * 0.25) % 1;
          const px = n.x + (cx - n.x) * progress;
          const py = n.y + (cy - n.y) * progress;
          return <circle key={`pkt-${i}`} cx={px} cy={py} r="4" fill={THEME.gold} style={{ filter: 'drop-shadow(0 0 6px #F5C842)' }} />;
        })}

        {/* Nodes */}
        {nodes.map((n, i) => {
          const pulse = 20 + Math.sin(time * 2 + i) * 3;
          return (
            <g key={`n-${i}`}>
              <circle cx={n.x} cy={n.y} r={pulse} fill={THEME.carbon} stroke={THEME.blue} strokeWidth="2" style={{ filter: 'drop-shadow(0 0 10px rgba(79, 142, 247, 0.4))' }} />
              <text x={n.x} y={n.y + 4} fill={THEME.green} fontSize="14" fontFamily={FONTS.mono} fontWeight="bold" textAnchor="middle">{n.score}</text>
              <text x={n.x} y={n.y + 35} fill={THEME.textMuted} fontSize="12" fontFamily={FONTS.sans} textAnchor="middle">{n.l}</text>
            </g>
          );
        })}

        {/* Central Brain */}
        <g style={{ animation: 'pulse-slow 4s infinite ease-in-out', transformOrigin: `${cx}px ${cy}px` }}>
          <circle cx={cx} cy={cy} r={40} fill={THEME.carbon} stroke={THEME.violet} strokeWidth="3" style={{ filter: 'drop-shadow(0 0 20px #7B5EF8)' }} />
          <text x={cx} y={cy + 5} fill={THEME.text} fontSize="14" fontFamily={FONTS.sans} fontWeight="bold" textAnchor="middle">AI</text>
        </g>

        {/* Floating Stat Badge */}
        <g stroke={THEME.slate} strokeWidth="1" transform={`translate(420, ${180 + Math.sin(time) * 10})`}>
          <rect x="0" y="0" width="120" height="40" rx="8" fill={THEME.carbon} />
          <circle cx="20" cy="20" r="4" fill={THEME.green} />
          <text x="32" y="24" fill={THEME.text} fontSize="13" fontFamily={FONTS.sans}>Live Analysis</text>
        </g>
      </svg>
    </div>
  );
};

// ----------------------------------------------------
// 2. Landing View (Conversion-optimized)
// ----------------------------------------------------
const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  
  const dashboardLink = user?.role === 'admin' 
    ? '/admin/dashboard' 
    : user?.role === 'recruiter' 
      ? '/recruiter/dashboard' 
      : '/candidate/dashboard';

  return (
    <div className="fade-in">

      {/* Sticky Navigation */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10, 11, 15, 0.8)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${THEME.carbon}`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <Link to={isAuthenticated ? dashboardLink : "/"} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
          <LogoSVG size={34} />
          <span style={{ fontWeight: 'bold', fontSize: 18, letterSpacing: '-0.02em' }}>IntelliHire</span>
        </Link>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#testimonials" className="nav-link">Testimonials</a>
          {isAuthenticated && (
            <Link to={dashboardLink} className="nav-link" style={{ color: THEME.blue }}>Dashboard</Link>
          )}
          <Link to={isAuthenticated ? dashboardLink : "/register"} className="btn-primary">
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', display: 'flex', alignItems: 'center', gap: 40, minHeight: 'calc(100vh - 70px)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }} className="fade-in-delay-1">
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(79, 142, 247, 0.1)', color: THEME.blue, borderRadius: 20, fontSize: 13, fontWeight: 'bold', marginBottom: 24, border: `1px solid rgba(79,142,247,0.3)` }}>
            🚀 The #1 AI Hiring Platform
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 'bold', lineHeight: 1.1, margin: '0 0 24px 0', letterSpacing: '-0.03em' }}>
            Hire the right people, <span style={{ background: `linear-gradient(90deg, ${THEME.blue}, ${THEME.violet})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10× faster</span>.
          </h1>
          <p style={{ fontSize: 18, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 40, maxWidth: 500 }}>
            Automate resume screening, conduct live AI coding tests, and rank candidates instantly. Stop guessing and start hiring the best talent.
          </p>
          <div style={{ display: 'flex', gap: 16, marginBottom: 48, flexWrap: 'wrap' }}>
            <Link to={isAuthenticated ? dashboardLink : "/register"} className="btn-primary" style={{ padding: '16px 32px', fontSize: 16 }}>
              {isAuthenticated ? 'Explore Dashboard' : 'Start Hiring Free'}
            </Link>
          </div>


          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, borderTop: `1px solid ${THEME.carbon}`, paddingTop: 32 }}>
            <div><div style={{ fontSize: 28, fontWeight: 'bold', color: THEME.text }}>-80%</div><div style={{ fontSize: 14, color: THEME.textMuted }}>Time-to-Hire</div></div>
            <div><div style={{ fontSize: 28, fontWeight: 'bold', color: THEME.blue }}>95%</div><div style={{ fontSize: 14, color: THEME.textMuted }}>Match Accuracy</div></div>
            <div><div style={{ fontSize: 28, fontWeight: 'bold', color: THEME.green }}>24/7</div><div style={{ fontSize: 14, color: THEME.textMuted }}>Screening Speed</div></div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 320 }} className="fade-in-delay-2">
          <AnimatedSVGHero />
        </div>
      </section>

      {/* Social Proof Bar */}
      <section style={{ background: THEME.carbon, padding: '40px 0', borderTop: `1px solid ${THEME.slate}`, borderBottom: `1px solid ${THEME.slate}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: THEME.textMuted, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Trusted by innovative engineering teams</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 60, opacity: 0.6, flexWrap: 'wrap' }}>
            {['Acme Corp', 'Stark Ind.', 'Wayne Ent.', 'Cyberdyne', 'Massive Dyn.'].map(n => (
              <div key={n} style={{ fontSize: 20, fontWeight: 'bold', fontFamily: FONTS.mono }}>{n}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - 4 columns */}
      <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px' }}>
        <h2 style={{ fontSize: 36, textAlign: 'center', marginBottom: 60 }}>Everything you need to hire at scale</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {[
            { tag: '🧠', t: 'AI Resume Parsing', d: 'Extract skills, experience, and intent from any PDF format instantly.' },
            { tag: '⚡', t: 'Live Code Editor', d: 'Built-in Monaco editor to test complex algorithms in real-time.' },
            { tag: '🎯', t: 'Skill Matching', d: 'Proprietary ML ranks candidates based on exact job requirements.' },
            { tag: '📊', t: 'Hiring Analytics', d: 'Track bottlenecks and team performance from an executive dashboard.' }
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div style={{ fontSize: 32, marginBottom: 16 }}>{f.tag}</div>
              <h3 style={{ fontSize: 18, margin: '0 0 12px 0' }}>{f.t}</h3>
              <p style={{ color: THEME.textMuted, margin: 0, lineHeight: 1.5, fontSize: 15 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials - 3 columns */}
      <section id="testimonials" style={{ background: THEME.carbon, padding: '100px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, textAlign: 'center', marginBottom: 60 }}>Loved by Tech Leaders</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { text: "IntelliHire cut our screening time completely. We only talk to the best developers now.", name: "Sarah Chen", role: "VP of Eng" },
              { text: "The AI matching is insanely accurate. It highlighted a hidden gem candidate who just shipped our biggest feature.", name: "Mark Russo", role: "CTO" },
              { text: "The live code test environment integrated straight into the dashboard changed how we interview.", name: "David Kim", role: "Lead Recruiter" },
            ].map((t, i) => (
              <div key={i} className="test-card">
                <div style={{ color: THEME.gold, marginBottom: 16 }}>★★★★★</div>
                <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 24 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: THEME.slate, borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{t.name}</div>
                    <div style={{ color: THEME.textMuted, fontSize: 13 }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full width Gradient CTA */}
      <section style={{ background: `linear-gradient(135deg, ${THEME.blue}, ${THEME.violet})`, padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, margin: '0 0 24px 0', color: '#fff' }}>Ready to transform your hiring?</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>Join 10,000+ companies hiring better talent in a fraction of the time.</p>
        <Link to={isAuthenticated ? dashboardLink : "/register"} className="btn-primary" style={{ background: '#fff', color: THEME.obsidian }}>
          {isAuthenticated ? 'Go to Dashboard' : 'Start Your Free Trial'}
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: THEME.obsidian, padding: '60px 24px', borderTop: `1px solid ${THEME.slate}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <LogoSVG size={28} />
              <span style={{ fontWeight: 'bold', fontSize: 16 }}>IntelliHire</span>
            </div>
            <p style={{ color: THEME.textMuted, fontSize: 14, maxWidth: 250 }}>The intelligent way to hire modern engineering teams.</p>
          </div>

          <div style={{ display: 'flex', gap: 80, flexWrap: 'wrap' }}>
            {[
              { t: 'Product', ls: [{ n: 'Features', l: '/features' }, { n: 'Changelog', l: '/changelog' }, { n: 'Roadmap', l: '/roadmap' }] },
              { t: 'Resources', ls: [{ n: 'About Us', l: '/about' }, { n: 'Feedback', l: '/feedback' }, { n: 'Privacy', l: '/privacy' }] },
              { t: 'Company', ls: [{ n: 'Terms', l: '/terms' }, { n: 'Security', l: '/security' }, { n: 'GDPR', l: '/gdpr' }] }
            ].map((g, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{g.t}</div>
                {g.ls.map(item => <Link key={item.n} to={item.l} style={{ color: THEME.textMuted, textDecoration: 'none', fontSize: 14 }}>{item.n}</Link>)}
              </div>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};

// ----------------------------------------------------
// Main App Component Export
// ----------------------------------------------------
export default function LandingApp() {
  return (
    <div className="landing-wrapper">
      <GlobalStyles />
      <LandingPage />
    </div>
  );
}
