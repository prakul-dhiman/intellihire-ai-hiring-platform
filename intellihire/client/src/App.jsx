import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import ChatbotWidget from './components/ChatbotWidget';

/**
 * Read the effective user: React context first, then localStorage fallback.
 * This covers the ~1 render-cycle gap right after login/register where
 * setUser() hasn't been committed yet but localStorage is already written.
 */
function getEffectiveUser(ctxUser) {
    if (ctxUser) return ctxUser;
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

// Public Pages
const Landing = React.lazy(() => import('./pages/Landing'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));

// Static / Marketing Pages
const FeaturesPage = React.lazy(() => import('./pages/static/FeaturesPage'));
const AboutPage = React.lazy(() => import('./pages/static/AboutPage'));
const FeedbackPage = React.lazy(() => import('./pages/static/FeedbackPage'));
const ChangelogPage = React.lazy(() => import('./pages/static/ChangelogPage'));
const RoadmapPage = React.lazy(() => import('./pages/static/RoadmapPage'));
const PrivacyPage = React.lazy(() => import('./pages/static/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/static/TermsPage'));
const SecurityPage = React.lazy(() => import('./pages/static/SecurityPage'));
const GDPRPage = React.lazy(() => import('./pages/static/GDPRPage'));

// Candidate Pages
const CandidateDashboard = React.lazy(() => import('./pages/candidate/CandidateDashboard'));
const JobDiscovery = React.lazy(() => import('./pages/candidate/JobDiscovery'));
const JobDetails = React.lazy(() => import('./pages/candidate/JobDetails'));
const ResumeForm = React.lazy(() => import('./pages/candidate/ResumeForm'));
const CodeHub = React.lazy(() => import('./pages/candidate/CodeHub'));
const CodeEditor = React.lazy(() => import('./pages/candidate/CodeEditor'));
const Profile = React.lazy(() => import('./pages/candidate/Profile'));
const Interview = React.lazy(() => import('./pages/candidate/Interview'));
const LiveRoom = React.lazy(() => import('./pages/candidate/LiveRoom'));
const CandidateSettings = React.lazy(() => import('./pages/candidate/Settings'));

// Recruiter Pages
const RecruiterDashboard = React.lazy(() => import('./pages/recruiter/RecruiterDashboard'));
const CreateJob = React.lazy(() => import('./pages/recruiter/CreateJob'));
const ManageJob = React.lazy(() => import('./pages/recruiter/ManageJob'));
const RecruiterRoom = React.lazy(() => import('./pages/recruiter/RecruiterRoom'));

// Shared Pages
const Messages = React.lazy(() => import('./pages/Messages'));

// Admin Pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const CandidateDetail = React.lazy(() => import('./pages/admin/CandidateDetail'));
const Leaderboard = React.lazy(() => import('./pages/admin/Leaderboard'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics'));
const BulkAnalyzer = React.lazy(() => import('./pages/admin/BulkAnalyzer'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));

// Wraps admin pages with the sidebar layout
function AdminRoute({ children }) {
  return (
    <ProtectedRoute role="admin">
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}

import MainLayout from './components/MainLayout';

export default function App() {
  const { isAuthenticated, user, sessionChecked } = useAuth();
  // Effective auth accounts for the post-login state transition
  const effectiveUser = getEffectiveUser(user);
  const isAuth = isAuthenticated || !!effectiveUser;

  if (!sessionChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#07090f]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 animate-spin" />
          <span className="text-white/40 text-xs font-medium tracking-widest uppercase">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        }>
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

            <Route path="/login" element={isAuth ? <Navigate to={effectiveUser?.role === 'admin' ? '/admin/dashboard' : effectiveUser?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace /> : <Login />} />
            <Route path="/register" element={isAuth ? <Navigate to={effectiveUser?.role === 'admin' ? '/admin/dashboard' : effectiveUser?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace /> : <Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Candidate Routes */}
            <Route path="/candidate/dashboard" element={<ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/candidate/resume" element={<ProtectedRoute role="candidate"><ResumeForm /></ProtectedRoute>} />
            <Route path="/candidate/code" element={<ProtectedRoute role="candidate"><CodeHub /></ProtectedRoute>} />
            <Route path="/candidate/code/editor" element={<ProtectedRoute role="candidate"><CodeEditor /></ProtectedRoute>} />
            <Route path="/candidate/code/editor/:id" element={<ProtectedRoute role="candidate"><CodeEditor /></ProtectedRoute>} />
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

            {/* Catch-all: Redirect to dashboard if logged in, otherwise landing */}
            <Route path="*" element={isAuth ? <Navigate to={effectiveUser?.role === 'admin' ? '/admin/dashboard' : effectiveUser?.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'} replace /> : <Navigate to="/" replace />} />
          </Routes>
        </Suspense>
    </MainLayout>
  );
}

