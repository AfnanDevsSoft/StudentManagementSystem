
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { UnauthorizedPage } from './pages/error/UnauthorizedPage';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// Core Modules
import { BranchesPage } from './pages/branches/BranchesPage';
import { RolesPage } from './pages/roles/RolesPage';
import { CreateRolePage } from './pages/roles/CreateRolePage';
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

import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

// Student Pages
import { StudentCoursesPage } from './pages/student/StudentCoursesPage';
import { StudentGradesPage } from './pages/student/StudentGradesPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { StudentAssignmentsPage } from './pages/student/StudentAssignmentsPage';

// Teacher Pages
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';
import { TeacherAssignmentsPage } from './pages/teacher/TeacherAssignmentsPage';

import { StudentMaterialsPage } from './pages/student/StudentMaterialsPage';
import { TeacherPayrollPage } from './pages/teacher/TeacherPayrollPage';
import { TeacherAttendancePage } from './pages/teacher/TeacherAttendancePage';
import { TeacherGradesPage } from './pages/teacher/TeacherGradesPage';
import { TeacherLeavePage } from './pages/teacher/TeacherLeavePage';

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
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin', 'teacher', 'student']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Global */}
            <Route
              path="/branches"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <BranchesPage />
                </ProtectedRoute>
              }
            />


            <Route
              path="/roles"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <RolesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/roles/new"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <CreateRolePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - Branch Level (SuperAdmin + BranchAdmin) */}
            <Route
              path="/students"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <StudentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teachers"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <TeachersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admissions"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <AdmissionsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/attendance"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/grades"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <GradesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payroll"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <PayrollPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/finance"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <FinancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/library"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin', 'student']}>
                  <LibraryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/health"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <HealthPage />
                </ProtectedRoute>
              }
            />





            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['superadmin', 'branchadmin', 'teacher', 'student']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* ========== STUDENT ROUTES ========== */}
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCoursesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/grades"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentGradesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/attendance"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAttendancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/fees"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentFeesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/materials"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentMaterialsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentAssignmentsPage />
                </ProtectedRoute>
              }
            />

            {/* ========== TEACHER ROUTES ========== */}
            <Route
              path="/teacher/classes"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherClassesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/students"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherStudentsPage />
                </ProtectedRoute>
              }
            />

            {/* Reuse Admin pages for Teachers (read-only or limited view ideally, handled by page component logic?) 
                Wait, for now reusing the page components. The page components check auth context? 
                Actually the plan just said 'Reuse branchadmin attendance page'. 
                If the page relies on API permissions it should be fine. 
                But let's allow 'teacher' for these routes.
            */}
            <Route
              path="/teacher/attendance"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherAttendancePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/grades"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherGradesPage />
                </ProtectedRoute>
              }
            />



            <Route
              path="/teacher/assignments"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherAssignmentsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/leave"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLeavePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher/payroll"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherPayrollPage />
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
