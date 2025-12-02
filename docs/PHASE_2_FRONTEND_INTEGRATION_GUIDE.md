# Phase 2 Frontend Integration Guide

**Date**: December 2, 2025  
**Status**: 🚀 Ready for Implementation  
**Backend API**: http://localhost:5000/api/v1

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [API Services Created](#api-services-created)
3. [Redux Setup](#redux-setup)
4. [Authentication & Guards](#authentication--guards)
5. [Integration Steps](#integration-steps)
6. [Component Examples](#component-examples)
7. [Testing Checklist](#testing-checklist)

---

## 📁 Project Structure

### New Files Created for Phase 2

```
frontend/full-version/src/
├── services/
│   ├── api.js (existing)
│   ├── analyticsService.js ✅ NEW
│   ├── messagingService.js ✅ NEW
│   ├── reportingService.js ✅ NEW
│   ├── courseContentService.js ✅ NEW
│   ├── announcementsService.js ✅ NEW
│   └── authService.js ✅ NEW
├── redux-store/
│   └── slices/
│       ├── email.js (existing)
│       ├── chat.js (existing)
│       ├── kanban.js (existing)
│       ├── calendar.js (existing)
│       ├── analytics.js ✅ NEW
│       ├── messaging.js ✅ NEW
│       ├── announcements.js ✅ NEW
│       ├── courseContent.js ✅ NEW
│       └── reporting.js ✅ NEW
├── contexts/
│   └── AuthContext.jsx ✅ NEW
└── views/ (to be created)
    ├── analytics/
    ├── messaging/
    ├── reporting/
    ├── courseContent/
    └── announcements/
```

---

## 🔧 API Services Created

### 1. **analyticsService.js**

Endpoints:

- `getEnrollmentMetrics(branchId)`
- `getAttendanceMetrics(branchId, startDate, endDate)`
- `getFeeMetrics(branchId)`
- `getTeacherMetrics(branchId, teacherId)`
- `getDashboardSummary(branchId)`
- `getTrendAnalysis(metricType, branchId, days)`

### 2. **messagingService.js**

Endpoints:

- `sendMessage(payload)`
- `getInbox(userId, limit, offset)`
- `getSentMessages(userId, limit, offset)`
- `getConversation(userId, otherUserId, limit)`
- `markAsRead(messageId)`
- `markMultipleAsRead(messageIds)`
- `deleteMessage(messageId)`
- `searchMessages(userId, searchTerm, limit)`
- `getUnreadCount(userId)`

### 3. **reportingService.js**

Endpoints:

- `generateStudentProgressReport(payload)`
- `generateTeacherPerformanceReport(payload)`
- `generateFeeCollectionReport(payload)`
- `generateAttendanceReport(payload)`
- `getAllReports(branchId, limit, offset)`
- `getReport(reportId)`
- `deleteReport(reportId)`
- `downloadReport(downloadUrl)`

### 4. **courseContentService.js**

Endpoints:

- `uploadContent(payload)`
- `getCourseContent(courseId, limit, offset)`
- `getPublishedContent(courseId, limit, offset)`
- `getContentByType(courseId, contentType, limit, offset)`
- `getPopularContent(courseId, limit)`
- `updateContent(contentId, payload)`
- `deleteContent(contentId)`
- `trackView(contentId)`
- `setPinned(contentId, isPinned)`
- `searchContent(courseId, searchTerm, limit)`

### 5. **announcementsService.js**

Endpoints:

- `createAnnouncement(payload)`
- `getAnnouncements(courseId, limit, offset)`
- `getAnnouncementsByPriority(courseId, priority, limit)`
- `getAnnouncementsByType(courseId, type, limit)`
- `getPinnedAnnouncements(courseId)`
- `getUpcomingAnnouncements(courseId, limit)`
- `getAnnouncementStatistics(courseId)`
- `searchAnnouncements(courseId, searchTerm, limit)`
- `updateAnnouncement(announcementId, payload)`
- `deleteAnnouncement(announcementId)`
- `setPinned(announcementId, isPinned)`
- `trackView(announcementId)`

### 6. **authService.js**

Methods:

- `login(credentials)` - Login with email/password
- `logout()` - Clear session
- `getCurrentUser()` - Get stored user
- `getToken()` - Get JWT token
- `isAuthenticated()` - Check auth status
- `isTokenExpired()` - Check token expiry (60 min)
- `refreshToken()` - Refresh token if needed

---

## 📦 Redux Setup

### Redux Slices Created

All slices follow Redux Toolkit pattern with async thunks:

#### **analyticsSlice**

State structure:

```javascript
{
  enrollment: { data, loading, error },
  attendance: { data, loading, error },
  fees: { data, loading, error },
  teachers: { data, loading, error },
  dashboard: { data, loading, error },
  trends: { data, loading, error }
}
```

#### **messagingSlice**

State structure:

```javascript
{
  inbox: { data: [], pagination, loading, error },
  sent: { data: [], pagination, loading, error },
  conversation: { data: [], loading, error },
  unreadCount: { data: 0, loading, error },
  searchResults: { data: [], loading, error },
  selectedMessage: null
}
```

#### **announcementsSlice**

State structure:

```javascript
{
  announcements: { data: [], pagination, loading, error },
  pinned: { data: [], loading, error },
  upcoming: { data: [], loading, error },
  statistics: { data, loading, error },
  searchResults: { data: [], loading, error },
  selectedAnnouncement: null
}
```

#### **courseContentSlice**

State structure:

```javascript
{
  content: { data: [], pagination, loading, error },
  published: { data: [], pagination, loading, error },
  popular: { data: [], loading, error },
  byType: { data: [], pagination, loading, error },
  searchResults: { data: [], loading, error },
  selectedContent: null
}
```

#### **reportingSlice**

State structure:

```javascript
{
  reports: { data: [], pagination, loading, error },
  currentReport: { data, loading, error },
  generatedReports: {
    studentProgress: { data, loading, error },
    teacherPerformance: { data, loading, error },
    feeCollection: { data, loading, error },
    attendance: { data, loading, error }
  }
}
```

---

## 🔐 Authentication & Guards

### AuthContext.jsx

**Features**:

- User state management
- Token storage/retrieval
- Token expiry checking (60 minutes)
- Login/logout handlers
- Auto-redirect on token expiry

**Usage**:

```jsx
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Wrap your app
<AuthProvider>
  <YourApp />
</AuthProvider>;

// Use in components
function MyComponent() {
  const { user, isAuthenticated, handleLogin, handleLogout } = useAuth();

  if (!isAuthenticated) {
    return <div>Not logged in</div>;
  }

  return <div>Welcome, {user.email}</div>;
}
```

### Protected Routes

```jsx
import { withAuthGuard } from "@/contexts/AuthContext";

const Dashboard = () => {
  return <div>Protected Dashboard</div>;
};

export default withAuthGuard(Dashboard);
```

---

## 🚀 Integration Steps

### Step 1: Update Redux Store

In `src/redux-store/index.js`:

```javascript
import analyticsReducer from "@/redux-store/slices/analytics";
import messagingReducer from "@/redux-store/slices/messaging";
import announcementsReducer from "@/redux-store/slices/announcements";
import courseContentReducer from "@/redux-store/slices/courseContent";
import reportingReducer from "@/redux-store/slices/reporting";

export const store = configureStore({
  reducer: {
    // existing reducers...
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

### Step 2: Setup Auth Provider

Wrap your app with AuthProvider in layout:

```jsx
import { AuthProvider } from "@/contexts/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

### Step 3: Create Views/Components

Create view directories:

- `src/views/analytics/` - Dashboard with charts
- `src/views/messaging/` - Inbox, compose, conversation
- `src/views/announcements/` - Board, create, filters
- `src/views/courseContent/` - Upload, gallery, search
- `src/views/reporting/` - Generate, list, download

### Step 4: Add Menu Items

Update navigation menus in:

- `src/@menu/vertical-menu/` - Add Phase 2 items
- `src/@menu/horizontal-menu/` - Add Phase 2 items

Example menu structure:

```javascript
{
  label: 'Analytics',
  icon: 'mdi:chart-box',
  href: '/analytics/dashboard'
},
{
  label: 'Messaging',
  icon: 'mdi:email',
  href: '/messaging/inbox'
},
// ... more Phase 2 items
```

### Step 5: Setup Environment Variables

Add to `.env` or `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_BRANCH_ID=your-branch-id
```

---

## 💻 Component Examples

### Example 1: Analytics Dashboard Component

```jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardSummary } from "@/redux-store/slices/analytics";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { dashboard } = useSelector((state) => state.analyticsReducer);

  useEffect(() => {
    if (user?.branchId) {
      dispatch(fetchDashboardSummary(user.branchId));
    }
  }, [user, dispatch]);

  if (dashboard.loading) return <div>Loading...</div>;
  if (dashboard.error) return <div>Error: {dashboard.error}</div>;

  const { data } = dashboard;

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {data && (
        <div>
          <p>Total Students: {data.summary?.totalStudents}</p>
          <p>Attendance: {data.kpis?.averageAttendance}</p>
          <p>Fee Collection: {data.kpis?.feeCollectionRate}</p>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Messaging Component

```jsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchInbox, sendMessage } from "@/redux-store/slices/messaging";
import { useAuth } from "@/contexts/AuthContext";

export default function Inbox() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { inbox } = useSelector((state) => state.messagingReducer);
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchInbox({ userId: user.id }));
    }
  }, [user, dispatch]);

  const handleSendMessage = async (formData) => {
    await dispatch(sendMessage(formData));
    setShowCompose(false);
  };

  return (
    <div>
      <button onClick={() => setShowCompose(!showCompose)}>
        Compose Message
      </button>

      {showCompose && <ComposeForm onSend={handleSendMessage} />}

      <div>
        {inbox.loading && <p>Loading messages...</p>}
        {inbox.error && <p>Error: {inbox.error}</p>}
        {inbox.data.map((message) => (
          <div key={message.id}>
            <h3>{message.subject}</h3>
            <p>{message.message_body}</p>
            <small>{message.created_at}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Announcements Component

```jsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnnouncements,
  fetchAnnouncementStatistics,
  createAnnouncement,
} from "@/redux-store/slices/announcements";

export default function Announcements({ courseId }) {
  const dispatch = useDispatch();
  const { announcements, statistics } = useSelector(
    (state) => state.announcementsReducer
  );
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "normal",
    announcementType: "general",
  });

  useEffect(() => {
    dispatch(fetchAnnouncements({ courseId }));
    dispatch(fetchAnnouncementStatistics(courseId));
  }, [courseId, dispatch]);

  const handleCreate = async () => {
    await dispatch(
      createAnnouncement({
        courseId,
        ...formData,
      })
    );
    setFormData({
      title: "",
      content: "",
      priority: "normal",
      announcementType: "general",
    });
  };

  return (
    <div>
      <div>
        <h2>Create Announcement</h2>
        <input
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <textarea
          placeholder="Content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
        />
        <button onClick={handleCreate}>Create</button>
      </div>

      <div>
        <h3>Statistics</h3>
        {statistics.data && (
          <p>Total Announcements: {statistics.data.totalAnnouncements}</p>
        )}
      </div>

      <div>
        {announcements.data.map((ann) => (
          <div key={ann.id}>
            <h4>{ann.title}</h4>
            <p>{ann.content}</p>
            <span>{ann.priority}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Testing Checklist

### Authentication Tests

- [ ] Login with valid credentials (admin1/password123)
- [ ] Login with invalid credentials
- [ ] Token stored in localStorage
- [ ] Token validation on mount
- [ ] Auto-logout on token expiry
- [ ] Protected routes redirect to login
- [ ] User data displays correctly

### Analytics Tests

- [ ] Enrollment metrics load
- [ ] Attendance metrics with date range
- [ ] Fee metrics display correctly
- [ ] Teacher metrics list works
- [ ] Dashboard summary aggregates data
- [ ] Trend analysis shows charts
- [ ] Error handling for failed requests

### Messaging Tests

- [ ] Send message successfully
- [ ] Inbox loads messages with pagination
- [ ] Mark single message as read
- [ ] Mark multiple messages as read
- [ ] Search messages by keyword
- [ ] Get unread count
- [ ] Delete message functionality
- [ ] Conversation thread loads

### Announcements Tests

- [ ] Create announcement
- [ ] List announcements with pagination
- [ ] Filter by priority
- [ ] Filter by type
- [ ] Get pinned announcements
- [ ] Pin/unpin announcement
- [ ] Track view count
- [ ] Search announcements
- [ ] Get statistics

### Course Content Tests

- [ ] Upload content
- [ ] List course content
- [ ] Get published content only
- [ ] Filter by content type
- [ ] Get popular content
- [ ] Pin/unpin content
- [ ] Track content view
- [ ] Update content metadata
- [ ] Search content
- [ ] Delete content

### Reporting Tests

- [ ] Generate student progress report
- [ ] Generate teacher performance report
- [ ] Generate fee collection report
- [ ] Generate attendance report
- [ ] List all reports
- [ ] Download report file
- [ ] Delete report
- [ ] Error handling for generation failures

---

## 🔍 Environment Configuration

### Frontend .env Configuration

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Default Branch (can be overridden by user)
NEXT_PUBLIC_BRANCH_ID=09746aaa-d990-4120-875a-a5477ccdb8ef

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MESSAGING=true
NEXT_PUBLIC_ENABLE_ANNOUNCEMENTS=true
NEXT_PUBLIC_ENABLE_COURSE_CONTENT=true
NEXT_PUBLIC_ENABLE_REPORTING=true
```

---

## 📊 API Response Patterns

All services follow consistent response patterns:

### Success Response

```javascript
{
  success: true,
  message: "Operation successful",
  data: { /* actual data */ },
  pagination: { limit, offset, total, pages } // if applicable
}
```

### Error Response

```javascript
{
  success: false,
  message: "Error description",
  status: 400,
  data: null
}
```

---

## 🎯 Next Steps

### Immediate (1-2 days)

1. Update Redux store with new slices
2. Setup AuthProvider in layout
3. Create login page component
4. Test authentication flow

### Short Term (3-5 days)

1. Create Analytics dashboard pages
2. Build Messaging UI components
3. Implement Announcements module
4. Create Course Content upload form

### Medium Term (1 week)

1. Build Reporting interface
2. Add charts using ApexCharts
3. Implement pagination controls
4. Add error boundaries

### Testing (ongoing)

1. Run through testing checklist
2. Fix any API integration issues
3. Optimize performance
4. Deploy to staging

---

## 🆘 Troubleshooting

### Common Issues

**Issue**: "Cannot find module 'next/babel'"

- **Solution**: This is an ESLint config issue, not a code issue. The services will work fine.

**Issue**: Token not found in localStorage

- **Solution**: Make sure login was successful and token is being stored

**Issue**: 401 Unauthorized on API calls

- **Solution**: Check that Authorization header is being sent with Bearer token

**Issue**: API returns empty data

- **Solution**: Verify branchId is correct and database has seeded data

---

## 📞 Support

For API documentation details, refer to:

- `API_DOCUMENTATION_DETAILED.md` - Complete API reference
- `API_TESTING_LIVE_COMMANDS.md` - Test commands and examples
- `API_TESTING_RESULTS.md` - Actual test results

---

**Created**: December 2, 2025  
**Status**: 🚀 Ready for Frontend Development  
**Version**: 1.0
