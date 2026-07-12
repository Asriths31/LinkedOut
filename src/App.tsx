import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages / Features
import { LandingPage } from './features/jobs/components/LandingPage';
import { JobsPage } from './features/jobs/components/JobsPage';
import { JobDetails } from './features/jobs/components/JobDetails';
import { LoginPage } from './features/auth/components/LoginPage';
import { RegisterPage } from './features/auth/components/RegisterPage';
import { ForgotPasswordPage } from './features/auth/components/ForgotPasswordPage';
import { VerifyEmailPage } from './features/auth/components/VerifyEmailPage';
import { ResetPasswordPage } from './features/auth/components/ResetPasswordPage';
import { CartPage } from './features/applications/components/CartPage';
import { WizardPage } from './features/applications/components/WizardPage';
import { CandidateDashboard } from './features/dashboard/components/CandidateDashboard';
import { EmployerDashboard } from './features/dashboard/components/EmployerDashboard';
import { ProfilePage } from './features/profile/components/ProfilePage';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { JobCreatePage } from './features/jobs/components/JobCreatePage';
import { CompaniesPage } from './features/companies/components/CompaniesPage';
import { CompanyDetails } from './features/companies/components/CompanyDetails';
import { EmployerCompanyPage } from './features/companies/components/EmployerCompanyPage';
import { EmployerJobApplicantsPage } from './features/dashboard/components/EmployerJobApplicantsPage';

// Instantiate Query Client for TanStack Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex min-h-screen flex-col bg-white">
          {/* Global Navigation */}
          <Navbar />

          {/* Main Workspace Area */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/companies/:id" element={<CompanyDetails />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Candidate Flows */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/apply/:id" element={<WizardPage />} />
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Employer / Admin Layout Flows */}
              <Route path="/employer/dashboard" element={<EmployerDashboard />} />
              <Route path="/employer/jobs/create" element={<JobCreatePage />} />
              <Route path="/employer/jobs/:id/applicants" element={<EmployerJobApplicantsPage />} />
              <Route path="/employer/company" element={<EmployerCompanyPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />

              {/* 404 Route Fallback */}
              <Route
                path="*"
                element={
                  <div className="flex min-h-[50vh] flex-col items-center justify-center text-center p-4">
                    <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white mb-2">404 - Not Found</h2>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">The requested platform module was not found.</p>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Core Footer */}
          <Footer />

          {/* Toast Notification Container */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '6px',
                fontSize: '14px',
                border: '1px solid #d1d9e0',
                boxShadow: '0 3px 6px rgba(140,149,159,0.15)',
                color: '#1f2328',
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
};
export default App;
