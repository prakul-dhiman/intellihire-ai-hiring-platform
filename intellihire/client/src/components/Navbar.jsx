import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isAdmin = user?.role === 'admin';
    const isCandidate = user?.role === 'candidate';
    const isRecruiter = user?.role === 'recruiter';
    const dashboardLink = isAdmin ? '/admin/dashboard' : isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard';

    return (
        <nav
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                height: 64,
                display: 'flex', alignItems: 'center',
                transition: 'background 0.3s, border-color 0.3s, backdrop-filter 0.3s',
                background: scrolled ? 'rgba(7, 9, 15, 0.92)' : 'transparent',
                borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
            }}
        >
            <div style={{
                maxWidth: 1200, width: '100%', margin: '0 auto',
                padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>

                {/* ── Logo ── */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 800, fontSize: 13,
                        boxShadow: '0 0 20px rgba(99,102,241,0.45)',
                    }}>
                        IH
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
                        IntelliHire
                    </span>
                </Link>

                {/* ── Desktop Links ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hidden-mobile">

                    {/* Candidate-specific nav */}
                    {isAuthenticated && isCandidate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 8 }}>
                            <NavLink to="/candidate/dashboard">Dashboard</NavLink>
                            <NavLink to="/candidate/messages">Messages</NavLink>
                            <NavLink to="/candidate/live-room">
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(99,102,241,0.12)',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                    borderRadius: 8, padding: '6px 14px',
                                    color: '#a78bfa', fontWeight: 700, fontSize: 13,
                                    transition: 'all 0.2s',
                                }}>
                                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px #22c55e' }} />
                                    Live Interview
                                </span>
                            </NavLink>
                            <NavLink to="/candidate/code">Practice</NavLink>
                            <NavLink to="/candidate/resume">Resume</NavLink>
                            <NavLink to="/candidate/profile">Profile</NavLink>
                            <NavLink to="/candidate/settings">Settings</NavLink>
                        </div>
                    )}

                    {/* Admin nav */}
                    {isAuthenticated && isAdmin && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 8 }}>
                            <NavLink to="/admin/dashboard">Dashboard</NavLink>
                            <NavLink to="/admin/analytics">Analytics</NavLink>
                            <NavLink to="/admin/leaderboard">Leaderboard</NavLink>
                            <NavLink to="/recruiter/room">
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(99,102,241,0.1)',
                                    border: '1px solid rgba(99,102,241,0.25)',
                                    borderRadius: 8, padding: '6px 14px',
                                    color: '#a78bfa', fontWeight: 700, fontSize: 13,
                                }}>
                                    🎙️ Interview Room
                                </span>
                            </NavLink>
                        </div>
                    )}

                    {/* Recruiter nav */}
                    {isAuthenticated && isRecruiter && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 8 }}>
                            <NavLink to="/recruiter/dashboard">Dashboard</NavLink>
                            <NavLink to="/recruiter/jobs/create">Post Job</NavLink>
                            <NavLink to="/recruiter/messages">Messages</NavLink>
                            <NavLink to="/recruiter/room">🎙️ Room</NavLink>
                        </div>
                    )}

                    {/* Public nav (not logged in) */}
                    {!isAuthenticated && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 8 }}>
                            <NavLink to="/features">Features</NavLink>
                            <NavLink to="/changelog">Changelog</NavLink>
                            <NavLink to="/roadmap">Roadmap</NavLink>
                            <NavLink to="/about">About</NavLink>
                        </div>
                    )}

                    {/* Auth buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                        {isAuthenticated ? (
                            <button
                                onClick={logout}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#94a3b8', padding: '8px 18px',
                                    borderRadius: 9, fontSize: 13, fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link to="/login" style={{
                                    fontSize: 13, fontWeight: 600, color: '#94a3b8',
                                    textDecoration: 'none', padding: '8px 16px',
                                    borderRadius: 9, transition: 'color 0.2s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff', padding: '9px 20px',
                                        borderRadius: 9, fontSize: 13, fontWeight: 700,
                                        textDecoration: 'none', transition: 'opacity .2s',
                                        boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                                        whiteSpace: 'nowrap',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                    Get Started →
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* ── Mobile Toggle ── */}
                <button
                    className="show-mobile"
                    style={{ background: 'none', border: 'none', color: '#f1f5f9', padding: 6, cursor: 'pointer', display: 'none' }}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                </button>
            </div>

            {/* ── Mobile Menu ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        style={{
                            position: 'absolute', top: 64, left: 0, right: 0,
                            background: 'rgba(7,9,15,0.98)',
                            borderBottom: '1px solid rgba(255,255,255,0.07)',
                            backdropFilter: 'blur(20px)',
                            padding: '16px 24px 24px',
                            display: 'flex', flexDirection: 'column', gap: 4,
                        }}
                    >
                        {isAuthenticated && isCandidate && (
                            <>
                                <MobileLink to="/candidate/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileLink>
                                <MobileLink to="/candidate/messages" onClick={() => setMobileMenuOpen(false)}>Messages</MobileLink>
                                <MobileLink to="/candidate/interview" onClick={() => setMobileMenuOpen(false)}>🟢 Live Interview</MobileLink>
                                <MobileLink to="/candidate/code" onClick={() => setMobileMenuOpen(false)}>Practice</MobileLink>
                                <MobileLink to="/candidate/resume" onClick={() => setMobileMenuOpen(false)}>Resume</MobileLink>
                                <MobileLink to="/candidate/profile" onClick={() => setMobileMenuOpen(false)}>Profile</MobileLink>
                                <MobileLink to="/candidate/settings" onClick={() => setMobileMenuOpen(false)}>Settings</MobileLink>
                            </>
                        )}
                        {isAuthenticated && isAdmin && (
                            <>
                                <MobileLink to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileLink>
                                <MobileLink to="/admin/analytics" onClick={() => setMobileMenuOpen(false)}>Analytics</MobileLink>
                            </>
                        )}
                        {isAuthenticated && isRecruiter && (
                            <>
                                <MobileLink to="/recruiter/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileLink>
                                <MobileLink to="/recruiter/jobs/create" onClick={() => setMobileMenuOpen(false)}>Post Job</MobileLink>
                                <MobileLink to="/recruiter/messages" onClick={() => setMobileMenuOpen(false)}>Messages</MobileLink>
                                <MobileLink to="/recruiter/room" onClick={() => setMobileMenuOpen(false)}>Interview Room</MobileLink>
                            </>
                        )}
                        {!isAuthenticated && (
                            <>
                                <MobileLink to="/features" onClick={() => setMobileMenuOpen(false)}>Features</MobileLink>
                                <MobileLink to="/changelog" onClick={() => setMobileMenuOpen(false)}>Changelog</MobileLink>
                                <MobileLink to="/roadmap" onClick={() => setMobileMenuOpen(false)}>Roadmap</MobileLink>
                                <MobileLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileLink>
                            </>
                        )}
                        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />
                        {isAuthenticated ? (
                            <button
                                onClick={() => { logout(); setMobileMenuOpen(false); }}
                                style={{ fontSize: 15, fontWeight: 600, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '10px 4px' }}
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <MobileLink to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</MobileLink>
                                <Link
                                    to="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    style={{
                                        display: 'block', marginTop: 8,
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff', padding: '13px 20px', borderRadius: 12,
                                        fontWeight: 700, fontSize: 15, textDecoration: 'none', textAlign: 'center',
                                    }}
                                >
                                    Get Started →
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @media (max-width: 768px) {
                    .hidden-mobile { display: none !important; }
                    .show-mobile { display: flex !important; }
                }
            `}</style>
        </nav>
    );
}

/* ── Small helpers ── */
function NavLink({ to, children, style = {} }) {
    return (
        <Link
            to={to}
            style={{
                fontSize: 13, fontWeight: 500, color: '#94a3b8',
                textDecoration: 'none', padding: '7px 12px', borderRadius: 8,
                transition: 'all 0.15s', whiteSpace: 'nowrap', ...style,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
        >
            {children}
        </Link>
    );
}

function MobileLink({ to, children, onClick }) {
    return (
        <Link to={to} onClick={onClick} style={{
            fontSize: 15, fontWeight: 500, color: '#94a3b8',
            textDecoration: 'none', padding: '10px 4px', display: 'block',
        }}>
            {children}
        </Link>
    );
}
