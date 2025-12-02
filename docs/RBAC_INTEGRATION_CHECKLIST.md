# RBAC Integration Checklist

## ✅ Complete - Foundation Phase

### Created Files (7 files)

- ✅ `src/data/navigation/roleBasedMenuData.jsx` - Role-based menu generators
- ✅ `src/contexts/RoleMenuContext.jsx` - Role context provider + hook
- ✅ `src/redux-store/slices/role.js` - Redux role state management
- ✅ `src/hocs/RoleBasedRoute.jsx` - Route protection HOC
- ✅ `src/views/dashboards/StudentDashboard.jsx` - Student dashboard
- ✅ `src/views/dashboards/TeacherDashboard.jsx` - Teacher dashboard
- ✅ `src/views/dashboards/AdminDashboard.jsx` - Admin dashboard
- ✅ `docs/RBAC_IMPLEMENTATION_GUIDE.md` - Integration documentation

## ⏳ Pending - Integration Phase

### Update Existing Files (3 files)

#### 1. `src/components/Providers.jsx`

**Status:** READY TO UPDATE
**Change:** Add RoleMenuProvider to context stack
**Lines to modify:** After ReduxProvider, wrap AuthProvider with RoleMenuProvider
**Complexity:** LOW (2-3 lines)

```jsx
// Add this import:
import { RoleMenuProvider } from '@/contexts/RoleMenuContext'

// In the return JSX, change this:
<ReduxProvider>
  <AuthProvider>{children}</AuthProvider>
</ReduxProvider>

// To this:
<ReduxProvider>
  <RoleMenuProvider>
    <AuthProvider>{children}</AuthProvider>
  </RoleMenuProvider>
</ReduxProvider>
```

#### 2. `src/redux-store/index.js`

**Status:** READY TO UPDATE
**Change:** Add roleReducer to store configuration
**Lines to modify:** Add import at top, add to reducer object
**Complexity:** LOW (2 lines)

```jsx
// Add this import:
import roleReducer from "@/redux-store/slices/role";

// In the configureStore reducer object, add:
roleReducer; // Add this line with other reducers
```

#### 3. `src/data/navigation/verticalMenuData.jsx`

**Status:** READY TO UPDATE
**Change:** Make menu dynamic based on user role
**Lines to modify:** Replace entire export function
**Complexity:** MEDIUM (function rewrite)

```jsx
"use client";

import { getRoleBasedMenuData } from "./roleBasedMenuData";
import { useSelector } from "react-redux";

const verticalMenuData = (dictionary) => {
  const userRole = useSelector((state) => state.roleReducer?.roleType);
  return getRoleBasedMenuData(userRole || "student", dictionary);
};

export default verticalMenuData;
```

---

## 📋 Phase 1: Portal Components (12 files needed)

### Student Portal (5 components)

- [ ] `src/views/apps/student-portal/StudentClasses.jsx`
  - Classes enrolled in
  - Course materials and syllabus
  - Class announcements
- [ ] `src/views/apps/student-portal/StudentAssignments.jsx`
  - List of pending assignments
  - Assignment submission form
  - Past submissions and grades
- [ ] `src/views/apps/student-portal/StudentGrades.jsx`
  - Report card view
  - Subject-wise grades
  - Historical grades
  - GPA calculation
- [ ] `src/views/apps/student-portal/StudentAttendance.jsx`
  - Monthly attendance tracker
  - Attendance statistics
  - Leave requests
- [ ] `src/views/apps/student-portal/StudentFees.jsx`
  - Fee balance information
  - Payment history
  - Online payment gateway
  - Receipts download

### Teacher Portal (5 components)

- [ ] `src/views/apps/teacher-portal/ClassSchedule.jsx`
  - Timetable view
  - Class details
  - Student roster for each class
- [ ] `src/views/apps/teacher-portal/StudentManagement.jsx`
  - List of all students by class
  - Student profile view
  - Student performance tracking
- [ ] `src/views/apps/teacher-portal/AttendanceMarking.jsx`
  - Daily attendance marking
  - Bulk upload attendance
  - Attendance reports
- [ ] `src/views/apps/teacher-portal/GradeEntry.jsx`
  - Enter grades for assignments/exams
  - Grade scale management
  - Bulk grade import
- [ ] `src/views/apps/teacher-portal/LeaveRequest.jsx`
  - Submit leave requests
  - Track leave balance
  - View leave history

### Admin Portal (6 components)

- [ ] `src/views/apps/admin-portal/UserManagement.jsx`
  - Create/Edit/Delete users
  - User role assignment
  - Bulk user import
  - User status management
- [ ] `src/views/apps/admin-portal/AcademicManagement.jsx`
  - Manage academic years
  - Class/Section management
  - Subject management
  - Curriculum mapping
- [ ] `src/views/apps/admin-portal/FinanceManagement.jsx`
  - Fee structure configuration
  - Payment tracking dashboard
  - Financial reports
  - Transaction history
- [ ] `src/views/apps/admin-portal/AdmissionManagement.jsx`
  - Admission applications
  - Enrollment process
  - Admission reports
  - Document uploads
- [ ] `src/views/apps/admin-portal/ReportGeneration.jsx`
  - Academic reports
  - Attendance reports
  - Financial reports
  - Custom report builder
- [ ] `src/views/apps/admin-portal/SystemSettings.jsx`
  - School configuration
  - Holiday calendar
  - Backup/Restore
  - Email/SMS templates

---

## 🔧 Phase 2: Shared Components (5 components)

- [ ] `src/components/shared/DataTable.jsx`
  - Reusable table with sorting
  - Pagination support
  - Column filtering
  - Export to CSV/PDF
- [ ] `src/components/shared/StatsCard.jsx`
  - Standardized stat card
  - Icon and color props
  - Trend indicators
- [ ] `src/components/shared/FormCard.jsx`
  - Form wrapper with validation
  - Error display
  - Submit button
- [ ] `src/components/shared/FilterBar.jsx`
  - Common filtering interface
  - Date range picker
  - Status filters
- [ ] `src/components/shared/EmptyState.jsx`
  - Empty state UI
  - Action buttons
  - Animations

---

## 🔌 Phase 3: Service Layer (3 services)

- [ ] `src/services/StudentService.js`
  - Fetch student dashboard data
  - Get assignments for student
  - Submit assignment
  - Get grades
  - Get attendance
- [ ] `src/services/TeacherService.js`
  - Get teacher dashboard
  - Fetch class list
  - Mark attendance
  - Enter grades
  - Upload content
- [ ] `src/services/AdminService.js`
  - Get admin dashboard metrics
  - User management operations
  - Academic operations
  - Finance operations
  - Report generation

---

## ✓ Phase 4: Integration & Testing (6 tasks)

- [ ] Fix ESLint `.eslintrc.js` configuration
- [ ] Test role switching and menu updates
- [ ] Test route protection
- [ ] Test Redux selectors
- [ ] Test Context hooks
- [ ] Document API endpoints used

---

## 📊 Progress Summary

| Phase                 | Status  | Files | Priority |
| --------------------- | ------- | ----- | -------- |
| Foundation            | ✅ 100% | 7/7   | HIGH     |
| Integration           | ⏳ 0%   | 0/3   | HIGH     |
| Portal Components     | ⏳ 0%   | 0/16  | HIGH     |
| Shared Components     | ⏳ 0%   | 0/5   | MEDIUM   |
| Service Layer         | ⏳ 0%   | 0/3   | MEDIUM   |
| Integration & Testing | ⏳ 0%   | 0/6   | MEDIUM   |

**Total Progress:** 7/40 files = 17.5% complete

---

## 🚀 Quick Start for Next Developer

1. **Review RBAC_IMPLEMENTATION_GUIDE.md** - Understand the architecture
2. **Update 3 existing files** (Providers.jsx, index.js, verticalMenuData.jsx) - Enable integration
3. **Create 16 portal components** - Build feature-specific UIs
4. **Create 5 shared components** - Enable code reuse
5. **Create 3 services** - Enable API integration
6. **Test & deploy** - Verify everything works

---

## 🔗 Key File References

**Configuration:**

- Backend API: `http://localhost:5000/api/v1`
- Redux store: `src/redux-store/index.js`
- Authentication: `src/contexts/AuthContext.jsx`
- NextAuth config: `src/app/api/auth/[...nextauth]/route.js`

**RBAC Files:**

- Menu data: `src/data/navigation/roleBasedMenuData.jsx`
- Context: `src/contexts/RoleMenuContext.jsx`
- Redux: `src/redux-store/slices/role.js`
- HOC: `src/hocs/RoleBasedRoute.jsx`

**Role Types:**

- `student` (aliases: learner, user)
- `teacher` (aliases: educator, instructor)
- `admin` (aliases: superadmin, administrator, super_admin)
- `guest` (no access)

---

## ⚠️ Important Notes

1. **Role normalization** - Always use normalized roles (student, teacher, admin)
2. **Provider wrapping** - RoleMenuProvider must wrap AuthProvider
3. **Redux dispatch** - Call `setUserRole()` after successful login
4. **Mock data** - All dashboards use mock data, replace with API calls
5. **API endpoints** - Need to create backend endpoints for all portal features

---

## 📞 Support

If you encounter issues:

1. Check RBAC_IMPLEMENTATION_GUIDE.md for detailed explanations
2. Verify all 3 existing files are properly updated
3. Check browser console for errors
4. Use Redux DevTools to inspect state

---

**Created:** December 2024
**Version:** 1.0
**Last Updated:** December 2024
