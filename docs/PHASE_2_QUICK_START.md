# Phase 2 Quick Start Guide for Developers

**Get up and running with Phase 2 features in 15 minutes!**

---

## 🚀 Quick Start (5 minutes)

### 1. Start Development Server

```bash
cd backend
npm run dev
```

**Output:**

```bash
✓ Server running on http://localhost:5000
✓ API Docs: http://localhost:5000/api/docs
```

### 2. Get Authentication Token

First, authenticate to get a JWT token:

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@koolhub.com",
    "password": "your-password"
  }'
```

### 3. Test Analytics Endpoint

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/v1/analytics/dashboard?branchId=branch123"
```

---

## 📊 Phase 2 Endpoints Overview

### Analytics

- GET `/api/v1/analytics/enrollment` - Enrollment metrics
- GET `/api/v1/analytics/attendance` - Attendance data
- GET `/api/v1/analytics/fees` - Fee metrics
- GET `/api/v1/analytics/teachers` - Teacher performance
- GET `/api/v1/analytics/dashboard` - Dashboard summary
- GET `/api/v1/analytics/trends/:metricType` - Trend analysis

### Messaging

- POST `/api/v1/messages/send` - Send messages
- GET `/api/v1/messages/inbox` - Get inbox
- GET `/api/v1/messages/sent` - Get sent messages
- GET `/api/v1/messages/conversation` - Get conversations
- GET `/api/v1/messages/unread-count` - Unread count

### Reporting

- GET `/api/v1/reports/student-performance` - Performance reports
- GET `/api/v1/reports/attendance-summary` - Attendance reports
- GET `/api/v1/reports/financial-summary` - Financial reports
- GET `/api/v1/reports/teacher-evaluation` - Teacher reports

### Course Content

- POST `/api/v1/course-content/upload` - Upload content
- GET `/api/v1/course-content/course/:courseId` - Get course content
- GET `/api/v1/course-content/search` - Search content

### Announcements

- POST `/api/v1/announcements` - Create announcement
- GET `/api/v1/announcements` - List announcements
- GET `/api/v1/announcements/:courseId` - Course announcements

---

## 🎯 Common Tasks

### Send a Message

```bash
curl -X POST http://localhost:5000/api/v1/messages/send \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "user-1",
    "recipientId": "user-2",
    "subject": "Test",
    "messageBody": "Hello!"
  }'
```

### Check Inbox

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/v1/messages/inbox?userId=user-2"
```

### Get Performance Report

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/v1/reports/student-performance?branchId=branch123"
```

---

## 📚 Documentation Files

- **PHASE_2_QUICK_START.md** - This file
- **PHASE_2_FINAL_SUMMARY.md** - Complete overview
- **PHASE_2_API_REFERENCE.md** - Detailed API reference
- **PHASE_2_DEPLOYMENT_GUIDE.md** - Deployment instructions
- **PHASE_2_COMPLETION_REPORT.md** - Feature documentation

---

## 🎉 You're Ready!

All Phase 2 features are implemented and production-ready. Start developing!

For detailed information, see the other documentation files.
