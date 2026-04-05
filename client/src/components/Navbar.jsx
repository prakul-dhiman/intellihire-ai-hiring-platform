import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import api from '../api/axios';

import LogoSVG from './LogoSVG';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
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
        if (!isAuthenticated || !user?.id) {
            setUnreadCount(0);
            return;
        }

        const fetchUnread = async () => {
            try {
                const res = await api.get('/messages/unread-count');
                setUnreadCount(res.data?.data?.count ?? 0);
            } catch (err) {
                // 401 = token not yet accepted by server (cold start / race).
                // Any other error = silently skip, badge stays at 0.
                if (err.response?.status !== 401) {
                    console.error('Unread fetch fail', err.response?.status);
                }
            }
        };

        fetchUnread();

        // Always connect through window.location.origin so that:
        //   Dev  → Vite proxy forwards /socket.io → localhost:5000
        //   Prod → Vercel /socket.io rewrite → Render (keeps auth headers intact)
        // Never connect directly to the Render URL — that bypasses the proxy and
        // loses the Authorization header on cross-origin requests.
        const socket = io(window.location.origin, {
            withCredentials: true,
            path: '/socket.io',
        });

        socket.on('connect', () => {
            if (user?.id) socket.emit('join-chat', user.id);
        });

        socket.on('new-message', () => {
            // Only increment if not on messages page (where they are likely reading it)
            if (!window.location.pathname.includes('messages')) {
                setUnreadCount(prev => prev + 1);
            }
        });

        return () => socket.disconnect();
    }, [isAuthenticated, user?.id]);

    // Reset count if user visits messages
    useEffect(() => {
        if (isMessagePage) {
            setUnreadCount(0);
        }
    }, [location.pathname, isMessagePage]);

    const isAdmin = user?.role === 'admin';
    const isCandidate = user?.role === 'candidate';
    const isRecruiter = user?.role === 'recruiter';
    const dashboardLink = isAdmin 
        ? '/admin/dashboard' 
        : isRecruiter 
            ? '/recruiter/dashboard' 
            : '/candidate/dashboard';

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center transition-all duration-500 ${
                scrolled 
                    ? 'bg-[#07090f]/80 boreder-b border-white/5 backdrop-blur-2xl shadow-2xl' 
                    : 'bg-transparent border-transparent'
            }`}
        >
            <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 flex items-center justify-between">
                
                {/* ── Logo ── */}
                <Link to={isAuthenticated ? dashboardLink : "/"} className="flex items-center gap-3 no-underline group">
                    <div className="transition-transform duration-500 group-hover:rotate-[360deg]">
                        <LogoSVG size={38} />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-slate-50 tracking-tighter">
                        Intelli<span className="text-indigo-500">Hire</span>
                    </span>
                </Link>

                {/* ── Desktop Links ── */}
                <div className="hidden md:flex items-center gap-1">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-1 mr-4">
                            {isCandidate && (
                                <>
                                    <NavLink to="/candidate/dashboard">Dashboard</NavLink>
                                    <NavLink to="/candidate/jobs">Jobs</NavLink>
                                    <NavLink to="/candidate/messages" className="relative">
                                        Messages
                                        {unreadCount > 0 && <Badge count={unreadCount} />}
                                    </NavLink>
                                    <NavLink to="/candidate/code">IDE</NavLink>
                                </>
                            )}
                            {isRecruiter && (
                                <>
                                    <NavLink to="/recruiter/dashboard">Dashboard</NavLink>
                                    <NavLink to="/recruiter/jobs/create">Post Job</NavLink>
                                    <NavLink to="/recruiter/messages" className="relative">
                                        Messages
                                        {unreadCount > 0 && <Badge count={unreadCount} />}
                                    </NavLink>
                                </>
                            )}
                            {isAdmin && (
                                <>
                                    <NavLink to="/admin/dashboard">Admin</NavLink>
                                    <NavLink to="/admin/analytics">Insights</NavLink>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 mr-4 text-sm font-semibold text-slate-400">
                           <NavLink to="/features">Features</NavLink>
                           <NavLink to="/about">About</NavLink>
                        </div>
                    )}

                    {/* Auth Section */}
                    <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link 
                                    to={isCandidate ? "/candidate/profile" : "/recruiter/dashboard"}
                                    className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs"
                                >
                                    {user?.name?.charAt(0).toUpperCase()}
                                </Link>
                                <button
                                    onClick={logout}
                                    className="text-xs font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-95"
                                >
                                    Join Platform
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Mobile Toggle ── */}
                <button
                    className="flex md:hidden bg-white/5 border border-white/10 text-slate-100 p-2 rounded-lg cursor-pointer active:scale-90 transition-transform"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <HiX size={20} /> : <HiMenu size={20} />}
                </button>
            </div>

            {/* ── Mobile Menu ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-[64px] left-0 right-0 bg-[#07090f]/95 backdrop-blur-3xl border-b border-white/5 overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 flex flex-col gap-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="p-4 mb-2 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Signed in as</p>
                                        <p className="text-sm font-bold text-slate-200">{user?.name}</p>
                                        <p className="text-[10px] text-slate-500">{user?.email}</p>
                                    </div>
                                    <MobileLink to={dashboardLink} onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileLink>
                                    {(isCandidate || isRecruiter) && (
                                        <MobileLink to={`/${user.role}/messages`} onClick={() => setMobileMenuOpen(false)}>
                                            Messages {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-2">{unreadCount}</span>}
                                        </MobileLink>
                                    )}
                                    <div className="h-px bg-white/5 my-2" />
                                    <button 
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="w-full py-4 text-left font-bold text-red-500 text-sm flex items-center gap-2"
                                    >
                                        End Session
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileLink to="/features" onClick={() => setMobileMenuOpen(false)}>Features</MobileLink>
                                    <MobileLink to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</MobileLink>
                                    <div className="h-px bg-white/5 my-4" />
                                    <Link 
                                        to="/register" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-4 bg-indigo-600 rounded-xl text-center text-sm font-bold text-white shadow-xl"
                                    >
                                        Create Account
                                    </Link>
                                    <Link 
                                        to="/login" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-4 text-center text-sm font-bold text-slate-400"
                                    >
                                        Existing User Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}

/* ── Modern UI Components ── */
function NavLink({ to, children, className = "" }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link
            to={to}
            className={`
                px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200
                ${className}
                ${isActive 
                    ? 'text-indigo-400 bg-indigo-500/10' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}
            `}
        >
            {children}
        </Link>
    );
}

function MobileLink({ to, children, onClick }) {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link 
            to={to} 
            onClick={onClick} 
            className={`
                w-full py-4 px-2 rounded-xl text-sm font-bold transition-colors
                ${isActive ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-400'}
            `}
        >
            {children}
        </Link>
    );
}

function Badge({ count }) {
    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#07090f] shadow-lg"
        >
            {count > 9 ? '9+' : count}
        </motion.span>
    );
}
