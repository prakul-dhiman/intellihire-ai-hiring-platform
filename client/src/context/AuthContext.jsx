import { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

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
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    const [loading, setLoading] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);
    const justAuthed = useRef(false);

    // ── Sync Auth across tabs ──────────────────────────────────────────
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'user') {
                const newUser = e.newValue ? JSON.parse(e.newValue) : null;
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
        const check = async () => {
            if (justAuthed.current) {
                setSessionChecked(true);
                return;
            }

            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                setUser(null); // Ensure state is cleared if storage is empty
                setSessionChecked(true);
                return;
            }

            try {
                // If we have a stored user, verify it with the server
                const res = await api.get('/auth/me');
                const freshUser = res.data?.data?.user;
                if (freshUser) {
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                } else {
                    throw new Error('No user returned');
                }
            } catch (err) {
                console.warn('[AuthContext] session verify failed:', err.response?.status || err.message);
                setUser(null);
                clearSession();
            } finally {
                setSessionChecked(true);
            }
        };

        check();
    }, []);

    // ── Login ─────────────────────────────────────────────────────────
    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user: userData, token } = res.data.data;

            justAuthed.current = true;
            saveSession(userData, token);
            setUser(userData);
            setSessionChecked(true);

            return { success: true, user: userData };
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

            justAuthed.current = true;
            saveSession(userData, token);
            setUser(userData);
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
        clearSession();
        setSessionChecked(true);
    };

    // Derived values should be memoized to prevent unnecessary re-renders,
    // but MUST depend on the `user` state to ensure the Navbar re-renders.
    const contextValue = useMemo(() => ({
        user,
        loading,
        sessionChecked,
        login,
        register,
        logout,
        isAuthenticated: !!user, // REACTIVE: depends on the state update
    }), [user, loading, sessionChecked]);

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

