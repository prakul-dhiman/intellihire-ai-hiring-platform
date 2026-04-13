import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffectiveAuthUser } from '../hooks/useEffectiveAuthUser';
import { HiMenu, HiX, HiOutlineBell } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import api from '../api/axios';
import LogoSVG from './LogoSVG';

export default function Navbar() {
    const { logout } = useAuth();
    // useEffectiveAuthUser tracks identical-tab updates instantly after localStorage writes
    const { effectiveUser, isAuth } = useEffectiveAuthUser();
    const location = useLocation();
    
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const isMessagePage = location.pathname.includes('messages');

    // ── Update background on scroll ──
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ── Unread count and Socket.IO real-time updates ──
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
        // Automatically hide mobile menu on route changes
        setMobileMenuOpen(false);
    }, [location.pathname, isMessagePage]);

    // ── Role specific link logic ──
    const isAdmin = effectiveUser?.role === 'admin';
    const isCandidate = effectiveUser?.role === 'candidate';
    const isRecruiter = effectiveUser?.role === 'recruiter';
    const dashboardLink = isAdmin ? '/admin/dashboard' : isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard';

    // Desktop auth actions section style
    const firstName = effectiveUser?.name?.split(' ')[0] || 'User';
    const initial = effectiveUser?.name?.charAt(0).toUpperCase() || 'U';

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-500 ${
                scrolled 
                    ? 'bg-[#07090f]/90 border-b border-white/5 backdrop-blur-2xl shadow-2xl' 
                    : 'bg-transparent border-transparent'
            }`}
        >
            <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 flex items-center justify-between">
                
                {/* ── Logo ── */}
                <Link to={isAuth ? dashboardLink : "/"} className="flex items-center gap-3 no-underline group mr-8">
                    <div className="transition-transform duration-500 group-hover:rotate-[360deg]">
                        <LogoSVG size={38} />
                    </div>
                    <span className="text-xl md:text-2xl font-black text-slate-50 tracking-tighter">
                        Intelli<span className="text-[#8b5cf6]">Hire</span>
                    </span>
                </Link>

                {/* ── Desktop Nav Links Switcher ── */}
                <div className="hidden md:flex flex-1 items-center justify-start gap-4">
                    {isAuth ? (
                        /* Authenticated Dashboard Navbar */
                        <div className="flex items-center gap-2">
                            <NavLink to={dashboardLink}>Dashboard</NavLink>
                            
                            {/* Dynamically filter based on role */}
                            {isCandidate && (
                                <>
                                    <NavLink to="/candidate/resume">Resume</NavLink>
                                    <NavLink to="/candidate/code">Code Test</NavLink>
                                    <NavLink to="/candidate/profile">Profile</NavLink>
                                </>
                            )}
                            
                            {isRecruiter && (
                                <>
                                    <NavLink to="/recruiter/jobs/create">Post Job</NavLink>
                                    <NavLink to="/recruiter/dashboard">Candidates</NavLink>
                                    <NavLink to="/recruiter/settings">Settings</NavLink>
                                </>
                            )}
                        </div>
                    ) : (
                        /* Unauthenticated Landing Navbar */
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                            <NavLink to="/features">Features</NavLink>
                            <NavLink to="/changelog">Changelog</NavLink>
                            <NavLink to="/roadmap">Roadmap</NavLink>
                            <NavLink to="/about">About</NavLink>
                        </div>
                    )}
                </div>

                {/* ── Auth State Actions ── */}
                <div className="hidden md:flex items-center gap-6 justify-end">
                    {isAuth ? (
                        <div className="flex items-center gap-5">
                            {/* Notification Bell */}
                            <Link 
                                to={`/${effectiveUser?.role}/messages`} 
                                className="relative text-slate-300 hover:text-white transition-colors flex items-center"
                            >
                                <HiOutlineBell size={24} />
                                <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-[1.5px] border-[#07090f]">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            </Link>

                            {/* User Profile Block */}
                            <div className="flex items-center gap-3">
                                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-base shadow-lg">
                                    {initial}
                                </div>
                                <span className="text-[15px] font-bold text-white tracking-wide">
                                    {firstName}
                                </span>
                                <button
                                    onClick={logout}
                                    className="ml-3 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-slate-400 hover:text-slate-100 transition-colors px-4 py-2"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95 flex items-center gap-1"
                            >
                                Get Started <span aria-hidden>→</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* ── Mobile Toggle Slider ── */}
                <button
                    className="flex md:hidden bg-white/5 border border-white/10 text-slate-100 p-2 rounded-lg cursor-pointer active:scale-90 transition-transform"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                </button>
            </div>

            {/* ── Mobile Dropdown Menu Switcher ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-[72px] left-0 right-0 bg-[#07090f]/95 backdrop-blur-3xl border-b border-white/5 overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 flex flex-col gap-2">
                            {isAuth ? (
                                <>
                                    <div className="flex items-center gap-4 p-4 mb-2 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-[#8b5cf6] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                            {initial}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-white">{effectiveUser?.name}</p>
                                            <p className="text-xs text-slate-400">{effectiveUser?.email}</p>
                                        </div>
                                    </div>
                                    <MobileLink to={dashboardLink}>Dashboard</MobileLink>
                                    {(isCandidate || isRecruiter) && (
                                        <MobileLink to={`/${effectiveUser.role}/messages`}>
                                            Messages {unreadCount > 0 && <span className="bg-[#f97316] text-white text-[10px] px-1.5 py-0.5 rounded-full ml-2 border border-[#07090f]">{unreadCount}</span>}
                                        </MobileLink>
                                    )}
                                    {isCandidate && (
                                        <>
                                            <MobileLink to="/candidate/resume">Resume</MobileLink>
                                            <MobileLink to="/candidate/code">Code Test</MobileLink>
                                            <MobileLink to="/candidate/profile">Profile</MobileLink>
                                        </>
                                    )}
                                    <div className="h-px bg-white/5 my-2" />
                                    <button 
                                        onClick={() => { logout(); setMobileMenuOpen(false); }}
                                        className="w-full py-4 text-left font-bold text-red-400 hover:text-red-300 transition-colors text-sm flex items-center gap-2"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileLink to="/features">Features</MobileLink>
                                    <MobileLink to="/changelog">Changelog</MobileLink>
                                    <MobileLink to="/roadmap">Roadmap</MobileLink>
                                    <MobileLink to="/about">About</MobileLink>
                                    <div className="h-px bg-white/5 my-4" />
                                    <MobileLink to="/login">Sign In</MobileLink>
                                    <Link 
                                        to="/register" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-4 bg-[#8b5cf6] rounded-xl text-center text-sm font-bold text-white shadow-xl mt-2"
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
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
        <Link
            to={to}
            className={`px-5 py-[10px] rounded-[10px] text-[14px] font-bold transition-all duration-300 ${className} ${
                isActive 
                    ? 'text-indigo-300 bg-[#1e1b4b] shadow-inner border border-indigo-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
        >
            {children}
        </Link>
    );
}

function MobileLink({ to, children, onClick }) {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
    return (
        <Link 
            to={to} 
            onClick={onClick} 
            className={`w-full py-4 px-4 rounded-xl text-[15px] font-bold transition-colors flex items-center ${
                isActive 
                    ? 'text-indigo-300 bg-[#1e1b4b] border border-indigo-500/20' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
        >
            {children}
        </Link>
    );
}