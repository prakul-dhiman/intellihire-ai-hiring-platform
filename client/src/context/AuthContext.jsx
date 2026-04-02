import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// ── Helpers ──────────────────────────────────────────────────────────────
const saveSession = (userData, token) => {
    console.log('[AuthContext] saving session', { userId: userData?.id, hasToken: !!token });
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
        localStorage.setItem('token', token);
    } else {
        // Prevent stale token from older sessions/deploys causing 401 loops.
        localStorage.removeItem('token');
    }
};

const clearSession = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
};

// ─────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            return saved ? JSON.parse(saved) : null;
        } catch {
            clearSession();
            return null;
        }
    });

    const [loading, setLoading] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);

    // Prevent mount-time verifySession from running immediately after
    // a fresh login/register (no need for second round-trip).
    const justAuthed = useRef(false);

    // ── Mount: verify returning user's session ────────────────────────
    useEffect(() => {
        const check = async () => {
            console.log('[AuthContext] mount: checking session...', { justAuthed: justAuthed.current, hasStoredUser: !!localStorage.getItem('user') });
            if (justAuthed.current) {
                setSessionChecked(true);
                return;
            }

            if (!localStorage.getItem('user')) {
                setSessionChecked(true);
                return;
            }

            try {
                const res = await api.get('/auth/me');
                console.log('[AuthContext] mount: session valid', res.data?.data?.user?.email);
                const freshUser = res.data?.data?.user;
                if (freshUser) {
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                }
            } catch (err) {
                console.warn('[AuthContext] mount: session invalid/failed', err.response?.status);
                if (err.response?.status === 401) {
                    setUser(null);
                    clearSession();
                }
            } finally {
                setSessionChecked(true);
            }
        };

        check();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Login ─────────────────────────────────────────────────────────
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user: userData, token } = res.data.data;

            // CRITICAL: persist session BEFORE updating React state so the
            // route guard reads localStorage correctly during the re-render.
            justAuthed.current = true;
            saveSession(userData, token);   // persist token + user first
            setUser(userData);              // then trigger re-render
            setSessionChecked(true);

            return { success: true, user: userData };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    // ── Register ──────────────────────────────────────────────────────
    const register = async (name, email, password, role) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/register', { name, email, password, role });

            const { user: userData, token } = res.data?.data || {};
            if (!userData) throw new Error('Invalid response from server');

            // CRITICAL: Set justAuthed BEFORE setUser so the mount-effect
            // guard fires correctly if the component re-mounts during navigation.
            // Also persist session BEFORE updating React state so the route
            // guard reads localStorage correctly during the re-render.
            justAuthed.current = true;
            saveSession(userData, token);   // persist token + user first
            setUser(userData);              // then trigger re-render
            setSessionChecked(true);

            return { success: true, user: userData };
        } catch (err) {
            return {
                success: false,
                message: err.response?.data?.message || err.message || 'Registration failed',
            };
        } finally {
            setLoading(false);
        }
    };

    // ── Logout ────────────────────────────────────────────────────────
    const logout = async () => {
        justAuthed.current = false;
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error', err);
        }
        setUser(null);
        setSessionChecked(true);
        clearSession();
    };

    const value = {
        user,
        loading,
        sessionChecked,
        login,
        register,
        logout,
        isAuthenticated: !!user || !!localStorage.getItem('user'),
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
