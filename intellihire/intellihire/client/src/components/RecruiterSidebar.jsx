import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiBriefcase, FiUsers, FiMessageSquare, FiTrendingUp, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import LogoSVG from './LogoSVG';

const navItems = [
    { label: 'Dashboard', path: '/recruiter/dashboard', icon: FiGrid },
    { label: 'My Jobs', path: '/recruiter/jobs', icon: FiBriefcase },
    { label: 'Post New Job', path: '/recruiter/post-job', icon: FiBriefcase },
    { label: 'Applicants', path: '/recruiter/applicants', icon: FiUsers },
    { label: 'Interviews', path: '/recruiter/interviews', icon: FiMessageSquare },
    { label: 'Analytics', path: '/recruiter/analytics', icon: FiTrendingUp },
    { label: 'Settings', path: '/recruiter/settings', icon: FiSettings },
];

export default function RecruiterSidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="w-64 h-screen flex flex-col pt-8" style={{ background: '#0B0F19', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Brand */}
            <div className="px-8 flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate('/')}>
                <LogoSVG size={36} />
                <span className="text-white font-bold text-lg tracking-wide">IntelliHire</span>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-2 px-4 flex-1">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                            <div className={`relative px-4 py-3 rounded-xl flex items-center gap-4 transition-all duration-200 group ${isActive ? 'bg-indigo-500/10' : 'hover:bg-white/5'}`}>
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div layoutId="recruiter-active-nav" className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                                    )}
                                </AnimatePresence>
                                <item.icon size={20} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
                                <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{item.label}</span>
                            </div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 mt-auto border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-slate-300 font-bold text-sm">{user?.name?.charAt(0) || 'R'}</span>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Recruiter'}</p>
                            <p className="text-xs text-indigo-400 font-medium tracking-wide">Company User</p>
                        </div>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Log out">
                        <FiLogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
