import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminDashboard from './pages/AdminDashboard';
import TechnicienDashboard from './pages/TechnicienDashboard';
import UserManagement from './pages/UserManagement';
import InterventionManagement from './pages/InterventionManagement';
import ProfilePage from './pages/ProfilePage';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/technicien'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/utilisateurs"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/interventions"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <InterventionManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technicien"
            element={
              <ProtectedRoute allowedRole="TECHNICIEN">
                <TechnicienDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
