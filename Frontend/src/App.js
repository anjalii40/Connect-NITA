import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';

// Dashboard Pages
import Dashboard from './pages/Dashboard/Dashboard';
import ProfilePage from './pages/Profile/ProfilePage';
import AlumniDirectoryPage from './pages/Directory/AlumniDirectoryPage';
import FeedPage from './pages/Feed/FeedPage';
import MessagesPage from './pages/Messages/MessagesPage';
import ReferralsPage from './pages/Referrals/ReferralsPage';
import JobsPage from './pages/Jobs/JobsPage';
import EventsPage from './pages/Events/EventsPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile/:id" element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/alumni-directory" element={
                    <ProtectedRoute>
                      <Layout>
                        <AlumniDirectoryPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/feed" element={
                    <ProtectedRoute>
                      <Layout>
                        <FeedPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <Layout>
                        <MessagesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/messages/:conversationId" element={
                    <ProtectedRoute>
                      <Layout>
                        <MessagesPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/referrals" element={
                    <ProtectedRoute>
                      <Layout>
                        <ReferralsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/jobs" element={
                    <ProtectedRoute>
                      <Layout>
                        <JobsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/events" element={
                    <ProtectedRoute>
                      <Layout>
                        <EventsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 