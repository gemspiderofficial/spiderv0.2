import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';
import AuthGuard from './components/Auth/AuthGuard';
import Login from './components/Auth/Login';
import Layout from './components/Layout';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Market = React.lazy(() => import('./pages/Market'));
const Misc = React.lazy(() => import('./pages/Misc'));
const Bag = React.lazy(() => import('./pages/Bag'));
const Profile = React.lazy(() => import('./pages/Profile'));

// Make sure this matches your actual manifest URL
const manifestUrl = process.env.VITE_TON_MANIFEST_URL || 'https://gemspider.io/tonconnect-manifest.json';

function App() {
  return (
    <ErrorBoundary>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public routes - accessible without authentication */}
                <Route path="/login" element={
                  <AuthGuard requireAuth={false}>
                    <div className="flex items-center justify-center min-h-screen bg-gray-100">
                      <div className="w-full max-w-md">
                        <Login />
                      </div>
                    </div>
                  </AuthGuard>
                } />
                
                {/* Protected routes - requires authentication */}
                <Route path="/*" element={
                  <AuthGuard>
                    <Layout>
                      <Routes>
                        <Route index element={
                          <Suspense fallback={<LoadingScreen />}>
                            <Dashboard />
                          </Suspense>
                        } />
                        <Route path="market" element={
                          <Suspense fallback={<LoadingScreen />}>
                            <Market />
                          </Suspense>
                        } />
                        <Route path="misc" element={
                          <Suspense fallback={<LoadingScreen />}>
                            <Misc />
                          </Suspense>
                        } />
                        <Route path="bag" element={
                          <Suspense fallback={<LoadingScreen />}>
                            <Bag />
                          </Suspense>
                        } />
                        <Route path="profile" element={
                          <Suspense fallback={<LoadingScreen />}>
                            <Profile />
                          </Suspense>
                        } />
                      </Routes>
                    </Layout>
                  </AuthGuard>
                } />
              </Routes>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}

export default App;