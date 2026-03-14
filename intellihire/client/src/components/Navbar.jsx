import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import api from '../api/axios';

import LogoSVG from './LogoSVG';

export default function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const isMessagePage = location.pathname.includes('messages');

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Unread count and Socket
    useEffect(() => {
        if (!isAuthenticated || !user) {
            setUnreadCount(0);
            return;
        }

        const fetchUnread = async () => {
            try {
                const res = await api.get('/messages/unread-count');
                setUnreadCount(res.data.data.count);
            } catch (err) { console.error("Unread fetch fail"); }
        };

        fetchUnread();

        // Connect socket for real-time ping
        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            withCredentials: true
        });

        socket.on('connect', () => {
            socket.emit('join-chat', user.id);
        });

        socket.on('new-message', (msg) => {
            // Only increment if not on messages page (where they are likely reading it)
            if (!window.location.pathname.includes('messages')) {
                setUnreadCount(prev => prev + 1);
            }
        });

        return () => socket.disconnect();
    }, [isAuthenticated, user]);

    // Reset count if user visits messages
    useEffect(() => {
        if (isMessagePage) {
            setUnreadCount(0);
        }
    }, [location.pathname, isMessagePage]);

    const isAdmin = user?.role === 'admin';
    const isCandidate = user?.role === 'candidate';
    const isRecruiter = user?.role === 'recruiter';
    const dashboardLink = isAdmin ? '/admin/dashboard' : isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard';

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center transition-all duration-300 ${scrolled ? 'bg-[#07090f]/92 border-b border-white/10 backdrop-blur-xl' : 'bg-transparent border-transparent'}`}
        >
            <div className="max-w-[1200px] w-full mx-auto px-10 md:px-12 flex items-center justify-between">

                {/* ── Logo ── */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
                    <LogoSVG size={42} />
                    <span style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em' }}>
                        IntelliHire
                    </span>
                </Link>

                {/* ── Desktop Links ── */}
                <div className="hidden md:flex items-center gap-2">

                    {/* Candidate-specific nav */}
                    {isAuthenticated && isCandidate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 16 }}>
                            <NavLink to="/candidate/dashboard">Dashboard</NavLink>
                            <NavLink to="/candidate/messages" style={{ position: 'relative' }}>
                                Messages
                                {unreadCount > 0 && <Badge count={unreadCount} />}
                            </NavLink>
                            <NavLink to="/candidate/live-room">
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(99,102,241,0.12)',
                                    border: '1px solid rgba(99,102,241,0.3)',
                                    borderRadius: 8, padding: '8px 16px',
                                    color: '#a78bfa', fontWeight: 700, fontSize: 14,
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 16 }}>
                            <NavLink to="/admin/dashboard">Dashboard</NavLink>
                            <NavLink to="/admin/analytics">Analytics</NavLink>
                            <NavLink to="/admin/leaderboard">Leaderboard</NavLink>
                            <NavLink to="/recruiter/room">
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    background: 'rgba(99,102,241,0.1)',
                                    border: '1px solid rgba(99,102,241,0.25)',
                                    borderRadius: 8, padding: '8px 16px',
                                    color: '#a78bfa', fontWeight: 700, fontSize: 14,
                                }}>
                                    🎙️ Interview Room
                                </span>
                            </NavLink>
                        </div>
                    )}

                    {/* Recruiter nav */}
                    {isAuthenticated && isRecruiter && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 16 }}>
                            <NavLink to="/recruiter/dashboard">Dashboard</NavLink>
                            <NavLink to="/recruiter/jobs/create">Post Job</NavLink>
                            <NavLink to="/recruiter/messages" style={{ position: 'relative' }}>
                                Messages
                                {unreadCount > 0 && <Badge count={unreadCount} />}
                            </NavLink>
                            <NavLink to="/recruiter/room">🎙️ Room</NavLink>
                        </div>
                    )}

                    {/* Public nav (not logged in) */}
                    {!isAuthenticated && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 16 }}>
                            <NavLink to="/features">Features</NavLink>
                            <NavLink to="/changelog">Changelog</NavLink>
                            <NavLink to="/roadmap">Roadmap</NavLink>
                            <NavLink to="/about">About</NavLink>
                        </div>
                    )}

                    {/* Auth buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                        {isAuthenticated ? (
                            <button
                                onClick={logout}
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#94a3b8', padding: '8px 20px',
                                    borderRadius: 9, fontSize: 14, fontWeight: 600,
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
                    className="flex md:hidden bg-transparent border-none text-[#f1f5f9] p-1.5 cursor-pointer"
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
                                <MobileLink to="/candidate/messages" onClick={() => setMobileMenuOpen(false)}>
                                    Messages {unreadCount > 0 && <span style={{ color: '#f87171', marginLeft: 8 }}>({unreadCount})</span>}
                                </MobileLink>
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
                                <MobileLink to="/recruiter/messages" onClick={() => setMobileMenuOpen(false)}>
                                    Messages {unreadCount > 0 && <span style={{ color: '#f87171', marginLeft: 8 }}>({unreadCount})</span>}
                                </MobileLink>
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

        </nav>
    );
}

/* ── Small helpers ── */
function NavLink({ to, children, style = {} }) {
    return (
        <Link
            to={to}
            style={{
                fontSize: 14, fontWeight: 500, color: '#94a3b8',
                textDecoration: 'none', padding: '8px 14px', borderRadius: 8,
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

function Badge({ count }) {
    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
                position: 'absolute',
                top: -2,
                right: -2,
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                height: 16,
                minWidth: 16,
                padding: '0 4px',
                borderRadius: 99,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
                border: '2px solid #07090f'
            }}
        >
            {count > 9 ? '9+' : count}
        </motion.span>
    );
}
