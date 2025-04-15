import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Layout from './components/Layout';
import { LoadingScreen } from './components/LoadingScreen';
import { AuthProvider } from './contexts/AuthContext';
import AuthGuard from './components/Auth/AuthGuard';
import Login from './components/Auth/Login';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Market = React.lazy(() => import('./pages/Market'));
const Misc = React.lazy(() => import('./pages/Misc'));
const Bag = React.lazy(() => import('./pages/Bag'));
const Profile = React.lazy(() => import('./pages/Profile'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (replaces cacheTime)
      retry: 2,
    },
  },
});

// TON Connect manifest URL
const manifestUrl = 'https://markmon08.github.io/gemspider/tonconnect-manifest.json';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ErrorBoundary>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <Suspense fallback={<LoadingScreen onLoadingComplete={() => setIsLoading(false)} />}>
                <Routes>
                  {/* Login page - accessible even when not authenticated */}
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
                          <Route path="/" element={
                            <Suspense fallback={<LoadingScreen />}>
                              <Dashboard />
                            </Suspense>
                          } />
                          <Route path="/market" element={
                            <Suspense fallback={<LoadingScreen />}>
                              <Market />
                            </Suspense>
                          } />
                          <Route path="/misc" element={
                            <Suspense fallback={<LoadingScreen />}>
                              <Misc />
                            </Suspense>
                          } />
                          <Route path="/bag" element={
                            <Suspense fallback={<LoadingScreen />}>
                              <Bag />
                            </Suspense>
                          } />
                          <Route path="/profile" element={
                            <Suspense fallback={<LoadingScreen />}>
                              <Profile />
                            </Suspense>
                          } />
                        </Routes>
                      </Layout>
                    </AuthGuard>
                  } />
                </Routes>
              </Suspense>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}

export default App;