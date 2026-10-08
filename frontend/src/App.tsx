import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { VerifyEmailPage } from './pages/VerifyEmailPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';
import { GoalSelectionPage } from './pages/GoalSelectionPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { DocumentsPage } from './pages/DocumentsPage.js';
import { VideoPage } from './pages/VideoPage.js';
import { WebResearchPage } from './pages/WebResearchPage.js';
import { QualificationPage } from './pages/QualificationPage.js';
import { RecommendationPage } from './pages/RecommendationPage.js';
import { CvPage } from './pages/CvPage.js';
import { AgentActivityPage } from './pages/AgentActivityPage.js';
import { ConsultantDashboardPage } from './pages/ConsultantDashboardPage.js';
import { ApplicantDetailsPage } from './pages/ApplicantDetailsPage.js';

// Route guard for authenticated users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center text-slate-400 text-sm">
        <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mr-3" />
        Loading EduPath AI...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-[#080d1a] text-slate-100 font-sans">
          <div className="print:hidden">
            <Navbar />
          </div>

          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected Applicant Journey Routes */}
              <Route
                path="/goal"
                element={
                  <ProtectedRoute>
                    <GoalSelectionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <DocumentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/video"
                element={
                  <ProtectedRoute>
                    <VideoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/web-research"
                element={
                  <ProtectedRoute>
                    <WebResearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/qualification"
                element={
                  <ProtectedRoute>
                    <QualificationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommendation"
                element={
                  <ProtectedRoute>
                    <RecommendationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cv"
                element={
                  <ProtectedRoute>
                    <CvPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agent-activity"
                element={
                  <ProtectedRoute>
                    <AgentActivityPage />
                  </ProtectedRoute>
                }
              />

              {/* Consultant Portal */}
              <Route path="/consultant" element={<ConsultantDashboardPage />} />
              <Route path="/consultant/applicants/:id" element={<ApplicantDetailsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>

          <div className="print:hidden">
            <Footer />
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
