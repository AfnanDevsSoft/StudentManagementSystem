import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Core Modules
import { BranchesPage } from './pages/branches/BranchesPage';
import { RolesPage } from './pages/roles/RolesPage';
import { UsersPage } from './pages/users/UsersPage';
import { StudentsPage } from './pages/students/StudentsPage';
import { TeachersPage } from './pages/teachers/TeachersPage';
import { CoursesPage } from './pages/courses/CoursesPage';
import { AdmissionsPage } from './pages/admissions/AdmissionsPage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { GradesPage } from './pages/grades/GradesPage';
import { PayrollPage } from './pages/payroll/PayrollPage';
import { FinancePage } from './pages/finance/FinancePage';
import { LibraryPage } from './pages/library/LibraryPage';
import { HealthPage } from './pages/health/HealthPage';
import { EventsPage } from './pages/events/EventsPage';
import { CommunicationsPage } from './pages/communications/CommunicationsPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { Toaster } from './components/ui/toaster';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/branches"
              element={
                <ProtectedRoute>
                  <BranchesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/roles"
              element={
                <ProtectedRoute>
                  <RolesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teachers"
              element={
                <ProtectedRoute>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admissions"
              element={
                <ProtectedRoute>
                  <AdmissionsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/grades"
              element={
                <ProtectedRoute>
                  <GradesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll"
              element={
                <ProtectedRoute>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/library"
              element={
                <ProtectedRoute>
                  <LibraryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/health"
              element={
                <ProtectedRoute>
                  <HealthPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />

            {/* Consolidate Messages and Announcements into Communications */}
            <Route
              path="/communications"
              element={
                <ProtectedRoute>
                  <CommunicationsPage />
                </ProtectedRoute>
              }
            />
            {/* Redirect old routes for backward compatibility if sidebar links them */}
            <Route path="/messages" element={<Navigate to="/communications" replace />} />
            <Route path="/announcements" element={<Navigate to="/communications" replace />} />

            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
