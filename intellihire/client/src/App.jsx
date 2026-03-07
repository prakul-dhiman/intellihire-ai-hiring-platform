import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import ChatbotWidget from './components/ChatbotWidget';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Static / Marketing Pages
import FeaturesPage from './pages/static/FeaturesPage';
import AboutPage from './pages/static/AboutPage';
import FeedbackPage from './pages/static/FeedbackPage';
import ChangelogPage from './pages/static/ChangelogPage';
import RoadmapPage from './pages/static/RoadmapPage';
import PrivacyPage from './pages/static/PrivacyPage';
import TermsPage from './pages/static/TermsPage';
import SecurityPage from './pages/static/SecurityPage';
import GDPRPage from './pages/static/GDPRPage';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import JobDiscovery from './pages/candidate/JobDiscovery';
import JobDetails from './pages/candidate/JobDetails';
import ResumeForm from './pages/candidate/ResumeForm';
import CodeHub from './pages/candidate/CodeHub';
import CodeEditor from './pages/candidate/CodeEditor';
import Profile from './pages/candidate/Profile';
import Interview from './pages/candidate/Interview';
import LiveRoom from './pages/candidate/LiveRoom';
import CandidateSettings from './pages/candidate/Settings';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CreateJob from './pages/recruiter/CreateJob';
import ManageJob from './pages/recruiter/ManageJob';
import RecruiterRoom from './pages/recruiter/RecruiterRoom';

// Shared Pages
import Messages from './pages/Messages';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CandidateDetail from './pages/admin/CandidateDetail';
import Leaderboard from './pages/admin/Leaderboard';
import Analytics from './pages/admin/Analytics';
import BulkAnalyzer from './pages/admin/BulkAnalyzer';
import AdminSettings from './pages/admin/Settings';

// Wraps admin pages with the sidebar layout
function AdminRoute({ children }) {
  return (
    <ProtectedRoute role="admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCandidateRoute = location.pathname.startsWith('/candidate');
  const isRecruiterRoute = location.pathname.startsWith('/recruiter');

  // Hide navbar on full-screen interview/live rooms
  const isFullscreenRoute = location.pathname === '/candidate/live-room' || location.pathname === '/recruiter/room';

  return (
    <div className="min-h-screen flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* Navbar: hidden on admin and full-screen room routes */}
      {!isAdminRoute && !isFullscreenRoute && <Navbar />}

      <main className="flex-1" style={{ paddingTop: ((isCandidateRoute || isRecruiterRoute) && !isFullscreenRoute) ? '68px' : '0px' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />

          {/* Static / Marketing Routes */}
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/gdpr" element={<GDPRPage />} />

          <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace /> : <Register />} />

          {/* Candidate Routes */}
          <Route path="/candidate/dashboard" element={<ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/resume" element={<ProtectedRoute role="candidate"><ResumeForm /></ProtectedRoute>} />
          <Route path="/candidate/code" element={<ProtectedRoute role="candidate"><CodeHub /></ProtectedRoute>} />
          <Route path="/candidate/code/editor" element={<ProtectedRoute role="candidate"><CodeEditor /></ProtectedRoute>} />
          <Route path="/candidate/interview" element={<ProtectedRoute role="candidate"><Interview /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute role="candidate"><Profile /></ProtectedRoute>} />
          <Route path="/candidate/live-room" element={<ProtectedRoute role="candidate"><LiveRoom /></ProtectedRoute>} />
          <Route path="/candidate/settings" element={<ProtectedRoute role="candidate"><CandidateSettings /></ProtectedRoute>} />
          <Route path="/candidate/jobs" element={<ProtectedRoute role="candidate"><JobDiscovery /></ProtectedRoute>} />
          <Route path="/candidate/jobs/:id" element={<ProtectedRoute role="candidate"><JobDetails /></ProtectedRoute>} />
          <Route path="/candidate/messages" element={<ProtectedRoute role="candidate"><Messages /></ProtectedRoute>} />

          {/* Recruiter Routes — accessible by recruiter or admin */}
          <Route path="/recruiter/dashboard" element={<ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/recruiter/jobs/create" element={<ProtectedRoute role="recruiter"><CreateJob /></ProtectedRoute>} />
          <Route path="/recruiter/jobs/:id" element={<ProtectedRoute role="recruiter"><ManageJob /></ProtectedRoute>} />
          <Route path="/recruiter/room" element={<ProtectedRoute role="recruiter"><RecruiterRoom /></ProtectedRoute>} />
          <Route path="/recruiter/messages" element={<ProtectedRoute role="recruiter"><Messages /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/candidate/:id" element={<AdminRoute><CandidateDetail /></AdminRoute>} />
          <Route path="/admin/leaderboard" element={<AdminRoute><Leaderboard /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="/admin/bulk-screening" element={<AdminRoute><BulkAnalyzer /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating chatbot — hidden on admin and full-screen routes */}
      {!isAdminRoute && !isFullscreenRoute && <ChatbotWidget />}
    </div>
  );
}

