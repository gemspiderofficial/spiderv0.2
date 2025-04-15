import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { LoadingScreen } from '../LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { 
    isAuthenticated,
    isLoading,
    playerProfile,
    isPlayerProfileLoading,
    playerProfileError
  } = useAuthContext();
  const location = useLocation();

  // Show loading screen during initial auth check or when fetching player profile
  if (isLoading || (isAuthenticated && isPlayerProfileLoading)) {
    return <LoadingScreen />;
  }

  // Handle public routes (e.g., login page)
  if (!requireAuth) {
    return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
  }

  // Handle protected routes
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle player profile error or missing profile
  if (playerProfileError || (!isPlayerProfileLoading && !playerProfile)) {
    console.error('Player profile error or missing:', playerProfileError);
    return <Navigate to="/login" replace />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
};

export default AuthGuard;