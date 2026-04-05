import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ChatbotWidget from './ChatbotWidget';

/**
 * DashboardLayout
 * Used for all authenticated routes (Candidate/Recruiter).
 * Ensures Navbar is always present and properly padded.
 */
export default function DashboardLayout() {
    const location = useLocation();

    // FULL-SCREEN routes (coding editor, live interviews) skip the navbar and padding
    const isFullscreenRoute = 
        location.pathname === '/candidate/live-room' || 
        location.pathname === '/recruiter/room' ||
        location.pathname.includes('/candidate/code/editor');

    return (
        <div className="min-h-screen flex flex-col bg-[#07090f] text-slate-100">
            {!isFullscreenRoute && <Navbar />}

            <main 
                className={`flex-1 transition-all duration-300 ${!isFullscreenRoute ? 'pt-16' : ''}`}
            >
                <Outlet />
            </main>

            {!isFullscreenRoute && <ChatbotWidget />}
        </div>
    );
}
