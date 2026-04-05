import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import ChatbotWidget from './ChatbotWidget';

export default function MainLayout({ children }) {
    const location = useLocation();
    
    // Config: Routes where the navbar/padding should be DIFFERENT
    const isLanding = location.pathname === '/';
    const isAdminRoute = location.pathname.startsWith('/admin');
    const isCandidateRoute = location.pathname.startsWith('/candidate');
    const isRecruiterRoute = location.pathname.startsWith('/recruiter');
    
    const { isAuthenticated, sessionChecked } = useAuth();
    
    // FULL-SCREEN routes (coding editor, live interviews)
    const isFullscreenRoute = 
        location.pathname === '/candidate/live-room' || 
        location.pathname === '/recruiter/room' ||
        location.pathname.includes('/candidate/code/editor');

    // UI Decisions
    // Show Navbar if:
    // 1. Not an admin route (admins have their own sidebar)
    // 2. Not a fullscreen route (IDE/Interview)
    const showNavbar = !isAdminRoute && !isFullscreenRoute;
    const showChatbot = !isAdminRoute && !isFullscreenRoute;
    
    // Dynamic Padding (Standardizes across all dashboard pages)
    const isDashboardPage = isCandidateRoute || isRecruiterRoute;
    const paddingTop = (showNavbar && !isLanding) ? '64px' : '0px';


    return (
        <div className="min-h-screen flex flex-col bg-[#07090f] text-slate-100" style={{ overflowX: 'hidden' }}>
            {/* Navbar */}
            {showNavbar && <Navbar />}

            {/* Main Content Area */}
            <main 
                className="flex-1 transition-all duration-300"
                style={{ paddingTop }}
            >
                {children}
            </main>

            {/* Floating Widgets */}
            {showChatbot && <ChatbotWidget />}
        </div>
    );
}
