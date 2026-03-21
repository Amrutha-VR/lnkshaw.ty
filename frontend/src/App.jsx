import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import PublicAnalyticsPage from './pages/PublicAnalyticsPage.jsx';
import OAuthCallbackPage from './pages/OAuthCallbackPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ExpiredPage from './pages/ExpiredPage.jsx';

// Layout
import DashboardLayout from './components/dashboard/DashboardLayout.jsx';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public-only route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Minimal loading screen
const LoadingScreen = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gold-pink animate-pulse-gold" />
      <p className="text-charcoal/50 font-body text-sm animate-pulse">Loading LinkSnap…</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route path="/analytics/public/:shortCode" element={<PublicAnalyticsPage />} />
      <Route path="/not-found" element={<NotFoundPage />} />
      <Route path="/expired" element={<ExpiredPage />} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="analytics/:shortCode" element={<AnalyticsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
