import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import ChatbotWidget from './ChatbotWidget';

/**
 * PublicLayout
 * Used for marketing and authentication pages.
 * Displays the PUBLIC version of the Navbar.
 */
export default function PublicLayout() {
    const { user } = useAuth();
    const navbarKey =
        user?.id != null ? String(user.id) : user?.email ? `u:${user.email}` : 'guest';

    return (
        <div className="min-h-screen flex flex-col bg-[#07090f] text-slate-100">
            {/* The Navbar component handles its own public/auth internal logic, 
                but wrapping here for structural clarity. */}
            <Navbar key={navbarKey} />
            
            <main className="flex-1">
                <Outlet />
            </main>

            <ChatbotWidget />
        </div>
    );
}
