import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  registerUser,
  signInUser,
  signInWithGoogle,
  signInAnon,
  logoutUser,
  resetPassword,
  updateUserEmail,
  updateUserPassword,
  onAuthChange
} from '../services/authService';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setAuthState({
        user,
        loading: false,
        error: null,
      });
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await registerUser(email, password);
      setAuthState({ user, loading: false, error: null });
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const credential = await signInUser(email, password);
      setAuthState({ user: credential.user, loading: false, error: null });
      return credential.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const credential = await signInWithGoogle();
      setAuthState({ user: credential.user, loading: false, error: null });
      return credential.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const loginAnonymously = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const credential = await signInAnon();
      setAuthState({ user: credential.user, loading: false, error: null });
      return credential.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setAuthState({ user: null, loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await resetPassword(email);
      setAuthState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const changeEmail = async (newEmail: string) => {
    if (!authState.user) {
      throw new Error('No user is logged in');
    }

    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await updateUserEmail(authState.user, newEmail);
      setAuthState((prev) => ({ 
        ...prev, 
        user: { ...prev.user, email: newEmail } as User, 
        loading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!authState.user) {
      throw new Error('No user is logged in');
    }

    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      await updateUserPassword(authState.user, newPassword);
      setAuthState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signup,
    login,
    loginWithGoogle,
    loginAnonymously,
    logout,
    forgotPassword,
    changeEmail,
    changePassword,
  };
}; 