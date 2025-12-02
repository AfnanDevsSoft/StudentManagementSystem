# Phase 2 - Quick Testing & Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Your Backend

```bash
cd backend
npm run dev
```

Expected output:

```
✅ Server running on http://localhost:5000
```

### Step 2: Start Your Frontend

```bash
cd frontend/full-version
npm run dev
```

Expected output:

```
✅ Frontend running on http://localhost:3000
```

### Step 3: Login to Dashboard

1. Navigate to `http://localhost:3000`
2. Login with your credentials
3. You should see the main dashboard

---

## 🧪 Testing Analytics Component (10 Minutes)

### Test 1: Verify Dashboard Loads

1. Click on **Analytics Dashboard** in sidebar
2. Should see 4 metric cards loading
3. Wait for data to appear (~2 seconds)
4. Verify all cards display data

### Test 2: Verify Enrollment Data

```bash
# In backend terminal
curl -X GET "http://localhost:5000/api/v1/analytics/enrollment?branchId=branch-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected Response:

```json
{
  "success": true,
  "message": "Enrollment metrics calculated",
  "data": {
    "totalEnrollments": 156,
    "enrollmentsByGrade": [...]
  }
}
```

### Test 3: Test Refresh Button

1. On Analytics Dashboard, click **Refresh** button
2. Should see loading spinners
3. Data should update
4. No errors should appear

---

## 💬 Testing Messaging Component (5 Minutes)

### Test 1: Open Messaging

1. Click **Messaging Inbox** in sidebar
2. Should see list of messages
3. Click on a message to view details

### Test 2: Test Search

1. Type in search box
2. Messages should filter in real-time
3. Clear search to see all messages

### Test 3: Mark as Read

1. Click on unread message
2. Message should be marked as read
3. Unread count should decrease

---

## 📢 Testing Announcements (5 Minutes)

### Test 1: View All Announcements

1. Click **Announcements Board** in sidebar
2. Should see list of announcements
3. Click on announcement to expand details

### Test 2: Filter by Priority

1. Click priority filter
2. Select "Urgent"
3. Should only show urgent announcements

### Test 3: Search Announcements

1. Type in search box
2. Announcements should filter
3. Verify matching results

---

## 📚 Testing Course Content (5 Minutes)

### Test 1: View All Content

1. Click **Course Content Management** in sidebar
2. Should see content gallery
3. Verify different content types visible

### Test 2: Filter by Type

1. Click type filter chips
2. Select "Video"
3. Should only show video content

### Test 3: Pin Content

1. Click star icon on content item
2. Should be pinned to top
3. Click again to unpin

---

## 📄 Testing Reports (5 Minutes)

### Test 1: View Reports

1. Click **Reporting Interface** in sidebar
2. Should see list of reports
3. Click report to view details

### Test 2: Generate Report

1. Click **Generate Report** button
2. Select report type (e.g., Student Progress)
3. Click Generate
4. Should see report in list with status

### Test 3: Download Report

1. Click download icon on completed report
2. File should download
3. Verify file format (PDF)

---

## 🧪 Running Automated Tests (2 Minutes)

### Option 1: Browser Console

```javascript
// 1. Open DevTools (F12)
// 2. Go to Console tab
// 3. Copy and paste:

import { runComprehensiveTests } from "http://localhost:3000/src/tests/integrationTests.js";
await runComprehensiveTests();
```

### Option 2: Create Test Page

Create file: `frontend/full-version/src/app/en/views/phase2/testing/page.jsx`

```javascript
"use client";
import { runComprehensiveTests } from "@/tests/integrationTests";
import { Button, Box, Typography, Paper } from "@mui/material";
import { useState } from "react";

export default function TestingPage() {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    const results = await runComprehensiveTests();
    setTestResults(results);
    setIsRunning(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Phase 2 Integration Tests
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={handleRunTests}
        disabled={isRunning}
      >
        {isRunning ? "Running Tests..." : "Run All Tests"}
      </Button>

      {testResults && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" color="success.main">
            Tests Complete ✅
          </Typography>
          <Typography>Check browser console for detailed results</Typography>
        </Paper>
      )}
    </Box>
  );
}
```

Then navigate to: `http://localhost:3000/en/views/phase2/testing`

---

## 🔍 Troubleshooting

### Issue: "API Error: 401 Unauthorized"

**Solution**:

1. Check if token is expired
2. Login again
3. Check browser localStorage for token

### Issue: "Component not loading / blank page"

**Solution**:

1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify backend is running

### Issue: "Slow performance"

**Solution**:

1. Check Network tab for slow API calls
2. Verify browser isn't opening many tabs
3. Try clearing cache (Ctrl+Shift+Delete)
4. Test on different network speed

### Issue: "Redux state not updating"

**Solution**:

1. Install Redux DevTools extension
2. Check if actions are dispatched
3. Verify reducers are connected in store
4. Check for action type typos

---

## 📊 Performance Metrics to Check

### Browser DevTools - Performance Tab

1. **First Contentful Paint (FCP)**: < 2 seconds ✅
2. **Largest Contentful Paint (LCP)**: < 4 seconds ✅
3. **Cumulative Layout Shift (CLS)**: < 0.1 ✅

### Steps to Measure:

1. Open DevTools (F12)
2. Go to Performance tab
3. Click circle to start recording
4. Navigate to Analytics Dashboard
5. Let it fully load
6. Click stop to see results

---

## 🔐 Test Data You Can Use

### Test Branch IDs:

- `branch-001`
- `branch-002`
- `branch-003`

### Test User IDs:

- `user-001`
- `user-002`
- `user-003`

### Test Course IDs:

- `course-001`
- `course-002`
- `course-003`

---

## 📱 API Testing Commands

### Get Enrollment Metrics

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/enrollment?branchId=branch-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Attendance Metrics

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/attendance?branchId=branch-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Dashboard Summary

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/dashboard?branchId=branch-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Messages (Inbox)

```bash
curl -X GET "http://localhost:5000/api/v1/messages/inbox?userId=user-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Send Message

```bash
curl -X POST "http://localhost:5000/api/v1/messages/send" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "user-002",
    "subject": "Test Message",
    "body": "This is a test message"
  }'
```

---

## ✅ Testing Checklist

### Analytics Dashboard

- [ ] Dashboard loads without errors
- [ ] All 4 metric cards display data
- [ ] Refresh button works
- [ ] Data updates correctly
- [ ] No console errors

### Messaging

- [ ] Inbox loads with messages
- [ ] Search functionality works
- [ ] Can mark messages as read
- [ ] Unread count updates

### Announcements

- [ ] All announcements display
- [ ] Priority filter works
- [ ] Type filter works
- [ ] Search functionality works
- [ ] Can pin/unpin announcements

### Course Content

- [ ] Content gallery displays
- [ ] Type filters work correctly
- [ ] Can pin/unpin content
- [ ] Search functionality works

### Reports

- [ ] Reports list displays
- [ ] Can generate new reports
- [ ] Report status updates
- [ ] Can download completed reports

### Performance

- [ ] Page loads in < 3 seconds
- [ ] Components render smoothly
- [ ] No memory leaks
- [ ] No console errors
- [ ] No broken UI

---

## 🎯 What's Working Now

✅ **Backend**: All 6 API endpoints for analytics  
✅ **Frontend**: All 5 Phase 2 components  
✅ **Redux**: All 5 state slices connected  
✅ **Auth**: JWT authentication with token management  
✅ **Navigation**: Phase 2 menu items added  
✅ **API Services**: All endpoints wrapped with axios  
✅ **Error Handling**: Basic error alerts implemented  
✅ **Test Data**: Mock data generators ready

---

## 🔄 Next Steps

1. **Test with real data**

   - Replace test data generators with actual API calls
   - Verify data binding works correctly
   - Check error handling

2. **Performance optimization**

   - Monitor page load time
   - Optimize images and assets
   - Implement code splitting

3. **Error handling**

   - Add error boundaries
   - Implement toast notifications
   - Add retry logic

4. **Production deployment**
   - Build production bundle
   - Deploy to staging
   - Run final tests
   - Deploy to production

---

## 📞 Quick Support

| Issue                 | Quick Fix                           |
| --------------------- | ----------------------------------- |
| Blank Page            | Clear cache, reload                 |
| API Error             | Check token, restart backend        |
| Slow Loading          | Check network, restart both servers |
| Redux Not Updating    | Check DevTools, verify actions      |
| Component Not Showing | Check console, verify routes        |

---

**Ready to test?** Start with Step 1 above and follow the quick start guide! 🚀
