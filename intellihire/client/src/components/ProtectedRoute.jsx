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
    if (role && user?.role !== role) {
        // Redirct to unauthorized page or back to dashboard
        return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/candidate/dashboard'} replace />;
    }

    return children;
}

