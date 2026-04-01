import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// BUG-06 FIX: Each role now redirects to its correct dashboard
const ROLE_DASHBOARDS = {
    admin: '/admin/dashboard',
    recruiter: '/recruiter/dashboard',
    candidate: '/candidate/dashboard',
};

/**
 * Reads user from React context first; falls back to localStorage
 * for the brief render cycle AFTER login/register where React state
 * (setUser) hasn't been committed yet but localStorage is already written.
 * This prevents the spurious /login redirect that bounces users back to /register.
 */
function getEffectiveUser(ctxUser) {
    if (ctxUser) return ctxUser;
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user, sessionChecked } = useAuth();

    // While session check is in flight, render nothing (App.jsx shows spinner)
    if (!sessionChecked) return null;

    // Use context user; fallback to localStorage for post-auth transition
    const effectiveUser = getEffectiveUser(user);
    const isAuth = isAuthenticated || !!effectiveUser;

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    // Admins can access every protected route
    if (effectiveUser?.role === 'admin') return children;

    // Role check: redirect to the user's own dashboard if wrong role
    if (role && effectiveUser?.role !== role) {
        const fallback = ROLE_DASHBOARDS[effectiveUser?.role] || '/login';
        return <Navigate to={fallback} replace />;
    }

    return children;
}

