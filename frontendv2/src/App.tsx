
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

// Student Pages
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentGradesPage } from './pages/student/StudentGradesPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';

// Teacher Pages
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';

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

            {/* Admin Routes */}
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

            {/* Communications */}
            <Route
              path="/communications"
              element={
                <ProtectedRoute>
                  <CommunicationsPage />
                </ProtectedRoute>
              }
            />
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

            {/* ========== STUDENT ROUTES ========== */}
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute>
                  <StudentCoursesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/grades"
              element={
                <ProtectedRoute>
                  <StudentGradesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute>
                  <StudentAttendancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/fees"
              element={
                <ProtectedRoute>
                  <StudentFeesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/materials"
              element={
                <ProtectedRoute>
                  <StudentCoursesPage /> {/* Placeholder - reuse courses page for now */}
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute>
                  <StudentCoursesPage /> {/* Placeholder - reuse courses page for now */}
                </ProtectedRoute>
              }
            />

            {/* ========== TEACHER ROUTES ========== */}
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute>
                  <TeacherClassesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute>
                  <TeacherClassesPage /> {/* Placeholder */}
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute>
                  <AttendancePage /> {/* Reuse admin attendance page */}
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/grades"
              element={
                <ProtectedRoute>
                  <GradesPage /> {/* Reuse admin grades page */}
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/content"
              element={
                <ProtectedRoute>
                  <TeacherClassesPage /> {/* Placeholder */}
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute>
                  <TeacherClassesPage /> {/* Placeholder */}
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/leave"
              element={
                <ProtectedRoute>
                  <TeacherClassesPage /> {/* Placeholder */}
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/payroll"
              element={
                <ProtectedRoute>
                  <PayrollPage /> {/* Reuse payroll page */}
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
