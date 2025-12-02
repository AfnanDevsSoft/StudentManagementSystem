# Complete Phase 2 API Documentation with Examples

**Date**: December 2, 2025  
**API Version**: v1  
**Base URL**: `http://localhost:5000/api/v1`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Analytics API](#analytics-api)
3. [Messaging API](#messaging-api)
4. [Reporting API](#reporting-api)
5. [Course Content API](#course-content-api)
6. [Announcements API](#announcements-api)
7. [Error Handling](#error-handling)
8. [Response Formats](#response-formats)

---

## Authentication

All Phase 2 endpoints require JWT token authentication.

### Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get JWT Token

**Endpoint**: `POST /api/v1/auth/login`

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@koolhub.com",
    "password": "password123"
  }'
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGtvb2xodWIuY29tIiwiaWF0IjoxNzAxNDc2ODAwLCJleHAiOjE3MDIwODE2MDB9.signature",
  "user": {
    "id": "1",
    "email": "admin@koolhub.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin"
  }
}
```

---

# Analytics API

**Base URL**: `/api/v1/analytics`

## 1. Get Enrollment Metrics

**Endpoint**: `GET /enrollment`

**Description**: Retrieves enrollment metrics for a specific branch

**Parameters**:

- `branchId` (query, required): Branch identifier

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/enrollment?branchId=branch-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Enrollment metrics calculated",
  "data": {
    "totalEnrollments": 156,
    "enrollmentsByGrade": [
      {
        "course_id": "course-101",
        "grade": "A",
        "enrollments": 45
      },
      {
        "course_id": "course-102",
        "grade": "B",
        "enrollments": 38
      },
      {
        "course_id": "course-103",
        "grade": "C",
        "enrollments": 42
      },
      {
        "course_id": "course-104",
        "grade": "D",
        "enrollments": 31
      }
    ],
    "timestamp": "2025-12-02T10:30:00Z"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "message": "Branch ID is required"
}
```

---

## 2. Get Attendance Metrics

**Endpoint**: `GET /attendance`

**Description**: Retrieves attendance analytics for a date range

**Parameters**:

- `branchId` (query, required): Branch identifier
- `startDate` (query, optional): ISO date format (default: 30 days ago)
- `endDate` (query, optional): ISO date format (default: today)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/attendance?branchId=branch-001&startDate=2025-11-01&endDate=2025-12-02" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Attendance metrics calculated",
  "data": {
    "totalRecords": 2450,
    "presentCount": 2320,
    "absentCount": 130,
    "attendancePercentage": "94.67%",
    "dateRange": {
      "start": "2025-11-01",
      "end": "2025-12-02"
    },
    "dailyAverage": {
      "present": 82.14,
      "absent": 4.61
    },
    "courseWiseAttendance": [
      {
        "course_id": "course-101",
        "attendance": "95.2%",
        "present": 510,
        "absent": 25
      },
      {
        "course_id": "course-102",
        "attendance": "93.8%",
        "present": 480,
        "absent": 32
      }
    ]
  }
}
```

---

## 3. Get Fee Metrics

**Endpoint**: `GET /fees`

**Description**: Retrieves fee collection metrics

**Parameters**:

- `branchId` (query, required): Branch identifier

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/fees?branchId=branch-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Fee metrics calculated",
  "data": {
    "totalStudents": 450,
    "feeCollected": 4500000,
    "feePending": 850000,
    "collectionPercentage": "84.11%",
    "currency": "PKR",
    "collectionBreakdown": {
      "onlinePayments": 3200000,
      "cheques": 800000,
      "cash": 500000
    },
    "monthlyCollection": [
      {
        "month": "November 2025",
        "collected": 1850000,
        "pending": 350000
      },
      {
        "month": "December 2025",
        "collected": 2650000,
        "pending": 500000
      }
    ]
  }
}
```

---

## 4. Get Teacher Metrics

**Endpoint**: `GET /teachers`

**Description**: Retrieves teacher performance metrics

**Parameters**:

- `branchId` (query, required): Branch identifier
- `teacherId` (query, optional): Specific teacher ID

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/teachers?branchId=branch-001&teacherId=teacher-050" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Teacher metrics calculated",
  "data": {
    "totalTeachers": 28,
    "teacherDetails": [
      {
        "id": "teacher-050",
        "name": "Muhammad Ahmed",
        "courses": 3,
        "students": 145,
        "averageRating": 4.5,
        "classesHeld": 120,
        "classesScheduled": 125,
        "attendanceRate": "96%"
      },
      {
        "id": "teacher-051",
        "name": "Fatima Khan",
        "courses": 2,
        "students": 98,
        "averageRating": 4.3,
        "classesHeld": 110,
        "classesScheduled": 115,
        "attendanceRate": "95.65%"
      }
    ],
    "topPerformers": [
      {
        "rank": 1,
        "teacherId": "teacher-050",
        "name": "Muhammad Ahmed",
        "rating": 4.5
      },
      {
        "rank": 2,
        "teacherId": "teacher-051",
        "name": "Fatima Khan",
        "rating": 4.3
      }
    ]
  }
}
```

---

## 5. Get Dashboard Summary

**Endpoint**: `GET /dashboard`

**Description**: Retrieves comprehensive dashboard overview for a branch

**Parameters**:

- `branchId` (query, required): Branch identifier

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/dashboard?branchId=branch-001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Dashboard data retrieved",
  "data": {
    "summary": {
      "totalStudents": 450,
      "totalTeachers": 28,
      "totalCourses": 12,
      "totalClasses": 2800
    },
    "kpis": {
      "averageAttendance": "94.67%",
      "feeCollectionRate": "84.11%",
      "studentRetentionRate": "91.2%",
      "teacherSatisfaction": 4.4
    },
    "recentActivity": {
      "newStudentsThisMonth": 25,
      "classesHeldThisWeek": 145,
      "feesCollectedThisMonth": 2650000
    },
    "alerts": [
      {
        "type": "warning",
        "message": "5 students with attendance below 75%",
        "count": 5
      },
      {
        "type": "info",
        "message": "Fee deadline approaching for 12 students",
        "count": 12
      }
    ],
    "timestamp": "2025-12-02T10:30:00Z"
  }
}
```

---

## 6. Get Trend Analysis

**Endpoint**: `GET /trends/{metricType}`

**Description**: Analyzes trends for a specific metric over time

**Parameters**:

- `metricType` (path, required): enrollment|attendance|fees|teachers
- `branchId` (query, required): Branch identifier
- `days` (query, optional): Number of days to analyze (default: 30, max: 365)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/analytics/trends/attendance?branchId=branch-001&days=60" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Trend analysis completed",
  "data": {
    "metricType": "attendance",
    "period": "Last 60 days",
    "trends": [
      {
        "date": "2025-10-03",
        "value": 92.1,
        "change": -1.5
      },
      {
        "date": "2025-10-04",
        "value": 93.2,
        "change": 1.1
      },
      {
        "date": "2025-10-05",
        "value": 94.5,
        "change": 1.3
      }
    ],
    "statistics": {
      "highest": 96.8,
      "lowest": 87.3,
      "average": 92.54,
      "trend": "upward",
      "changePercentage": 2.4
    },
    "forecast": {
      "nextWeekPredicted": 94.8,
      "confidence": 0.87
    }
  }
}
```

---

# Messaging API

**Base URL**: `/api/v1/messages`

## 1. Send Message

**Endpoint**: `POST /send`

**Description**: Sends a direct message between users

**Request Body**:

```json
{
  "senderId": "user-123",
  "recipientId": "user-456",
  "subject": "Project Update",
  "messageBody": "Please review the attached quarterly report and provide feedback.",
  "attachmentUrl": "https://storage.example.com/reports/q4-report.pdf"
}
```

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/messages/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "user-123",
    "recipientId": "user-456",
    "subject": "Project Update",
    "messageBody": "Please review the quarterly report.",
    "attachmentUrl": "https://storage.example.com/reports/q4.pdf"
  }'
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "msg-789",
    "sender_id": "user-123",
    "recipient_id": "user-456",
    "subject": "Project Update",
    "message_body": "Please review the quarterly report.",
    "attachment_url": "https://storage.example.com/reports/q4.pdf",
    "created_at": "2025-12-02T11:30:00Z",
    "read_at": null,
    "is_deleted": false
  }
}
```

---

## 2. Get Inbox Messages

**Endpoint**: `GET /inbox`

**Description**: Retrieves inbox messages for a user with pagination

**Parameters**:

- `userId` (query, required): User identifier
- `limit` (query, optional): Results per page (default: 20, max: 100)
- `offset` (query, optional): Pagination offset (default: 0)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/messages/inbox?userId=user-456&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Inbox messages retrieved",
  "data": [
    {
      "id": "msg-789",
      "sender": {
        "id": "user-123",
        "first_name": "Ahmad",
        "last_name": "Khan",
        "email": "ahmad@example.com"
      },
      "subject": "Project Update",
      "message_body": "Please review the quarterly report.",
      "attachment_url": "https://storage.example.com/reports/q4.pdf",
      "created_at": "2025-12-02T11:30:00Z",
      "read_at": null,
      "is_deleted": false
    },
    {
      "id": "msg-790",
      "sender": {
        "id": "user-789",
        "first_name": "Fatima",
        "last_name": "Ahmed",
        "email": "fatima@example.com"
      },
      "subject": "Meeting Reminder",
      "message_body": "Don't forget about the team meeting at 3 PM.",
      "attachment_url": null,
      "created_at": "2025-12-02T10:15:00Z",
      "read_at": "2025-12-02T10:45:00Z",
      "is_deleted": false
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 45,
    "pages": 5
  }
}
```

---

## 3. Get Sent Messages

**Endpoint**: `GET /sent`

**Description**: Retrieves sent messages for a user

**Parameters**:

- `userId` (query, required): User identifier
- `limit` (query, optional): Results per page (default: 20)
- `offset` (query, optional): Pagination offset (default: 0)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/messages/sent?userId=user-123&limit=15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Sent messages retrieved",
  "data": [
    {
      "id": "msg-789",
      "recipient": {
        "id": "user-456",
        "first_name": "Hassan",
        "last_name": "Ali",
        "email": "hassan@example.com"
      },
      "subject": "Project Update",
      "message_body": "Please review the quarterly report.",
      "created_at": "2025-12-02T11:30:00Z"
    }
  ],
  "pagination": {
    "limit": 15,
    "offset": 0,
    "total": 32,
    "pages": 3
  }
}
```

---

## 4. Get Conversation

**Endpoint**: `GET /conversation`

**Description**: Retrieves full conversation history between two users

**Parameters**:

- `userId` (query, required): First user ID
- `otherUserId` (query, required): Second user ID
- `limit` (query, optional): Number of messages (default: 50)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/messages/conversation?userId=user-123&otherUserId=user-456&limit=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Conversation retrieved",
  "data": [
    {
      "id": "msg-101",
      "sender": {
        "id": "user-456",
        "first_name": "Hassan",
        "last_name": "Ali"
      },
      "recipient": {
        "id": "user-123",
        "first_name": "Ahmad",
        "last_name": "Khan"
      },
      "subject": "Quick Question",
      "message_body": "Can you help with the project?",
      "created_at": "2025-12-01T09:00:00Z"
    },
    {
      "id": "msg-789",
      "sender": {
        "id": "user-123",
        "first_name": "Ahmad",
        "last_name": "Khan"
      },
      "recipient": {
        "id": "user-456",
        "first_name": "Hassan",
        "last_name": "Ali"
      },
      "subject": "RE: Quick Question",
      "message_body": "Sure, I'd be happy to help. Let's discuss tomorrow.",
      "created_at": "2025-12-01T09:30:00Z"
    }
  ]
}
```

---

## 5. Mark Message as Read

**Endpoint**: `POST /{messageId}/read`

**Description**: Marks a single message as read

**Parameters**:

- `messageId` (path, required): Message identifier

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/messages/msg-789/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Message marked as read",
  "data": {
    "id": "msg-789",
    "read_at": "2025-12-02T14:22:30Z"
  }
}
```

---

## 6. Mark Multiple Messages as Read

**Endpoint**: `POST /mark-multiple-read`

**Description**: Marks multiple messages as read

**Request Body**:

```json
{
  "messageIds": ["msg-789", "msg-790", "msg-791"]
}
```

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/messages/mark-multiple-read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageIds": ["msg-789", "msg-790", "msg-791"]
  }'
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "markedCount": 3,
    "timestamp": "2025-12-02T14:25:00Z"
  }
}
```

---

## 7. Delete Message

**Endpoint**: `DELETE /{messageId}`

**Description**: Soft deletes a message

**Parameters**:

- `messageId` (path, required): Message identifier

**Request**:

```bash
curl -X DELETE http://localhost:5000/api/v1/messages/msg-789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Message deleted",
  "data": {
    "id": "msg-789",
    "is_deleted": true,
    "deleted_at": "2025-12-02T14:30:00Z"
  }
}
```

---

## 8. Search Messages

**Endpoint**: `GET /search`

**Description**: Searches messages by content

**Parameters**:

- `userId` (query, required): User identifier
- `searchTerm` (query, required): Search keyword
- `limit` (query, optional): Results limit (default: 20)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/messages/search?userId=user-456&searchTerm=quarterly&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Messages search completed",
  "data": [
    {
      "id": "msg-789",
      "sender": {
        "id": "user-123",
        "first_name": "Ahmad",
        "last_name": "Khan"
      },
      "recipient": {
        "id": "user-456",
        "first_name": "Hassan",
        "last_name": "Ali"
      },
      "subject": "Project Update",
      "message_body": "Please review the quarterly report.",
      "created_at": "2025-12-02T11:30:00Z",
      "matchedText": "quarterly report"
    }
  ]
}
```

---

## 9. Get Unread Message Count

**Endpoint**: `GET /unread-count`

**Description**: Gets count of unread messages for a user

**Parameters**:

- `userId` (query, required): User identifier

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/messages/unread-count?userId=user-456" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "unreadCount": 7,
    "lastChecked": "2025-12-02T14:00:00Z"
  }
}
```

---

# Reporting API

**Base URL**: `/api/v1/reports`

## 1. Generate Student Progress Report

**Endpoint**: `POST /student-progress`

**Description**: Generates comprehensive student progress report

**Request Body**:

```json
{
  "branchId": "branch-001",
  "courseId": "course-101",
  "format": "pdf"
}
```

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/reports/student-progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": "branch-001",
    "courseId": "course-101",
    "format": "pdf"
  }'
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Student progress report generated",
  "data": {
    "reportId": "report-2025-001",
    "type": "student-progress",
    "branchId": "branch-001",
    "courseId": "course-101",
    "format": "pdf",
    "generatedAt": "2025-12-02T14:35:00Z",
    "downloadUrl": "https://storage.example.com/reports/report-2025-001.pdf",
    "summary": {
      "totalStudents": 45,
      "averageScore": 78.5,
      "topPerformer": {
        "studentId": "student-001",
        "name": "Ali Ahmed",
        "score": 95
      },
      "needsImprovement": 8
    }
  }
}
```

---

## 2. Generate Teacher Performance Report

**Endpoint**: `POST /teacher-performance`

**Description**: Generates teacher performance evaluation report

**Request Body**:

```json
{
  "branchId": "branch-001",
  "teacherId": "teacher-050",
  "format": "excel"
}
```

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/reports/teacher-performance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": "branch-001",
    "teacherId": "teacher-050",
    "format": "excel"
  }'
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Teacher performance report generated",
  "data": {
    "reportId": "report-2025-002",
    "type": "teacher-performance",
    "branchId": "branch-001",
    "teacherId": "teacher-050",
    "format": "excel",
    "generatedAt": "2025-12-02T14:40:00Z",
    "downloadUrl": "https://storage.example.com/reports/report-2025-002.xlsx",
    "summary": {
      "teacherName": "Muhammad Ahmed",
      "classesHeld": 120,
      "studentRating": 4.5,
      "attendance": "96%",
      "coursePerformance": [
        {
          "courseId": "course-101",
          "studentsCount": 45,
          "averageScore": 78.5
        }
      ]
    }
  }
}
```

---

## 3. Generate Fee Collection Report

**Endpoint**: `POST /fee-collection`

**Description**: Generates fee collection analytics report

**Request Body**:

```json
{
  "branchId": "branch-001",
  "format": "pdf"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Fee collection report generated",
  "data": {
    "reportId": "report-2025-003",
    "type": "fee-collection",
    "branchId": "branch-001",
    "format": "pdf",
    "generatedAt": "2025-12-02T14:45:00Z",
    "downloadUrl": "https://storage.example.com/reports/report-2025-003.pdf",
    "summary": {
      "totalStudents": 450,
      "totalExpected": 5000000,
      "totalCollected": 4200000,
      "totalPending": 800000,
      "collectionPercentage": "84%",
      "paymentMethods": {
        "online": 2800000,
        "cheque": 800000,
        "cash": 600000
      }
    }
  }
}
```

---

## 4. Generate Attendance Report

**Endpoint**: `POST /attendance`

**Description**: Generates attendance summary report for a date range

**Request Body**:

```json
{
  "branchId": "branch-001",
  "startDate": "2025-11-01",
  "endDate": "2025-12-02",
  "format": "excel"
}
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Attendance report generated",
  "data": {
    "reportId": "report-2025-004",
    "type": "attendance",
    "branchId": "branch-001",
    "dateRange": {
      "start": "2025-11-01",
      "end": "2025-12-02"
    },
    "format": "excel",
    "generatedAt": "2025-12-02T14:50:00Z",
    "downloadUrl": "https://storage.example.com/reports/report-2025-004.xlsx",
    "summary": {
      "totalClasses": 2450,
      "totalPresent": 2320,
      "totalAbsent": 130,
      "averageAttendance": "94.67%",
      "courseWiseData": [
        {
          "courseId": "course-101",
          "attendance": "95.2%",
          "present": 510,
          "absent": 25
        }
      ]
    }
  }
}
```

---

## 5. Get All Reports

**Endpoint**: `GET /`

**Description**: Retrieves all reports with pagination

**Parameters**:

- `branchId` (query, required): Branch identifier
- `limit` (query, optional): Results per page (default: 20)
- `offset` (query, optional): Pagination offset (default: 0)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/reports?branchId=branch-001&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Reports retrieved",
  "data": [
    {
      "reportId": "report-2025-001",
      "type": "student-progress",
      "branchId": "branch-001",
      "generatedAt": "2025-12-02T14:35:00Z",
      "format": "pdf",
      "downloadUrl": "https://storage.example.com/reports/report-2025-001.pdf"
    },
    {
      "reportId": "report-2025-002",
      "type": "teacher-performance",
      "branchId": "branch-001",
      "generatedAt": "2025-12-02T14:40:00Z",
      "format": "excel",
      "downloadUrl": "https://storage.example.com/reports/report-2025-002.xlsx"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 28,
    "pages": 3
  }
}
```

---

## 6. Delete Report

**Endpoint**: `DELETE /{reportId}`

**Description**: Deletes a generated report

**Parameters**:

- `reportId` (path, required): Report identifier

**Request**:

```bash
curl -X DELETE http://localhost:5000/api/v1/reports/report-2025-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Report deleted",
  "data": {
    "reportId": "report-2025-001",
    "deletedAt": "2025-12-02T15:00:00Z"
  }
}
```

---

# Course Content API

**Base URL**: `/api/v1/course-content`

## 1. Upload Course Content

**Endpoint**: `POST /upload`

**Description**: Uploads new course content/materials

**Request Body**:

```json
{
  "courseId": "course-101",
  "contentType": "video",
  "title": "Introduction to Algebra",
  "description": "Foundational concepts of algebraic expressions",
  "fileName": "intro-algebra.mp4",
  "fileSize": 524288000,
  "filePath": "https://storage.example.com/videos/intro-algebra.mp4",
  "uploadedBy": "teacher-050",
  "duration": 3600
}
```

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/course-content/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course-101",
    "contentType": "video",
    "title": "Introduction to Algebra",
    "description": "Foundational concepts",
    "fileName": "intro-algebra.mp4",
    "fileSize": 524288000,
    "filePath": "https://storage.example.com/videos/intro-algebra.mp4",
    "uploadedBy": "teacher-050",
    "duration": 3600
  }'
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Content uploaded successfully",
  "data": {
    "id": "content-2025-001",
    "courseId": "course-101",
    "contentType": "video",
    "title": "Introduction to Algebra",
    "description": "Foundational concepts of algebraic expressions",
    "fileName": "intro-algebra.mp4",
    "fileSize": 524288000,
    "filePath": "https://storage.example.com/videos/intro-algebra.mp4",
    "uploadedBy": "teacher-050",
    "duration": 3600,
    "createdAt": "2025-12-02T15:05:00Z",
    "views": 0,
    "isPinned": false,
    "isPublished": true
  }
}
```

---

## 2. Get Course Content

**Endpoint**: `GET /{courseId}`

**Description**: Retrieves all content for a course

**Parameters**:

- `courseId` (path, required): Course identifier
- `limit` (query, optional): Results per page (default: 20)
- `offset` (query, optional): Pagination offset (default: 0)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/course-content/course-101?limit=15&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Course content retrieved",
  "data": [
    {
      "id": "content-2025-001",
      "courseId": "course-101",
      "contentType": "video",
      "title": "Introduction to Algebra",
      "description": "Foundational concepts",
      "fileName": "intro-algebra.mp4",
      "fileSize": 524288000,
      "filePath": "https://storage.example.com/videos/intro-algebra.mp4",
      "uploadedBy": "teacher-050",
      "duration": 3600,
      "createdAt": "2025-12-02T15:05:00Z",
      "views": 234,
      "isPinned": true,
      "isPublished": true
    },
    {
      "id": "content-2025-002",
      "courseId": "course-101",
      "contentType": "pdf",
      "title": "Chapter 1: Expressions",
      "description": "Study material for Chapter 1",
      "fileName": "chapter-1.pdf",
      "fileSize": 2097152,
      "filePath": "https://storage.example.com/pdfs/chapter-1.pdf",
      "uploadedBy": "teacher-050",
      "createdAt": "2025-12-01T14:20:00Z",
      "views": 456,
      "isPinned": false,
      "isPublished": true
    }
  ],
  "pagination": {
    "limit": 15,
    "offset": 0,
    "total": 28,
    "pages": 2
  }
}
```

---

## 3. Get Published Content

**Endpoint**: `GET /{courseId}/published`

**Description**: Retrieves only published content for a course

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/course-content/course-101/published" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Published course content retrieved",
  "data": [
    {
      "id": "content-2025-001",
      "courseId": "course-101",
      "contentType": "video",
      "title": "Introduction to Algebra",
      "views": 234,
      "isPinned": true,
      "createdAt": "2025-12-02T15:05:00Z"
    }
  ]
}
```

---

## 4. Update Content

**Endpoint**: `PATCH /{contentId}`

**Description**: Updates content metadata

**Request Body**:

```json
{
  "title": "Introduction to Algebra - Updated",
  "description": "Updated description",
  "isPinned": true
}
```

**Request**:

```bash
curl -X PATCH http://localhost:5000/api/v1/course-content/content-2025-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Algebra - Updated",
    "description": "Updated description",
    "isPinned": true
  }'
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Content updated",
  "data": {
    "id": "content-2025-001",
    "title": "Introduction to Algebra - Updated",
    "description": "Updated description",
    "isPinned": true,
    "updatedAt": "2025-12-02T15:10:00Z"
  }
}
```

---

## 5. Delete Content

**Endpoint**: `DELETE /{contentId}`

**Description**: Soft deletes content

**Request**:

```bash
curl -X DELETE http://localhost:5000/api/v1/course-content/content-2025-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Content deleted",
  "data": {
    "id": "content-2025-001",
    "isDeleted": true,
    "deletedAt": "2025-12-02T15:15:00Z"
  }
}
```

---

## 6. Track Content View

**Endpoint**: `POST /{contentId}/view`

**Description**: Tracks when a user views content

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/course-content/content-2025-001/view \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "View tracked",
  "data": {
    "id": "content-2025-001",
    "totalViews": 235,
    "viewedAt": "2025-12-02T15:20:00Z"
  }
}
```

---

## 7. Pin/Unpin Content

**Endpoint**: `POST /{contentId}/pin`

**Description**: Pins or unpins important content

**Request Body**:

```json
{
  "isPinned": true
}
```

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/course-content/content-2025-001/pin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPinned": true}'
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Content pinned",
  "data": {
    "id": "content-2025-001",
    "isPinned": true,
    "pinnedAt": "2025-12-02T15:25:00Z"
  }
}
```

---

## 8. Get Content by Type

**Endpoint**: `GET /{courseId}/by-type/{contentType}`

**Description**: Retrieves content filtered by type

**Parameters**:

- `courseId` (path, required): Course identifier
- `contentType` (path, required): video|pdf|document|link|assignment

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/course-content/course-101/by-type/video" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Content by type retrieved",
  "data": [
    {
      "id": "content-2025-001",
      "contentType": "video",
      "title": "Introduction to Algebra",
      "fileName": "intro-algebra.mp4",
      "duration": 3600,
      "views": 234
    }
  ]
}
```

---

## 9. Get Popular Content

**Endpoint**: `GET /{courseId}/popular`

**Description**: Retrieves most viewed content for a course

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/course-content/course-101/popular" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Popular content retrieved",
  "data": [
    {
      "id": "content-2025-002",
      "title": "Chapter 1: Expressions",
      "views": 456,
      "contentType": "pdf",
      "createdAt": "2025-12-01T14:20:00Z"
    },
    {
      "id": "content-2025-001",
      "title": "Introduction to Algebra",
      "views": 234,
      "contentType": "video",
      "createdAt": "2025-12-02T15:05:00Z"
    }
  ]
}
```

---

# Announcements API

**Base URL**: `/api/v1/announcements`

## 1. Create Announcement

**Endpoint**: `POST /`

**Description**: Creates a new course announcement

**Request Body**:

```json
{
  "courseId": "course-101",
  "title": "Important: Final Exam Schedule",
  "content": "The final examination for this course will be held on December 15, 2025.",
  "priority": "high",
  "announcementType": "exam",
  "expiryDate": "2025-12-15"
}
```

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/announcements \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course-101",
    "title": "Important: Final Exam Schedule",
    "content": "The final examination for this course will be held on December 15, 2025.",
    "priority": "high",
    "announcementType": "exam",
    "expiryDate": "2025-12-15"
  }'
```

**Response** (201 Created):

```json
{
  "success": true,
  "message": "Announcement created",
  "data": {
    "id": "announce-2025-001",
    "courseId": "course-101",
    "title": "Important: Final Exam Schedule",
    "content": "The final examination for this course will be held on December 15, 2025.",
    "priority": "high",
    "announcementType": "exam",
    "isPinned": false,
    "viewCount": 0,
    "createdAt": "2025-12-02T15:30:00Z",
    "expiryDate": "2025-12-15"
  }
}
```

---

## 2. Get Announcements for Course

**Endpoint**: `GET /{courseId}`

**Description**: Retrieves all announcements for a course

**Parameters**:

- `courseId` (path, required): Course identifier
- `limit` (query, optional): Results per page (default: 20)
- `offset` (query, optional): Pagination offset (default: 0)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/announcements/course-101?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Announcements retrieved",
  "data": [
    {
      "id": "announce-2025-001",
      "courseId": "course-101",
      "title": "Important: Final Exam Schedule",
      "content": "The final examination for this course will be held on December 15, 2025.",
      "priority": "high",
      "announcementType": "exam",
      "isPinned": true,
      "viewCount": 125,
      "createdAt": "2025-12-02T15:30:00Z",
      "expiryDate": "2025-12-15"
    },
    {
      "id": "announce-2025-002",
      "courseId": "course-101",
      "title": "Class Assignment Due",
      "content": "Please submit your assignment by December 10.",
      "priority": "normal",
      "announcementType": "assignment",
      "isPinned": false,
      "viewCount": 89,
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 15,
    "pages": 2
  }
}
```

---

## 3. Get Announcements by Priority

**Endpoint**: `GET /{courseId}/priority/{priority}`

**Description**: Retrieves announcements filtered by priority

**Parameters**:

- `courseId` (path, required): Course identifier
- `priority` (path, required): low|normal|high|urgent

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/announcements/course-101/priority/high" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Announcements by priority retrieved",
  "data": [
    {
      "id": "announce-2025-001",
      "title": "Important: Final Exam Schedule",
      "priority": "high",
      "content": "The final examination for this course will be held on December 15, 2025.",
      "createdAt": "2025-12-02T15:30:00Z",
      "viewCount": 125
    }
  ]
}
```

---

## 4. Get Announcements by Type

**Endpoint**: `GET /{courseId}/type/{announcementType}`

**Description**: Retrieves announcements filtered by type

**Parameters**:

- `courseId` (path, required): Course identifier
- `announcementType` (path, required): general|assignment|exam|holiday

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/announcements/course-101/type/exam" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Announcements by type retrieved",
  "data": [
    {
      "id": "announce-2025-001",
      "title": "Important: Final Exam Schedule",
      "announcementType": "exam",
      "content": "The final examination for this course will be held on December 15, 2025.",
      "viewCount": 125
    }
  ]
}
```

---

## 5. Update Announcement

**Endpoint**: `PATCH /{announcementId}`

**Description**: Updates announcement content

**Request Body**:

```json
{
  "title": "Updated: Final Exam Schedule",
  "content": "The final examination has been moved to December 16, 2025.",
  "priority": "urgent"
}
```

**Request**:

```bash
curl -X PATCH http://localhost:5000/api/v1/announcements/announce-2025-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: Final Exam Schedule",
    "priority": "urgent"
  }'
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Announcement updated",
  "data": {
    "id": "announce-2025-001",
    "title": "Updated: Final Exam Schedule",
    "priority": "urgent",
    "updatedAt": "2025-12-02T15:35:00Z"
  }
}
```

---

## 6. Delete Announcement

**Endpoint**: `DELETE /{announcementId}`

**Description**: Soft deletes an announcement

**Request**:

```bash
curl -X DELETE http://localhost:5000/api/v1/announcements/announce-2025-001 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Announcement deleted",
  "data": {
    "id": "announce-2025-001",
    "isDeleted": true,
    "deletedAt": "2025-12-02T15:40:00Z"
  }
}
```

---

## 7. Pin/Unpin Announcement

**Endpoint**: `POST /{announcementId}/pin`

**Description**: Pins or unpins important announcements

**Request Body**:

```json
{
  "isPinned": true
}
```

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/announcements/announce-2025-001/pin \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"isPinned": true}'
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Announcement pinned",
  "data": {
    "id": "announce-2025-001",
    "isPinned": true,
    "pinnedAt": "2025-12-02T15:45:00Z"
  }
}
```

---

## 8. Track Announcement View

**Endpoint**: `POST /{announcementId}/view`

**Description**: Records when a user views an announcement

**Request**:

```bash
curl -X POST http://localhost:5000/api/v1/announcements/announce-2025-001/view \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "View tracked",
  "data": {
    "id": "announce-2025-001",
    "viewCount": 126,
    "viewedAt": "2025-12-02T15:50:00Z"
  }
}
```

---

## 9. Get Pinned Announcements

**Endpoint**: `GET /{courseId}/pinned`

**Description**: Retrieves only pinned announcements for a course

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/announcements/course-101/pinned" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Pinned announcements retrieved",
  "data": [
    {
      "id": "announce-2025-001",
      "title": "Important: Final Exam Schedule",
      "isPinned": true,
      "priority": "high",
      "viewCount": 126
    }
  ]
}
```

---

## 10. Get Upcoming Announcements

**Endpoint**: `GET /{courseId}/upcoming`

**Description**: Retrieves announcements scheduled for the future

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/announcements/course-101/upcoming" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Upcoming announcements retrieved",
  "data": [
    {
      "id": "announce-2025-003",
      "title": "Holiday Break Notice",
      "content": "Classes will resume on January 5, 2026.",
      "scheduledDate": "2025-12-10",
      "expiryDate": "2026-01-04"
    }
  ]
}
```

---

## 11. Get Announcement Statistics

**Endpoint**: `GET /{courseId}/statistics`

**Description**: Retrieves announcement engagement statistics

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/announcements/course-101/statistics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Announcement statistics retrieved",
  "data": {
    "courseId": "course-101",
    "totalAnnouncements": 15,
    "totalViews": 2850,
    "averageViewsPerAnnouncement": 190,
    "announcementsByPriority": {
      "low": 2,
      "normal": 8,
      "high": 4,
      "urgent": 1
    },
    "announcementsByType": {
      "general": 5,
      "assignment": 6,
      "exam": 3,
      "holiday": 1
    },
    "mostViewed": {
      "id": "announce-2025-002",
      "title": "Class Assignment Due",
      "views": 356
    }
  }
}
```

---

## 12. Search Announcements

**Endpoint**: `GET /{courseId}/search`

**Description**: Searches announcements by content

**Parameters**:

- `courseId` (path, required): Course identifier
- `searchTerm` (query, required): Search keyword
- `limit` (query, optional): Results limit (default: 20)

**Request**:

```bash
curl -X GET "http://localhost:5000/api/v1/announcements/course-101/search?searchTerm=exam&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Search completed",
  "data": [
    {
      "id": "announce-2025-001",
      "title": "Important: Final Exam Schedule",
      "content": "The final examination for this course will be held on December 15, 2025.",
      "matchedText": "exam",
      "priority": "high",
      "viewCount": 126
    }
  ]
}
```

---

# Error Handling

## Common Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Branch ID is required",
  "code": "INVALID_INPUT"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "You do not have permission to access this resource",
  "code": "FORBIDDEN"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error. Please try again later.",
  "code": "INTERNAL_ERROR"
}
```

---

# Response Formats

All responses follow a standard format:

## Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    /* response data */
  }
}
```

## Error Response

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [
    /* array of items */
  ],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "pages": 8
  }
}
```

---

## HTTP Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 200  | OK - Request succeeded                  |
| 201  | Created - Resource created successfully |
| 400  | Bad Request - Invalid parameters        |
| 401  | Unauthorized - Missing or invalid token |
| 403  | Forbidden - Access denied               |
| 404  | Not Found - Resource not found          |
| 500  | Internal Server Error - Server error    |

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Response Headers

```
Content-Type: application/json
Authorization: Bearer <token>
X-Request-ID: <unique-request-id>
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1701518400
```

---

**Documentation Version**: 1.0  
**Last Updated**: December 2, 2025  
**API Version**: v1.0.0
