# RBAC Implementation Guide - Student Management Portal

## Overview

This document describes the Role-Based Access Control (RBAC) system implemented for the Student Management Portal. The system transforms the generic admin template into three specialized portals: Student Portal, Teacher Portal, and Admin Portal.

## Architecture Overview

### Core Components

1. **Role-Based Menu System** (`src/data/navigation/roleBasedMenuData.jsx`)

   - Generates different navigation menus based on user role
   - Supports role aliases (learner→student, educator→teacher, superadmin→admin)
   - Provides four role-specific menu generators

2. **Role Context** (`src/contexts/RoleMenuContext.jsx`)

   - Context provider for app-wide role availability
   - Exports `useRoleMenu()` hook for accessing role information
   - Includes `canAccess()` utility for permission checking

3. **Redux Role Slice** (`src/redux-store/slices/role.js`)

   - Manages user role state in Redux
   - Provides selectors for role queries
   - Includes actions for role management

4. **Role Protection HOC** (`src/hocs/RoleBasedRoute.jsx`)

   - Higher-order component for protecting routes
   - Exports `withRoleBasedRoute()` HOC and `useRoleCheck()` hook
   - Prevents unauthorized access at component level

5. **Role-Specific Dashboards**
   - `StudentDashboard.jsx` - Student-focused dashboard
   - `TeacherDashboard.jsx` - Teacher-focused dashboard
   - `AdminDashboard.jsx` - Admin-focused dashboard

## Integration Steps

### Step 1: Update Providers Component

**File:** `src/components/Providers.jsx`

Add the `RoleMenuProvider` to the provider stack:

```jsx
import { RoleMenuProvider } from "@/contexts/RoleMenuContext";

// Inside the return statement:
<NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
  <VerticalNavProvider>
    <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
      <ThemeProvider direction={direction} systemMode={systemMode}>
        <ReduxProvider>
          <RoleMenuProvider>
            <AuthProvider>{children}</AuthProvider>
          </RoleMenuProvider>
        </ReduxProvider>
        <AppReactToastify direction={direction} hideProgressBar />
      </ThemeProvider>
    </SettingsProvider>
  </VerticalNavProvider>
</NextAuthProvider>;
```

### Step 2: Add Role Reducer to Redux Store

**File:** `src/redux-store/index.js`

```jsx
import roleReducer from "@/redux-store/slices/role";

export const store = configureStore({
  reducer: {
    chatReducer,
    calendarReducer,
    kanbanReducer,
    emailReducer,
    analyticsReducer,
    messagingReducer,
    announcementsReducer,
    courseContentReducer,
    reportingReducer,
    roleReducer, // Add this line
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
```

### Step 3: Update Navigation Menu Data

**File:** `src/data/navigation/verticalMenuData.jsx`

Replace the entire function with role-aware menu generation:

```jsx
"use client";

import { getRoleBasedMenuData } from "./roleBasedMenuData";
import { useSelector } from "react-redux";

const verticalMenuData = (dictionary) => {
  // Get user role from Redux
  const userRole = useSelector((state) => state.roleReducer?.roleType);

  // Get role-based menu data
  return getRoleBasedMenuData(userRole || "student", dictionary);
};

export default verticalMenuData;
```

### Step 4: Initialize User Role

When user logs in (in `src/contexts/AuthContext.jsx` or login handler), dispatch the role:

```jsx
import { setUserRole, setRoleType } from "@/redux-store/slices/role";

// After successful authentication:
dispatch(setUserRole(user.role)); // e.g., 'student', 'teacher', 'admin'
dispatch(setRoleType(normalizeRole(user.role))); // Ensures consistent format
```

## Usage Patterns

### 1. Using the Role Menu Hook

```jsx
import { useRoleMenu } from "@/contexts/RoleMenuContext";

function MyComponent() {
  const { role, roleType, canAccess } = useRoleMenu();

  return (
    <>
      {canAccess(["student"]) && <StudentContent />}
      {canAccess(["teacher", "admin"]) && <TeacherOrAdminContent />}
    </>
  );
}
```

### 2. Using Redux Role Selectors

```jsx
import { useSelector } from "react-redux";
import {
  selectIsStudent,
  selectIsTeacher,
  selectCanAccess,
} from "@/redux-store/slices/role";

function MyComponent() {
  const isStudent = useSelector(selectIsStudent);
  const canAccess = useSelector(selectCanAccess(["student", "teacher"]));

  return (
    <>
      {isStudent && <StudentSpecificFeature />}
      {canAccess && <RestrictedFeature />}
    </>
  );
}
```

### 3. Protecting Routes with HOC

```jsx
import { withRoleBasedRoute } from "@/hocs/RoleBasedRoute";
import AdminDashboard from "@/views/dashboards/AdminDashboard";

export default withRoleBasedRoute(AdminDashboard, ["admin"]);
```

### 4. Using the Role Check Hook

```jsx
import { useRoleCheck } from "@/hocs/RoleBasedRoute";

function MyComponent() {
  const { hasAccess, roleType } = useRoleCheck(["student", "teacher"]);

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return <ProtectedContent />;
}
```

## Role Types and Aliases

| Primary Role | Aliases                                | Menu Items | Use Case                                        |
| ------------ | -------------------------------------- | ---------- | ----------------------------------------------- |
| **student**  | learner, user                          | 7 items    | Learner access to classes, assignments, grades  |
| **teacher**  | educator, instructor                   | 8 items    | Educator access to attendance, grading, content |
| **admin**    | superadmin, administrator, super_admin | 25+ items  | Full system management access                   |
| **guest**    | -                                      | -          | No access (redirect to login)                   |

## Menu Structure by Role

### Student Menu (7 items)

- Classes
- Learning Materials
- Assignments
- Grades
- Attendance
- Exams
- Fee Status

### Teacher Menu (8 items)

- My Classes
- Student Management
- Attendance Marking
- Grade Entry
- Assignment Management
- Content Upload
- Leave Requests
- Performance Analytics

### Admin Menu (25+ items across 6 sections)

**Users & Access:**

- User Management
- Role Assignment
- Access Control

**Academic:**

- Classes Management
- Course Setup
- Curriculum Management
- Exam Management

**Finance:**

- Fee Structure
- Payment Tracking
- Financial Reports
- Expense Management

**Admissions:**

- Applications
- Enrollment
- Waiting List
- Transfers

**Analytics & Reports:**

- Performance Dashboard
- Attendance Reports
- Financial Reports
- Student Progress Reports

**System Settings:**

- School Profile
- Academic Year
- Holiday Calendar
- Backup & Restore

## File Structure

```
src/
├── contexts/
│   └── RoleMenuContext.jsx (Provider + hook)
├── data/
│   └── navigation/
│       └── roleBasedMenuData.jsx (Menu generators)
├── hocs/
│   └── RoleBasedRoute.jsx (Route protection)
├── redux-store/
│   ├── slices/
│   │   └── role.js (Role state management)
│   └── index.js (Store configuration)
├── views/
│   └── dashboards/
│       ├── StudentDashboard.jsx
│       ├── TeacherDashboard.jsx
│       └── AdminDashboard.jsx
└── components/
    └── Providers.jsx (Provider configuration)
```

## Features Implemented by Role

### Student Portal Features

- ✅ View personal timetable
- ✅ View upcoming assignments
- ✅ Check grades and academic progress
- ✅ Track attendance
- ✅ View fee status
- 🔄 Submit assignments (pending)
- 🔄 Download transcripts (pending)
- 🔄 Download past papers (pending)

### Teacher Portal Features

- ✅ View daily class schedule
- ✅ Mark attendance (quick marking)
- ✅ View pending assignments to grade
- ✅ Monitor class performance
- 🔄 Enter grades for students (pending)
- 🔄 Upload course content (pending)
- 🔄 Request leave (pending)
- 🔄 View performance analytics (pending)

### Admin Portal Features

- ✅ View key metrics (students, teachers, revenue)
- ✅ Branch-wise performance comparison
- ✅ Academic performance overview
- ✅ Recent activities log
- ✅ Financial summary
- ✅ System alerts
- 🔄 User management (pending)
- 🔄 Report generation (pending)
- 🔄 System settings (pending)

## State Management Flow

```
Redux Store (roleReducer)
    ↓
Role Context (useRoleMenu hook)
    ↓
Components (via useSelector or useRoleMenu)
    ↓
UI Update based on role
```

## Authentication Integration

The role system works with the existing NextAuth authentication:

1. **Login** → NextAuth validates credentials
2. **Session** → User role stored in session
3. **Dispatch Role** → After login, dispatch role to Redux
4. **Menu Generation** → Menu updates based on role
5. **Route Protection** → Routes protected by role HOC

## Error Handling

### ESLint Configuration Note

New files may show ESLint warnings about "Cannot find module 'next/babel'". This is a configuration issue and doesn't affect functionality. To fix:

**File:** `.eslintrc.js`

Ensure parser configuration includes:

```js
parser: 'espree', // or '@babel/eslint-parser'
parserOptions: {
  ecmaVersion: 2021,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true
  }
}
```

## Next Steps

### Immediate (Priority: HIGH)

1. ✅ Create role-based menu system
2. ✅ Create role-specific dashboards
3. ⏳ Integrate providers and Redux store
4. ⏳ Fix ESLint configuration

### Short-term (Priority: MEDIUM)

1. Build Student Portal Components (5 files)
2. Build Teacher Portal Components (5 files)
3. Build Admin Portal Components (6 files)
4. Create shared reusable components

### Medium-term (Priority: MEDIUM)

1. Add API integration to all components
2. Implement form validation schemas
3. Create service layer methods
4. Add real data instead of mock data

### Long-term (Priority: LOW)

1. Add advanced analytics features
2. Implement email/SMS notifications
3. Add mobile app integration
4. AI-powered predictive analytics

## Testing Guidelines

### Testing Role Access

```javascript
// Test if role selector works
const role = selectUserRole(state);
expect(role).toBe("student");

// Test role normalization
expect(normalizeRoleType("learner")).toBe("student");
expect(normalizeRoleType("educator")).toBe("teacher");
expect(normalizeRoleType("superadmin")).toBe("admin");
```

### Testing Route Protection

```javascript
// Test if route is protected
render(<withRoleBasedRoute Component {['admin']} />)
expect(screen.queryByText('Unauthorized')).toBeInTheDocument()
```

### Testing Menu Generation

```javascript
// Test if correct menu is generated
const studentMenu = getStudentMenuData(dictionary);
expect(studentMenu).toHaveLength(7);
expect(studentMenu[0].label).toBe("Classes");
```

## API Integration Examples

### Get User Role from Backend

```javascript
const response = await fetch("/api/v1/auth/me");
const user = await response.json();
dispatch(setUserRole(user.role));
```

### Fetch Role-Specific Data

```javascript
// Student API
const assignments = await fetch("/api/v1/students/assignments");

// Teacher API
const grades = await fetch("/api/v1/teachers/grades");

// Admin API
const metrics = await fetch("/api/v1/admin/metrics");
```

## Troubleshooting

### Issue: Menu not updating after login

**Solution:** Ensure `setUserRole()` is dispatched in login handler

### Issue: Role context returns undefined

**Solution:** Verify `RoleMenuProvider` is in Providers.jsx and wraps children

### Issue: Routes not protected

**Solution:** Use `withRoleBasedRoute()` HOC on route components

### Issue: ESLint warnings on new files

**Solution:** See "Error Handling" section for .eslintrc.js fix

## References

- Redux Toolkit Documentation: https://redux-toolkit.js.org/
- React Context API: https://react.dev/reference/react/useContext
- NextAuth.js: https://next-auth.js.org/
- Material-UI: https://mui.com/

## Support

For issues or questions:

1. Check the RBAC_IMPLEMENTATION_GUIDE.md (this file)
2. Review the source files mentioned above
3. Check Redux DevTools for state management debugging
4. Review browser console for error messages

---

**Last Updated:** December 2024
**Version:** 1.0
**Status:** In Progress (Foundation Complete, Components Pending)
