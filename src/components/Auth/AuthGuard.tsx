import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import Login from './Login';
import { LoadingScreen } from '../LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean; // If true, user must be authenticated to access
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading, playerProfile, isPlayerProfileLoading } = useAuthContext();
  const location = useLocation();

  // Show loading screen while checking authentication or loading profile
  if (isLoading || isPlayerProfileLoading) {
    return <LoadingScreen />;
  }

  // If authentication is required and user is not authenticated, show login
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md">
          <Login 
            onSuccess={() => {
              // No need to navigate as auth state change will re-render this component
            }} 
          />
        </div>
      </div>
    );
  }

  // If user is authenticated and has all required data, show the protected content
  return <>{children}</>;
};

export default AuthGuard; 