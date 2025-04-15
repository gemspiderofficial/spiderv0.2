import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Login from './Login';
import { LoadingScreen } from '../LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading, playerProfile, isPlayerProfileLoading } = useAuthContext();
  const location = useLocation();

  // Only show loading screen during initial authentication check
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If authentication is required and user is not authenticated, show login
  if (requireAuth && !isAuthenticated) {
    // Store the attempted URL for redirection after login
    const currentPath = location.pathname + location.search;
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md">
          <Login 
            onSuccess={() => {
              // The auth state change will trigger a re-render
              console.log('Login successful, continuing to:', currentPath);
            }} 
          />
        </div>
      </div>
    );
  }

  // Show loading screen while fetching player profile
  if (requireAuth && isAuthenticated && isPlayerProfileLoading) {
    return <LoadingScreen />;
  }

  // If we require auth and have no player profile after loading, something went wrong
  if (requireAuth && isAuthenticated && !isPlayerProfileLoading && !playerProfile) {
    console.error('No player profile found after authentication');
    // Redirect to login and force a fresh authentication
    return <Navigate to="/login" replace />;
  }

  // User is authenticated (or auth not required) and we have the profile if needed
  return <>{children}</>;
};

export default AuthGuard;