import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import api from '../api/axios';
import LogoSVG from './LogoSVG';

/* ───────────────────────────────────────────── */
/* Fix: same logic used in App.jsx */
function getEffectiveUser(ctxUser) {
    if (ctxUser) return ctxUser;

    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}
/* ───────────────────────────────────────────── */

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();

    const effectiveUser = getEffectiveUser(user);
    const isAuth = isAuthenticated || !!effectiveUser;

    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const isMessagePage = location.pathname.includes('messages');

    const isAdmin = effectiveUser?.role === 'admin';
    const isCandidate = effectiveUser?.role === 'candidate';
    const isRecruiter = effectiveUser?.role === 'recruiter';

    const dashboardLink =
        isAdmin
            ? "/admin/dashboard"
            : isRecruiter
                ? "/recruiter/dashboard"
                : "/candidate/dashboard";