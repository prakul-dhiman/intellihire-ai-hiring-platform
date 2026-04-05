import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffectiveAuthUser } from '../hooks/useEffectiveAuthUser';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import api from '../api/axios';
import LogoSVG from './LogoSVG';

export default function Navbar() {
    const { logout } = useAuth();
    const { effectiveUser, isAuth } = useEffectiveAuthUser();
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
        if (!isAuth || !effectiveUser?.id) {
            setUnreadCount(0);
            return;
        }

        const fetchUnread = async () => {
            try {
                const res = await api.get('/messages/unread-count');
                setUnreadCount(res.data?.data?.count ?? 0);
            } catch (err) {
                if (err.response?.status !== 401) {
                    console.error('Unread fetch fail', err.response?.status);
                }
            }
        };

        fetchUnread();

        const socket = io(window.location.origin, {
            withCredentials: true,
            path: '/socket.io',
        });

        socket.on('connect', () => {
            if (effectiveUser?.id) socket.emit('join-chat', effectiveUser.id);
        });

        socket.on('new-message', () => {
            if (!window.location.pathname.includes('messages')) {
                setUnreadCount(prev => prev + 1);
            }
        });

        return () => socket.disconnect();
    }, [isAuth, effectiveUser?.id]);

    useEffect(() => {
        if (isMessagePage) setUnreadCount(0);
    }, [location.pathname, isMessagePage]);

    const isAdmin = effectiveUser?.role === 'admin';
    const isCandidate = effectiveUser?.role === 'candidate';
    const isRecruiter = effectiveUser?.role === 'recruiter';
    const dashboardLink = isAdmin ? '/admin/dashboard' : isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard';

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center transition-all duration-500 ${
                scrolled 
                    ? 'bg-[#07090f]/80 border-b border-white/5 backdrop-blur-2xl shadow-2xl' 
                    : 'bg-transparent border-transparent'
            }`}
        >
            <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 flex items-center justify-between">
                
                {/* ── Logo ── */}
                <Link to={isAuth ? dashboardLink : "/"} className="flex items-center gap-3 no-underline group">
                    <div className="transition-transform duration-500 group-hover:rotate-[360deg]">
                        <LogoSVG size={38} />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-slate-50 tracking-tighter">
                        Intelli<span className="text-indigo-500">Hire</span>
                    </span>
                </Link>

                {/* ── Desktop Links ── */}
                <div className="hidden md:flex flex-1 items-center justify-center gap-1">
                    {isAuth ? (
                        <div className="flex items-center gap-1">
                            <NavLink to={dashboardLink}>Dashboard</NavLink>
                            <NavLink to={`/${effectiveUser?.role}/messages`} className="relative">
                                Messages
                                {unreadCount > 0 && <Badge count={unreadCount} />}
                            </NavLink>
                            
                            <Link 
                                to={isCandidate ? "/candidate/live-room" : "/recruiter/room"}
                                className="mx-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2 text-indigo-400 font-bold text-xs hover:bg-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Interview
                            </Link>

                            <NavLink to="/candidate/practice">Practice</NavLink>
                            <NavLink to="/candidate/resume">Resume</NavLink>
                            <NavLink to="/candidate/profile">Profile</NavLink>
                            <NavLink to="/candidate/settings">Settings</NavLink>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-sm font-semibold text-slate-400">
                            <NavLink to="/features">Features</NavLink>
                            <NavLink to="/changelog">Changelog</NavLink>
                            <NavLink to="/roadmap">Roadmap</NavLink>
                            <NavLink to="/about">About</NavLink>
                        </div>
                    )}
                </div>

                {/* ── Auth Section ── */}
                <div className="hidden md:flex items-center gap-4 min-w-[120px] justify-end">
                    {isAuth ? (
                        <button
                            onClick={logout}
                            className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all active:scale-95"
                        >
                            Logout
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-95 inline-flex items-center gap-1"
                            >
                                Get Started <span aria-hidden>→</span>
                            </Link>
                        </div>
                    )}
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
                            {isAuth ? (
                                <>
                                    <div className="p-4 mb-2 rounded-2xl bg-white/5 border border-white/5">
                                        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Signed in as</p>
                                        <p className="text-sm font-bold text-slate-200">{effectiveUser?.name}</p>
                                        <p className="text-[10px] text-slate-500">{effectiveUser?.email}</p>
                                    </div>
                                    <MobileLink to={dashboardLink} onClick={() => setMobileMenuOpen(false)}>Dashboard</MobileLink>
                                    {(isCandidate || isRecruiter) && (
                                        <MobileLink to={`/${effectiveUser.role}/messages`} onClick={() => setMobileMenuOpen(false)}>
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
                                    <MobileLink to="/changelog" onClick={() => setMobileMenuOpen(false)}>Changelog</MobileLink>
                                    <MobileLink to="/roadmap" onClick={() => setMobileMenuOpen(false)}>Roadmap</MobileLink>
                                    <MobileLink to="/about" onClick={() => setMobileMenuOpen(false)}>About</MobileLink>
                                    <div className="h-px bg-white/5 my-4" />
                                    <MobileLink to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</MobileLink>
                                    <Link 
                                        to="/register" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-4 bg-indigo-600 rounded-xl text-center text-sm font-bold text-white shadow-xl"
                                    >
                                        Get Started →
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

function NavLink({ to, children, className = "" }) {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link
            to={to}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${className} ${isActive ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}
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
            className={`w-full py-4 px-2 rounded-xl text-sm font-bold transition-colors ${isActive ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-400'}`}
        >
            {children}
        </Link>
    );
}

function Badge({ count }) {
    return (
        <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#07090f] shadow-lg"
        >
            {count > 9 ? '9+' : count}
        </motion.span>
    );
}