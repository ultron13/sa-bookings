import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { AccommodationDetailPage } from './pages/AccommodationDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingDetailPage } from './pages/BookingDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: UserRole[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-sa-green border-t-transparent rounded-full mx-auto" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/accommodations" element={<SearchPage />} />
        <Route path="/accommodations/:id" element={<AccommodationDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
