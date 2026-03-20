import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Initialize from localStorage — provides instant UI on return visits
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
    const [sessionChecked, setSessionChecked] = useState(false);

    // ── Internal helper: verify session via HTTP-only cookie ──────────────
    const verifySession = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data?.data?.user) {
                const freshUser = res.data.data.user;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
                return freshUser;
            }
        } catch (err) {
            // 401 = stale/expired session — clear everything
            if (err.response?.status === 401) {
                setUser(null);
                localStorage.removeItem('user');
            }
            // Network errors — keep stale localStorage user (offline tolerance)
        }
        return null;
    }, []);

    // ── On mount: verify the cookie against the server ────────────────────
    useEffect(() => {
        const check = async () => {
            // Only call the network if we have cached user data worth verifying.
            // If localStorage is empty the user is definitely logged out.
            if (localStorage.getItem('user')) {
                await verifySession();
            }
            setSessionChecked(true);
        };
        check();
    }, [verifySession]);

    // ── Login ─────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user: userData } = res.data.data;

            // Immediately set state from the login response so the UI reacts fast
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setSessionChecked(true);

            // CROSS-DEVICE FIX: Do a server confirm so the cookie is proven valid
            // BEFORE the caller navigates. Without this, ProtectedRoute can see
            // null user on mobile/LAN devices during the async state update window.
            const confirmed = await verifySession();
            return { success: true, user: confirmed || userData };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    // ── Register ──────────────────────────────────────────────────────────
    const register = async (name, email, password, role) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, role });

            if (!res.data?.data?.user) {
                throw new Error('Invalid response from server');
            }

            const { user: userData } = res.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setSessionChecked(true);

            // Same cross-device confirm as login
            const confirmed = await verifySession();
            return { success: true, user: confirmed || userData };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || err.message || 'Registration failed' };
        } finally {
            setLoading(false);
        }
    };

    // ── Logout ────────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error', err);
        }
        setUser(null);
        setSessionChecked(true);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    const value = {
        user,
        loading,
        sessionChecked,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
