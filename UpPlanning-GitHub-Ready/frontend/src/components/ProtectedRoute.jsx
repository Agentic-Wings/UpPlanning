import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Also check session storage directly to prevent flash of login screen during strict mode re-renders
  const hasLocalAuth = localStorage.getItem('up_auth') === 'true' || sessionStorage.getItem('up_auth') === 'true';

  if (!isAuthenticated && !hasLocalAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
