// src/components/router/ProtectedRoute.tsx
import { useAuthStore } from '../../store/authStore';
import { Navigate, Outlet } from 'react-router-dom';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ProtectedRoute = () => {
  const { token, isInitialized } = useAuthStore();

  if (!isInitialized) {
    // Wait for store to be initialized from localStorage
    return <LoadingSpinner />;
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};