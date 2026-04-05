import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ChatbotWidget from './ChatbotWidget';

/**
 * PublicLayout
 * Used for marketing and authentication pages.
 * Displays the PUBLIC version of the Navbar.
 */
export default function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-[#07090f] text-slate-100">
            {/* The Navbar component handles its own public/auth internal logic, 
                but wrapping here for structural clarity. */}
            <Navbar />
            
            <main className="flex-1">
                <Outlet />
            </main>

            <ChatbotWidget />
        </div>
    );
}
