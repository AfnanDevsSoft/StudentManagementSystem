# RBAC Integration - Exact Code Changes Required

## Overview

This document provides exact code snippets needed to integrate the RBAC system into existing files. Copy-paste these directly into the corresponding files.

---

## Change 1: Update `src/components/Providers.jsx`

### Current Code:

```jsx
// Context Imports
import { NextAuthProvider } from "@/contexts/nextAuthProvider";
import { VerticalNavProvider } from "@menu/contexts/verticalNavContext";
import { SettingsProvider } from "@core/contexts/settingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ThemeProvider from "@components/theme";
import ReduxProvider from "@/redux-store/ReduxProvider";

// Styled Component Imports
import AppReactToastify from "@/libs/styles/AppReactToastify";

// Util Imports
import {
  getMode,
  getSettingsFromCookie,
  getSystemMode,
} from "@core/utils/serverHelpers";

const Providers = async (props) => {
  // Props
  const { children, direction } = props;

  // Vars
  const mode = await getMode();
  const settingsCookie = await getSettingsFromCookie();
  const systemMode = await getSystemMode();

  return (
    <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            <ReduxProvider>
              <AuthProvider>{children}</AuthProvider>
            </ReduxProvider>
            <AppReactToastify direction={direction} hideProgressBar />
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </NextAuthProvider>
  );
};

export default Providers;
```

### New Code (with changes highlighted):

```jsx
// Context Imports
import { NextAuthProvider } from "@/contexts/nextAuthProvider";
import { VerticalNavProvider } from "@menu/contexts/verticalNavContext";
import { SettingsProvider } from "@core/contexts/settingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleMenuProvider } from "@/contexts/RoleMenuContext"; // ← ADD THIS LINE
import ThemeProvider from "@components/theme";
import ReduxProvider from "@/redux-store/ReduxProvider";

// Styled Component Imports
import AppReactToastify from "@/libs/styles/AppReactToastify";

// Util Imports
import {
  getMode,
  getSettingsFromCookie,
  getSystemMode,
} from "@core/utils/serverHelpers";

const Providers = async (props) => {
  // Props
  const { children, direction } = props;

  // Vars
  const mode = await getMode();
  const settingsCookie = await getSettingsFromCookie();
  const systemMode = await getSystemMode();

  return (
    <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            <ReduxProvider>
              {/* ← WRAP AUTHPROVIDER WITH ROLEMENUPROVIDER */}
              <RoleMenuProvider>
                <AuthProvider>{children}</AuthProvider>
              </RoleMenuProvider>
            </ReduxProvider>
            <AppReactToastify direction={direction} hideProgressBar />
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </NextAuthProvider>
  );
};

export default Providers;
```

### Changes Summary:

- Add 1 import: `RoleMenuProvider`
- Wrap `<AuthProvider>` with `<RoleMenuProvider></RoleMenuProvider>`

---

## Change 2: Update `src/redux-store/index.js`

### Current Code:

```jsx
// Third-party Imports
import { configureStore } from "@reduxjs/toolkit";

// Slice Imports
import chatReducer from "@/redux-store/slices/chat";
import calendarReducer from "@/redux-store/slices/calendar";
import kanbanReducer from "@/redux-store/slices/kanban";
import emailReducer from "@/redux-store/slices/email";
import analyticsReducer from "@/redux-store/slices/analytics";
import messagingReducer from "@/redux-store/slices/messaging";
import announcementsReducer from "@/redux-store/slices/announcements";
import courseContentReducer from "@/redux-store/slices/courseContent";
import reportingReducer from "@/redux-store/slices/reporting";

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
```

### New Code (with changes highlighted):

```jsx
// Third-party Imports
import { configureStore } from "@reduxjs/toolkit";

// Slice Imports
import chatReducer from "@/redux-store/slices/chat";
import calendarReducer from "@/redux-store/slices/calendar";
import kanbanReducer from "@/redux-store/slices/kanban";
import emailReducer from "@/redux-store/slices/email";
import analyticsReducer from "@/redux-store/slices/analytics";
import messagingReducer from "@/redux-store/slices/messaging";
import announcementsReducer from "@/redux-store/slices/announcements";
import courseContentReducer from "@/redux-store/slices/courseContent";
import reportingReducer from "@/redux-store/slices/reporting";
import roleReducer from "@/redux-store/slices/role"; // ← ADD THIS LINE

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
    roleReducer, // ← ADD THIS LINE (comma needed after reportingReducer above)
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
```

### Changes Summary:

- Add 1 import: `roleReducer from '@/redux-store/slices/role'`
- Add 1 line to reducer object: `roleReducer`

---

## Change 3: Update `src/data/navigation/verticalMenuData.jsx`

### Current Code (ENTIRE FILE - Replace all):

```jsx
const verticalMenuData = (dictionary) => [
  // ... all the existing menu items ...
];

export default verticalMenuData;
```

### New Code (Replace entire file with this):

```jsx
"use client";

// Redux Imports
import { useSelector } from "react-redux";

// Data Imports
import { getRoleBasedMenuData } from "./roleBasedMenuData";

/**
 * Dynamic vertical menu data based on user role
 * Generates different menus for student, teacher, and admin roles
 *
 * This replaces the static menu with a dynamic, role-aware menu system
 */
const verticalMenuData = (dictionary) => {
  // Get user role from Redux store
  // Note: useSelector requires this to be called in a client component
  // If you get errors, wrap the component that uses this with 'use client'
  const userRole = useSelector(
    (state) => state.roleReducer?.roleType || "student"
  );

  // Get role-based menu data
  return getRoleBasedMenuData(userRole, dictionary);
};

export default verticalMenuData;
```

### Changes Summary:

- Replace entire file with new code
- Imports `useSelector` from redux
- Imports `getRoleBasedMenuData` function
- Returns dynamic menu based on Redux role state
- Falls back to 'student' role if not set

### Important Note:

If you get hydration errors, wrap the component that uses this menu with `'use client'` directive.

---

## Change 4 (Optional): Add Role Dispatch in AuthContext

### Location: `src/contexts/AuthContext.jsx` or login handler

### Add this code after successful login:

```jsx
import { setUserRole } from "@/redux-store/slices/role";

// In your login/authentication handler:
const handleLoginSuccess = (user) => {
  // ... existing login code ...

  // NEW: Dispatch user role to Redux
  dispatch(setUserRole(user.role)); // e.g., user.role = 'student', 'teacher', or 'admin'
};
```

---

## Verification Checklist

After making these changes, verify:

1. ✅ Providers.jsx compiles without errors
2. ✅ Redux store includes roleReducer
3. ✅ verticalMenuData uses dynamic menu
4. ✅ No import errors in console
5. ✅ Navigation menu appears correctly
6. ✅ Can switch between user roles (if testing with multiple accounts)

---

## Testing the Integration

### Test 1: Verify Role in Redux DevTools

1. Open Redux DevTools
2. Check `roleReducer` section
3. Verify `roleType` is set correctly

### Test 2: Verify Menu Updates

1. Switch to different user accounts (student, teacher, admin)
2. Verify navigation menu changes for each role
3. Check that only relevant menu items appear

### Test 3: Verify Context Availability

1. In browser console, create a test component using `useRoleMenu()`
2. Verify it returns the correct role information
3. Test `canAccess()` utility

---

## Troubleshooting

### Issue: "Cannot find module '@/redux-store/slices/role'"

**Solution:** Make sure `role.js` was created in `src/redux-store/slices/` directory

### Issue: "useSelector is not defined"

**Solution:** Make sure the component importing this is marked with `'use client'`

### Issue: Menu doesn't change after login

**Solution:** Verify `setUserRole()` is being dispatched in your authentication handler

### Issue: "RoleMenuProvider is not a function"

**Solution:** Make sure `RoleMenuContext.jsx` was created correctly in `src/contexts/`

### Issue: Hydration mismatch error

**Solution:** Add `'use client'` directive to top of any component using `useSelector` from this file

---

## Quick Reference

### Files Modified:

1. `src/components/Providers.jsx` - Added RoleMenuProvider
2. `src/redux-store/index.js` - Added roleReducer
3. `src/data/navigation/verticalMenuData.jsx` - Made dynamic

### Files Created (Already Done):

1. `src/data/navigation/roleBasedMenuData.jsx` - Menu generators
2. `src/contexts/RoleMenuContext.jsx` - Context provider
3. `src/redux-store/slices/role.js` - Redux slice
4. `src/hocs/RoleBasedRoute.jsx` - Route protection
5. `src/views/dashboards/StudentDashboard.jsx` - Dashboard
6. `src/views/dashboards/TeacherDashboard.jsx` - Dashboard
7. `src/views/dashboards/AdminDashboard.jsx` - Dashboard

### Total Changes Required:

- 3 files to update
- 3 imports to add
- 3 code sections to modify

**Estimated Time:** 10-15 minutes

---

## Next Steps After Integration

Once these changes are made:

1. Test the integration works
2. Create portal-specific components
3. Build shared reusable components
4. Implement API integration
5. Add proper data instead of mock data

---

**Version:** 1.0
**Created:** December 2024
**Status:** Ready for Implementation
