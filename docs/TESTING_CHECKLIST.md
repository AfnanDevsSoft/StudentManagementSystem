# ✅ Testing Checklist

## Pre-Testing Setup
- [ ] Backend running on http://localhost:3000
- [ ] Frontend running on http://localhost:3001 or 3002
- [ ] Database populated with test data (20+ records in each table)
- [ ] Browser DevTools open (F12)
- [ ] Network tab visible in DevTools

---

## Page Loading Tests

### Dashboard Page
- [ ] Navigate to `/en/dashboards/academy`
- [ ] Page loads without errors
- [ ] SchoolStatsCard component visible
- [ ] 4 stat cards display (Students, Teachers, Courses, Branches)
- [ ] All stats show correct numbers (match database)
- [ ] No console errors

### Students Page
- [ ] Navigate to `/en/apps/academy/students`
- [ ] StudentsList component loads
- [ ] Student records display in a table
- [ ] At least 5 students visible
- [ ] Table has columns: ID, Name, Email, etc.
- [ ] No console errors
- [ ] Check Network tab: API call to `/api/v1/students` succeeds (200 status)

### Teachers Page
- [ ] Navigate to `/en/apps/academy/teachers`
- [ ] TeachersList component loads
- [ ] Teacher records display in table
- [ ] At least 5 teachers visible
- [ ] Network call: `/api/v1/teachers` returns 200 status
- [ ] No console errors

### Courses Page
- [ ] Navigate to `/en/apps/academy/courses`
- [ ] CoursesList component loads
- [ ] Course records display in table
- [ ] At least 5 courses visible
- [ ] Network call: `/api/v1/courses` returns 200 status
- [ ] No console errors

### Branches Page
- [ ] Navigate to `/en/apps/academy/branches`
- [ ] BranchesList component loads
- [ ] Branch records display in table
- [ ] At least 5 branches visible
- [ ] Network call: `/api/v1/branches` returns 200 status
- [ ] No console errors

---

## Navigation Tests

### Vertical Menu (Sidebar)
- [ ] Open page on mobile or tablet width
- [ ] Hamburger menu visible
- [ ] Click hamburger menu → menu opens
- [ ] Academy submenu visible
- [ ] Click "Students" link → navigates to `/en/apps/academy/students`
- [ ] Click "Teachers" link → navigates to `/en/apps/academy/teachers`
- [ ] Click "Courses" link → navigates to `/en/apps/academy/courses`
- [ ] Click "Branches" link → navigates to `/en/apps/academy/branches`
- [ ] No console errors during navigation

### Horizontal Menu (Top Bar)
- [ ] Open page on desktop width
- [ ] Top navigation bar visible
- [ ] Hover over "Academy" → dropdown opens
- [ ] Dropdown shows: Students, Teachers, Courses, Branches
- [ ] Click "Students" → navigates correctly
- [ ] Click "Teachers" → navigates correctly
- [ ] Click "Courses" → navigates correctly
- [ ] Click "Branches" → navigates correctly
- [ ] No console errors

### Dashboard Link
- [ ] Navigate using menu: Academy → Dashboard
- [ ] Page loads: `/en/dashboards/academy`
- [ ] SchoolStatsCard visible
- [ ] Stats display correctly
- [ ] No console errors

---

## API Integration Tests

### Dashboard Statistics API Calls
- [ ] Open DevTools → Network tab
- [ ] Navigate to Dashboard
- [ ] Verify these API calls in Network tab:
  - [ ] GET `/api/v1/students?page=1&limit=1` → Status 200
  - [ ] GET `/api/v1/teachers?page=1&limit=1` → Status 200
  - [ ] GET `/api/v1/courses?page=1&limit=1` → Status 200
  - [ ] GET `/api/v1/branches?page=1&limit=1` → Status 200
- [ ] Response headers include Content-Type: application/json
- [ ] Response body contains pagination.total field
- [ ] Stats update after API calls complete

### Students List API Call
- [ ] Open DevTools → Network tab
- [ ] Navigate to Students page
- [ ] Verify API call: GET `/api/v1/students?page=1&limit=10` (or similar)
- [ ] Status should be 200
- [ ] Response contains array of student records
- [ ] Response headers correct
- [ ] No 404 or 500 errors

### Teachers List API Call
- [ ] Same as Students List but for Teachers

### Courses List API Call
- [ ] Same as Students List but for Courses

### Branches List API Call
- [ ] Same as Students List but for Branches

---

## Loading State Tests

### Dashboard Loading
- [ ] Navigate to Dashboard
- [ ] Watch for loading spinner (should appear briefly)
- [ ] Spinner disappears when stats load
- [ ] Stats display after spinner disappears
- [ ] No longer than 2 seconds total loading time

### Student List Loading
- [ ] Navigate to Students page
- [ ] Watch for loading indicator
- [ ] Table appears after loading completes
- [ ] No longer than 2 seconds total loading time

---

## Error Handling Tests

### API Error Scenario (Dashboard)
- [ ] Stop backend server (Ctrl+C)
- [ ] Navigate to Dashboard
- [ ] After 5-10 seconds, error message should display
- [ ] Error message is readable and helpful
- [ ] No white screen of death
- [ ] Console should show error details (check DevTools)
- [ ] Restart backend and refresh page → works again

### API Error Scenario (Student List)
- [ ] Stop backend server
- [ ] Navigate to Students page
- [ ] Error message displays (or empty list with error)
- [ ] Application doesn't crash
- [ ] Restart backend → page works again

---

## CRUD Operations Tests

### Create New Student
- [ ] On Students page, look for "Create" or "Add New" button
- [ ] Click button → form opens (modal or new page)
- [ ] Fill form with test data
- [ ] Click Save/Submit
- [ ] API call: POST `/api/v1/students` → Status 201
- [ ] Success message displays
- [ ] New student appears in list
- [ ] Page refreshes and new record persists

### Read Student
- [ ] In Students list, click on a student row
- [ ] Student detail page/modal opens
- [ ] All student information displays correctly
- [ ] Data matches database values

### Update Student
- [ ] On Students list, click Edit button for a record
- [ ] Edit form opens with current values
- [ ] Change one field
- [ ] Click Save
- [ ] API call: PUT `/api/v1/students/{id}` → Status 200
- [ ] Success message displays
- [ ] Changes visible in list immediately
- [ ] Refresh page → changes persisted

### Delete Student
- [ ] On Students list, click Delete button for a record
- [ ] Confirmation dialog appears
- [ ] Confirm deletion
- [ ] API call: DELETE `/api/v1/students/{id}` → Status 200 or 204
- [ ] Success message displays
- [ ] Record removed from list
- [ ] Refresh page → record still deleted

### Repeat for Teachers, Courses, Branches
- [ ] Create new teacher → verify in database
- [ ] Create new course → verify in database
- [ ] Create new branch → verify in database
- [ ] Update each type → verify changes
- [ ] Delete each type → verify removal

---

## Pagination Tests

### Student List Pagination
- [ ] Navigate to Students page
- [ ] Verify pagination controls visible (if more than 10 records)
- [ ] Click "Next" button → list updates to next page
- [ ] API call shows different pagination parameters
- [ ] Click "Previous" → returns to first page
- [ ] Click page number → jumps to that page
- [ ] Row count selector: change items per page → list updates

### Repeat for Teachers, Courses, Branches
- [ ] Teachers pagination works
- [ ] Courses pagination works
- [ ] Branches pagination works

---

## Search/Filter Tests

### Student List Search
- [ ] Navigate to Students page
- [ ] Look for search input field
- [ ] Type student name in search
- [ ] Results filter (if implemented)
- [ ] Type email → filters by email
- [ ] Clear search → shows all students again

### Repeat for Teachers, Courses, Branches (if search implemented)

---

## Responsive Design Tests

### Mobile View (< 600px)
- [ ] Hamburger menu appears
- [ ] Vertical menu works correctly
- [ ] Tables scroll horizontally
- [ ] Stats stack vertically
- [ ] All content readable (no text overflow)
- [ ] Buttons clickable (not too small)

### Tablet View (600px - 1024px)
- [ ] Layout adapts to width
- [ ] Menu behavior appropriate
- [ ] Tables display correctly
- [ ] Stats layout adjusted
- [ ] All elements accessible

### Desktop View (> 1024px)
- [ ] Horizontal menu displays
- [ ] Full width content visible
- [ ] All features accessible
- [ ] Layout looks professional

---

## Theme Tests

### Dark Mode
- [ ] Toggle dark mode (if available)
- [ ] All text readable
- [ ] Tables visible in dark theme
- [ ] Menu items visible
- [ ] Stats cards visible
- [ ] Forms functional

### Light Mode
- [ ] Toggle light mode
- [ ] All text readable
- [ ] Professional appearance
- [ ] Good contrast

---

## Console Error Tests

### No Console Errors
- [ ] Open DevTools → Console tab
- [ ] Navigate through all pages
- [ ] No red error messages
- [ ] No yellow warnings related to your code
- [ ] Network requests show correct status codes
- [ ] No undefined component errors

---

## Performance Tests

### Page Load Time
- [ ] Dashboard: < 3 seconds
- [ ] Students list: < 3 seconds
- [ ] Teachers list: < 3 seconds
- [ ] Courses list: < 3 seconds
- [ ] Branches list: < 3 seconds

### API Response Time
- [ ] Student list API: < 1 second
- [ ] Teacher list API: < 1 second
- [ ] Course list API: < 1 second
- [ ] Branch list API: < 1 second

---

## Integration Tests

### Full Flow: Dashboard → Students → Create → View → Edit → Delete
- [ ] Start at Dashboard, see statistics
- [ ] Click Students link → list displays
- [ ] Click Create Student → form opens
- [ ] Fill form, save → new student in list
- [ ] Click student to view details
- [ ] Click edit → form opens with values
- [ ] Change data, save → changes reflect
- [ ] Click delete → confirmation
- [ ] Confirm → student removed
- [ ] Dashboard stats updated (total decreased)

### Full Flow: Teachers
- [ ] Repeat above flow for Teachers

### Full Flow: Courses
- [ ] Repeat above flow for Courses

### Full Flow: Branches
- [ ] Repeat above flow for Branches

---

## Cross-Browser Tests

### Chrome
- [ ] All tests pass on latest Chrome
- [ ] Performance acceptable
- [ ] No console errors

### Firefox
- [ ] All tests pass on latest Firefox
- [ ] Performance acceptable
- [ ] No console errors

### Safari
- [ ] All tests pass on Safari
- [ ] Performance acceptable
- [ ] No console errors

---

## Final Verification

### Deployment Readiness
- [ ] All pages load without errors
- [ ] All navigation links work
- [ ] All CRUD operations functional
- [ ] API integration confirmed
- [ ] Error handling works
- [ ] Responsive design verified
- [ ] No console errors
- [ ] Database updates reflected in UI
- [ ] Performance acceptable

---

## Test Results Summary

| Test Category | Pass | Fail | Notes |
|---------------|------|------|-------|
| Page Loading | ⬜ | ⬜ | |
| Navigation | ⬜ | ⬜ | |
| API Integration | ⬜ | ⬜ | |
| CRUD Operations | ⬜ | ⬜ | |
| Pagination | ⬜ | ⬜ | |
| Search/Filter | ⬜ | ⬜ | |
| Responsive Design | ⬜ | ⬜ | |
| Theme | ⬜ | ⬜ | |
| Console | ⬜ | ⬜ | |
| Performance | ⬜ | ⬜ | |

**Legend:** ⬜ = Not tested, ✅ = Pass, ❌ = Fail

---

**Estimated Testing Time: 1-2 hours**

**Status: Ready for Testing! 🚀**
