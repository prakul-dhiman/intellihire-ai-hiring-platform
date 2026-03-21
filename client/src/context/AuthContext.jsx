import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// ── Helpers ──────────────────────────────────────────────────────────────
const saveSession = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    // Always persist the token from the response body — this is the
    // Bearer-token fallback that works when cookies are stripped by the
    // Vercel edge proxy in cross-origin rewrites (production).
    if (token) localStorage.setItem('token', token);
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
            // Just logged in/registered — session is already confirmed
            if (justAuthed.current) {
                setSessionChecked(true);
                return;
            }

            // No stored user → definitely logged out
            if (!localStorage.getItem('user')) {
                setSessionChecked(true);
                return;
            }

            // Returning visitor: re-confirm session is still valid on server
            try {
                const res = await api.get('/auth/me');
                const freshUser = res.data?.data?.user;
                if (freshUser) {
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                }
            } catch (err) {
                if (err.response?.status === 401) {
                    setUser(null);
                    clearSession();
                }
                // Network error → keep stale localStorage (offline tolerance)
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
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
