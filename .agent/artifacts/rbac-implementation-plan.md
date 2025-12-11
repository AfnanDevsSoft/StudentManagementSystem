# Role-Based Access Control (RBAC) Implementation Plan

## Overview
Implement separate navigation/panels for each user role (Admin, Teacher, Student) based on the SOW requirements.

## Phase 1: Navigation Configuration by Role

### Role-Based Navigation Items

#### **ADMIN Role** (Full Access)
- Dashboard (Admin Analytics)
- Branches (multi-location management)
- Roles & Permissions
- Users (all user management)
- Students (full management)
- Teachers (full management)
- Courses (full management)
- Admissions (full workflow)
- Attendance (view all)
- Grades (view all)
- Payroll (manage teacher salaries)
- Finance (fee structures, invoices, tracking)
- Library (full management)
- Health Records (view all)
- Events (manage)
- Communications (send to all)
- Analytics (full reports)
- Settings (system configuration)

#### **TEACHER Role** (Teaching & Class Management)
- Dashboard (Teacher-specific: schedule, pending tasks)
- My Classes/Courses (assigned courses)
- My Students (students in their classes)
- Attendance (mark for their classes)
- Grades (enter for their classes)
- Course Content (upload materials)
- Assignments (create/grade)
- Communications (message students/parents)
- Leave Management (request leave)
- Events (view calendar)
- Settings (personal settings)

#### **STUDENT Role** (Learning & Self-Service)
- Dashboard (personalized: timetable, upcoming assignments)
- My Courses (enrolled courses)
- My Grades (performance history)
- My Attendance (view own records)
- Course Materials (access learning materials)
- Assignments (view/submit)
- Fee Status (view invoices, payment history)
- Library (borrowed books, search)
- Events (view calendar)
- Communications (messages, announcements)
- Settings (personal settings)

---

## Phase 2: Implementation Steps

### Step 1: Create Role Configuration File
Create `/src/config/roleConfig.ts` with navigation items per role

### Step 2: Update Sidebar Component
Modify `Sidebar.tsx` to filter navigation by role

### Step 3: Create Role-Specific Dashboard Components
- `AdminDashboard.tsx` - Analytics, metrics, branch overview
- `TeacherDashboard.tsx` - Schedule, pending grading, class stats
- `StudentDashboard.tsx` - Timetable, assignments, attendance

### Step 4: Update Dashboard Page
Route to correct dashboard based on role

### Step 5: Create Protected Route with Role Check
Update `ProtectedRoute.tsx` to validate role for each route

### Step 6: Create Missing Student/Teacher Pages
- Student: MyCourses, MyGrades, MyAttendance, Assignments, FeeStatus
- Teacher: MyClasses, MyStudents, CourseContent, LeaveManagement

---

## Files to Create/Modify

### NEW FILES:
1. `/src/config/roleConfig.ts` - Role permissions and navigation
2. `/src/pages/dashboard/AdminDashboard.tsx`
3. `/src/pages/dashboard/TeacherDashboard.tsx`
4. `/src/pages/dashboard/StudentDashboard.tsx`
5. `/src/pages/student/MyCourses.tsx`
6. `/src/pages/student/MyGrades.tsx`
7. `/src/pages/student/MyAttendance.tsx`
8. `/src/pages/student/Assignments.tsx`
9. `/src/pages/student/FeeStatus.tsx`
10. `/src/pages/teacher/MyClasses.tsx`
11. `/src/pages/teacher/MyStudents.tsx`
12. `/src/pages/teacher/CourseContent.tsx`
13. `/src/pages/teacher/LeaveManagement.tsx`

### MODIFY:
1. `/src/components/layout/Sidebar.tsx` - Use roleConfig
2. `/src/pages/dashboard/DashboardPage.tsx` - Route by role
3. `/src/components/ProtectedRoute.tsx` - Add role validation
4. `/src/App.tsx` - Add new routes

---

## Navigation Structure by Role

```
ADMIN:
├── Dashboard (Admin Analytics)
├── User Management
│   ├── Branches
│   ├── Roles & Permissions
│   ├── Users
│   ├── Students
│   └── Teachers
├── Academic
│   ├── Courses
│   ├── Admissions
│   ├── Attendance
│   └── Grades
├── Finance
│   ├── Finance (Fees)
│   └── Payroll
├── Operations
│   ├── Library
│   ├── Health Records
│   └── Events
├── Communication
│   ├── Messages
│   └── Announcements
├── Analytics
└── Settings

TEACHER:
├── Dashboard (My Schedule)
├── Teaching
│   ├── My Classes
│   ├── My Students
│   ├── Attendance
│   └── Grades
├── Content
│   ├── Course Content
│   └── Assignments
├── HR
│   └── Leave Management
├── Communication
│   ├── Messages
│   └── Announcements
├── Events
└── Settings

STUDENT:
├── Dashboard (My Timetable)
├── Learning
│   ├── My Courses
│   ├── Course Materials
│   └── Assignments
├── Performance
│   ├── My Grades
│   └── My Attendance
├── Finance
│   └── Fee Status
├── Resources
│   ├── Library
│   └── Events
├── Communication
│   ├── Messages
│   └── Announcements
└── Settings
```

---

## Priority Order
1. ✅ Create roleConfig.ts (navigation permissions)
2. ✅ Update Sidebar.tsx with role filtering
3. ✅ Create role-specific dashboards
4. ✅ Update DashboardPage to route by role
5. ⬜ Create student-specific pages
6. ⬜ Create teacher-specific pages
7. ⬜ Add route protection by role
