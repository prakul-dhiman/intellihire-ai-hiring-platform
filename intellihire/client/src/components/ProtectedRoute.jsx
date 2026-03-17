import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// BUG-06 FIX: Each role now redirects to its correct dashboard
const ROLE_DASHBOARDS = {
    admin: '/admin/dashboard',
    recruiter: '/recruiter/dashboard',
    candidate: '/candidate/dashboard',
};

export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user, sessionChecked } = useAuth();

    // Wait for session verification before making auth decisions (BUG-05 support)
    if (!sessionChecked) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Admins can access everything
    if (user?.role === 'admin') return children;

    // Role check: if a specific role is required, verify user has it
    if (role && user?.role !== role) {
        const fallback = ROLE_DASHBOARDS[user?.role] || '/login';
        return <Navigate to={fallback} replace />;
    }

    return children;
}

