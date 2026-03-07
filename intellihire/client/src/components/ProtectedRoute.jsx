import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Admins can access everything
    if (user?.role === 'admin') return children;

    // Role check: if a specific role is required, verify user has it
    // 'recruiter' role falls back to 'admin' if not explicitly set
    if (role && user?.role !== role) {
        // Allow any authenticated user to access 'recruiter' routes
        // (recruiters may be registered as regular users in dev)
        if (role === 'recruiter') return children;
        return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />;
    }

    return children;
}

