# Frontend v1 - Testing Guide

## 🧪 Testing Overview

This guide covers manual testing, unit testing, and integration testing for the Frontend v1 platform.

---

## 📋 Manual Testing Checklist

### 1. Authentication Flow ✅

#### Login Page

- [ ] Visit `http://localhost:3000`
- [ ] Verify login form displays correctly
- [ ] Test with invalid credentials (should show error)
- [ ] Test with valid credentials (should redirect to dashboard)
- [ ] Check localStorage for auth_token
- [ ] Check localStorage for auth_user

#### Test Credentials

```
SuperAdmin:
- Username: superadmin1
- Password: password123

Admin:
- Username: admin1
- Password: password123

Teacher:
- Username: teacher1
- Password: password123

Student:
- Username: student1
- Password: password123

Parent:
- Username: parent1
- Password: password123
```

#### Logout

- [ ] Navigate to any dashboard
- [ ] Click logout button
- [ ] Verify redirected to login page
- [ ] Verify localStorage cleared
- [ ] Try accessing dashboard directly (should redirect to login)

---

### 2. Role-Based Access Control ✅

#### SuperAdmin Access

- [ ] Login as SuperAdmin
- [ ] Verify dashboard shows `/dashboard/superadmin`
- [ ] Check access to:
  - [ ] Dashboard page
  - [ ] Branches management
  - [ ] Users management
- [ ] Verify cannot access admin/teacher/student dashboards

#### Admin Access

- [ ] Login as Admin
- [ ] Verify dashboard shows `/dashboard/admin`
- [ ] Check access to:
  - [ ] Dashboard page
  - [ ] Students management
  - [ ] Teachers management
  - [ ] Courses management
- [ ] Verify cannot access superadmin/teacher/student dashboards

#### Teacher Access

- [ ] Login as Teacher
- [ ] Verify dashboard shows `/dashboard/teacher`
- [ ] Check access to:
  - [ ] Dashboard page
  - [ ] My Courses
  - [ ] Grade Entry
  - [ ] Attendance Marking
- [ ] Verify cannot access admin/student dashboards

#### Student Access

- [ ] Login as Student
- [ ] Verify dashboard shows `/dashboard/student`
- [ ] Verify limited to student features only

#### Parent Access

- [ ] Login as Parent
- [ ] Verify dashboard shows `/dashboard/parent`
- [ ] Verify limited to parent features only

---

### 3. Dashboard Pages ✅

#### SuperAdmin Dashboard

- [ ] Verify page loads without errors
- [ ] Check all stat cards display
- [ ] Verify quick action buttons work
- [ ] Check navigation menu

#### Admin Dashboard

- [ ] Verify page loads without errors
- [ ] Check all stat cards display
- [ ] Verify quick action buttons work
- [ ] Check navigation menu
- [ ] Test navigation to management pages

#### Teacher Dashboard

- [ ] Verify page loads without errors
- [ ] Check course list
- [ ] Verify stats display correctly
- [ ] Test links to grade entry and attendance

#### Student Dashboard

- [ ] Verify page loads without errors
- [ ] Check enrolled courses
- [ ] Verify GPA display
- [ ] Check announcements section

#### Parent Dashboard

- [ ] Verify page loads without errors
- [ ] Check children list
- [ ] Verify academic performance display
- [ ] Test messaging links

---

### 4. Management Pages ✅

#### Students Management (`/dashboard/admin/students`)

- [ ] **List Display**
  - [ ] Verify all students load
  - [ ] Check table columns display correctly
  - [ ] Verify responsive on mobile
- [ ] **Search**
  - [ ] Search by first name works
  - [ ] Search by last name works
  - [ ] Search by student code works
  - [ ] Search is case-insensitive
  - [ ] Clear search shows all students
- [ ] **Status Indicators**
  - [ ] Active students show green badge
  - [ ] Inactive students show red badge
- [ ] **Actions**
  - [ ] Edit button is clickable
  - [ ] Delete button shows confirmation
  - [ ] Add Student button works (opens modal)

#### Teachers Management (`/dashboard/admin/teachers`)

- [ ] **List Display**
  - [ ] Verify all teachers load
  - [ ] Check all columns display
  - [ ] Verify department and designation show
- [ ] **Search**
  - [ ] Search by first name works
  - [ ] Search by last name works
  - [ ] Search by employee code works
- [ ] **Actions**
  - [ ] Edit button is clickable
  - [ ] Delete button shows confirmation
  - [ ] Add Teacher button works

#### Branches Management (`/dashboard/superadmin/branches`)

- [ ] **List Display**
  - [ ] Verify all branches load in cards
  - [ ] Check all branch details display
  - [ ] Verify responsive grid layout
- [ ] **Search**
  - [ ] Search by name works
  - [ ] Search by code works
  - [ ] Search by city works
- [ ] **Card Content**
  - [ ] Branch name and code display
  - [ ] Address information shows
  - [ ] Principal name displays
  - [ ] Active/Inactive status shows
- [ ] **Actions**
  - [ ] Edit button works
  - [ ] Delete button shows confirmation

#### Users Management (`/dashboard/superadmin/users`)

- [ ] **List Display**
  - [ ] Verify all users load in table
  - [ ] Check all columns display
- [ ] **Role Colors**
  - [ ] SuperAdmin shows purple
  - [ ] Admin shows blue
  - [ ] Teacher shows green
  - [ ] Student shows yellow
  - [ ] Parent shows pink
- [ ] **Search**
  - [ ] Search by username works
  - [ ] Search by email works
  - [ ] Search by full name works
- [ ] **Actions**
  - [ ] Edit button works
  - [ ] Delete button works

#### Courses Management (`/dashboard/admin/courses`)

- [ ] **List Display**
  - [ ] Verify all courses load in cards
  - [ ] Check course information displays
  - [ ] Verify responsive grid layout
- [ ] **Search**
  - [ ] Search by course name works
  - [ ] Search by course code works
  - [ ] Search by teacher name works
- [ ] **Enrollment Progress**
  - [ ] Progress bar shows enrollment
  - [ ] Percentage calculation correct
  - [ ] Shows current/max students
- [ ] **Actions**
  - [ ] Edit button works
  - [ ] Delete button works

#### Grade Entry (`/dashboard/teacher/grades`)

- [ ] **Form Display**
  - [ ] All form fields display correctly
  - [ ] Modal opens on "Add Grade" button
  - [ ] Modal closes on cancel
- [ ] **Form Validation**
  - [ ] Cannot submit empty form
  - [ ] Score cannot exceed max score
  - [ ] Assessment type dropdown works
- [ ] **Submission**
  - [ ] Fill form and submit works
  - [ ] Toast notification appears
  - [ ] Modal closes after submission
  - [ ] Grade appears in table
- [ ] **Statistics**
  - [ ] My Courses count shows
  - [ ] Total Grades Entered updates
  - [ ] Assessment Types count shows

#### Attendance Marking (`/dashboard/teacher/attendance`)

- [ ] **Statistics**
  - [ ] Present count shows
  - [ ] Absent count shows
  - [ ] Late count shows
  - [ ] Half-day count shows
  - [ ] Percentages calculate correctly
- [ ] **Attendance Table**
  - [ ] All students list
  - [ ] Current status shows
  - [ ] Date selector works
- [ ] **Status Buttons**
  - [ ] Present button toggles correctly (green)
  - [ ] Absent button toggles correctly (red)
  - [ ] Late button toggles correctly (yellow)
  - [ ] Half-day button toggles correctly (orange)
- [ ] **Save Functionality**
  - [ ] Save Attendance button works
  - [ ] Toast notification appears
  - [ ] Data persists

---

### 5. Form Validation ✅

#### Student Form Validation

- [ ] **First Name**
  - [ ] Required field validation
  - [ ] Minimum 2 characters
  - [ ] Error message displays
- [ ] **Email**
  - [ ] Required field validation
  - [ ] Valid email format required
  - [ ] Error message displays
- [ ] **Phone**

  - [ ] Required field validation
  - [ ] Valid phone format required
  - [ ] Error message displays

- [ ] **Date of Birth**
  - [ ] Valid date format required
  - [ ] Error message displays

#### Teacher Form Validation

- [ ] Similar validation as student form
- [ ] Years of experience must be positive
- [ ] All required fields checked

#### Course Form Validation

- [ ] Course name required
- [ ] Course code required
- [ ] Teacher assignment required
- [ ] Max students must be > 0

---

### 6. API Integration ✅

#### API Calls

- [ ] Open browser DevTools → Network tab
- [ ] Login and observe network requests
- [ ] Verify requests to correct endpoints
- [ ] Check request headers include Authorization
- [ ] Verify response status codes

#### Error Handling

- [ ] Disconnect API (backend down)
- [ ] Verify error message displays
- [ ] Check console for error details
- [ ] Verify app doesn't crash

#### Token Management

- [ ] Check localStorage for auth_token after login
- [ ] Verify token sent in Authorization header
- [ ] Test token expiry (if implemented)
- [ ] Verify auto-logout on 401 response

---

### 7. UI/UX Tests ✅

#### Responsive Design

- [ ] Test on mobile (320px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] Check all pages are responsive
- [ ] Verify navigation works on mobile

#### Navigation

- [ ] All sidebar links work
- [ ] Breadcrumbs work (if implemented)
- [ ] Back buttons work
- [ ] Logo click returns to dashboard

#### Visual Elements

- [ ] Colors display correctly
- [ ] Icons display correctly
- [ ] Fonts are readable
- [ ] Spacing is consistent
- [ ] Buttons are clickable

#### Performance

- [ ] Pages load quickly (< 2s)
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations

---

## 🧹 Common Issues & Solutions

### Issue: Login fails with 401

**Solution:**

- Verify backend is running
- Check API_URL in `.env.local`
- Verify credentials are correct
- Check backend response in Network tab

### Issue: CORS errors

**Solution:**

- Ensure backend has CORS enabled
- Check Origin header matches backend config
- Verify API_URL is correct

### Issue: Token not persisting

**Solution:**

- Check localStorage is not disabled
- Verify token format in localStorage
- Check browser privacy settings

### Issue: Pages not loading data

**Solution:**

- Check Network tab for API calls
- Verify API responses are correct
- Check console for errors
- Verify user has required permissions

### Issue: Styling issues

**Solution:**

- Clear browser cache (Ctrl+Shift+Del)
- Verify Tailwind CSS is loaded
- Check for CSS conflicts
- Run `npm run build` to check for issues

---

## 📝 Test Cases Summary

### Critical Path Tests

1. ✅ User can login with valid credentials
2. ✅ User is redirected to correct dashboard based on role
3. ✅ User cannot access unauthorized pages
4. ✅ User can logout successfully
5. ✅ Management pages load and display data
6. ✅ Search functionality works on all pages
7. ✅ CRUD operations (Create, Read, Update, Delete) work
8. ✅ Form validation prevents invalid submissions
9. ✅ Toast notifications appear for actions
10. ✅ Pages are responsive on all screen sizes

### Edge Case Tests

- [ ] Very long names/text handling
- [ ] Special characters in search
- [ ] Rapid form submissions
- [ ] Network interruption handling
- [ ] Very large data sets (pagination)
- [ ] Concurrent requests

---

## 🚀 Deployment Testing

### Pre-Deployment Checklist

- [ ] All tests pass
- [ ] No console errors in production build
- [ ] All links work
- [ ] All forms validate correctly
- [ ] API endpoints are correct
- [ ] Environment variables are set
- [ ] Performance is acceptable

### Build Verification

```bash
npm run build
npm run lint
```

### Production Testing

- [ ] Test on production server
- [ ] Test on different browsers
- [ ] Test on different devices
- [ ] Monitor for errors (Sentry/similar)
- [ ] Check performance metrics

---

## 📊 Test Results Template

```markdown
| Feature              | Status | Notes                     |
| -------------------- | ------ | ------------------------- |
| Login                | ✅     | Works correctly           |
| SuperAdmin Dashboard | ✅     | All stats load            |
| Student Management   | ⚠️     | Search has lag            |
| Teacher Management   | ✅     | Works as expected         |
| Form Validation      | ✅     | All validations work      |
| Mobile Responsive    | ✅     | Perfect on mobile         |
| API Integration      | ✅     | All calls working         |
| Error Handling       | ✅     | Errors handled gracefully |
```

---

## 🔗 Testing Resources

- [Testing Library](https://testing-library.com/)
- [Vitest](https://vitest.dev/)
- [Cypress](https://www.cypress.io/)
- [Playwright](https://playwright.dev/)

---

**Last Updated:** December 3, 2025
**Version:** 1.0.0

---

For any testing questions or issues, please contact the development team.
