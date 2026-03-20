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

    const [sessionChecked, setSessionChecked] = useState(false);

    useEffect(() => {
        const verifySession = async () => {
            // No saved user in localStorage? Mark session as checked immediately.
            if (!localStorage.getItem('user')) {
                setSessionChecked(true);
                return;
            }

            console.log("AuthCheck: Verifying background session...");
            try {
                // If this fails (401), our interceptor will handle user state clearing,
                // but we also explicitly check here as a fallback.
                const res = await api.get('/auth/me');
                if (res.data?.data?.user) {
                    const freshUser = res.data.data.user;
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                }
            } catch (err) {
                console.error("AuthCheck: Stale or invalid session session.", err.message);
                // Clear user if we get a definitive 401
                if (err.response?.status === 401) {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } finally {
                setSessionChecked(true);
            }
        };

        verifySession();
    }, []); // Only on mount

    const login = async (email, password) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { email, password });
            const { user: userData } = res.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setSessionChecked(true); // Ensure session is marked as checked
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
            
            if (!res.data || !res.data.data || !res.data.data.user) {
                throw new Error('Invalid response from server');
            }

            const { user: userData } = res.data.data;
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            setSessionChecked(true); // Ensure session is marked as checked
            return { success: true, user: userData };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || err.message || 'Registration failed' };
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
