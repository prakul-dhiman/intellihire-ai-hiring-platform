import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { normalizeClientUser } from '../utils/normalizeClientUser';

const AuthContext = createContext(null);

function isAbortError(err) {
    return err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError';
}

// ── Helpers ──────────────────────────────────────────────────────────────
const saveSession = (userData, token) => {
    console.log('[AuthContext] saving session', { userId: userData?.id, hasToken: !!token });
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
        localStorage.setItem('token', token);
    } else {
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
            return saved ? normalizeClientUser(JSON.parse(saved)) : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);
    const justAuthed = useRef(false);
    /** Bumps on login/register/logout so stale in-flight `/auth/me` cannot wipe a fresh session */
    const authEpoch = useRef(0);

    // ── Sync Auth across tabs ──────────────────────────────────────────
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'user') {
                let newUser = null;
                try {
                    newUser = e.newValue ? normalizeClientUser(JSON.parse(e.newValue)) : null;
                } catch {
                    newUser = null;
                }
                setUser(newUser);
            }
            if (e.key === 'token' && !e.newValue) {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // ── Mount: verify returning user's session ────────────────────────
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        const epochAtStart = authEpoch.current;

        const check = async () => {
            if (justAuthed.current) {
                if (!cancelled) setSessionChecked(true);
                return;
            }

            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                if (!cancelled && authEpoch.current === epochAtStart) {
                    setUser(null);
                }
                if (!cancelled) setSessionChecked(true);
                return;
            }

            try {
                const res = await api.get('/auth/me', { signal: controller.signal });
                if (cancelled) return;
                if (authEpoch.current !== epochAtStart) return;

                const freshUser = normalizeClientUser(res.data?.data?.user);
                if (freshUser) {
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                } else {
                    throw new Error('No user returned');
                }
            } catch (err) {
                if (cancelled || isAbortError(err)) return;
                if (authEpoch.current !== epochAtStart) return;

                console.warn('[AuthContext] session verify failed:', err.response?.status || err.message);
                setUser(null);
                clearSession();
            } finally {
                if (!cancelled) setSessionChecked(true);
            }
        };

        check();
        return () => {
            cancelled = true;
            controller.abort();
        };
    }, []);

    // ── Login ─────────────────────────────────────────────────────────
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user: userData, token } = res.data.data;
            const normalized = normalizeClientUser(userData);
            if (!normalized) throw new Error('Invalid user payload');

            justAuthed.current = true;
            authEpoch.current += 1;
            saveSession(normalized, token);
            setUser(normalized);
            setSessionChecked(true);

            return { success: true, user: normalized };
        } catch (err) {
            return { 
                success: false, 
                message: err.response?.data?.message || 'Login failed' 
            };
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
            const normalized = normalizeClientUser(userData);
            if (!normalized) throw new Error('Invalid user payload');

            justAuthed.current = true;
            authEpoch.current += 1;
            saveSession(normalized, token);
            setUser(normalized);
            setSessionChecked(true);

            return { success: true, user: normalized };
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
        authEpoch.current += 1;
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error', err);
        }
        setUser(null);
        clearSession();
        setSessionChecked(true);
    };

    const contextValue = {
        user,
        loading,
        sessionChecked,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

