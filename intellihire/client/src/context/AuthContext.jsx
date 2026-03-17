import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // SEC-07 FIX: guard JSON.parse against corrupted localStorage
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            localStorage.removeItem('user');
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    // PERF FIX: Start as true (optimistic) — trust localStorage immediately so pages
    // load without waiting for a network call. Background verification quietly clears
    // stale state if the server cookie has actually expired.
    const [sessionChecked, setSessionChecked] = useState(true);

    useEffect(() => {
        // Only verify if we think the user is logged in
        if (!user) return;
        const verifySession = async () => {
            try {
                await api.get('/auth/me');
            } catch (err) {
                // Cookie is invalid/expired — silently clear stale localStorage
                if (err.response?.status === 401) {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            }
        };
        // Small delay so the UI renders first, then we verify in the background
        const timer = setTimeout(verifySession, 500);
        return () => clearTimeout(timer);
    }, []); // run once on mount only

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user: userData } = res.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true, user: userData };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, role) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, role });
            const { user: userData } = res.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true, user: userData };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Registration failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error', err);
        }
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // cleanup old code
    };

    const value = { user, loading, sessionChecked, login, register, logout, isAuthenticated: !!user };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
