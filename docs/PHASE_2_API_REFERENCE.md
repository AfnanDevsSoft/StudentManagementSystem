# Phase 2 API Reference Guide

## Quick Navigation

- [Analytics API](#analytics-api)
- [Messaging API](#messaging-api)
- [Course Content API](#course-content-api)
- [Announcements API](#announcements-api)
- [Reporting API](#reporting-api)

---

## Analytics API

**Base URL**: `/api/v1/analytics`

### Enrollment Metrics
```
GET /enrollment
Query Parameters:
  - branchId (required): string

Response: {
  success: boolean,
  message: string,
  data: {
    totalEnrollments: number,
    enrollmentsByGrade: array
  }
}
```

### Attendance Metrics
```
GET /attendance
Query Parameters:
  - branchId (required): string
  - startDate (optional): ISO date string
  - endDate (optional): ISO date string

Response: {
  success: boolean,
  message: string,
  data: {
    totalRecords: number,
    presentCount: number,
    absentCount: number,
    attendancePercentage: string
  }
}
```

### Fee Metrics
```
GET /fees
Query Parameters:
  - branchId (required): string

Response: {
  success: boolean,
  message: string,
  data: {
    totalStudents: number
  }
}
```

### Teacher Metrics
```
GET /teachers
Query Parameters:
  - branchId (required): string
  - teacherId (optional): string

Response: {
  success: boolean,
  message: string,
  data: {
    totalTeachers: number,
    teacherDetails: array
  }
}
```

### Dashboard Summary
```
GET /dashboard
Query Parameters:
  - branchId (required): string

Response: {
  success: boolean,
  message: string,
  data: {
    summary: {
      totalStudents: number,
      totalTeachers: number,
      totalCourses: number
    }
  }
}
```

### Trend Analysis
```
GET /trends/:metricType
Path Parameters:
  - metricType: string (enrollment|attendance|fees|teachers)

Query Parameters:
  - branchId (required): string
  - days (optional): integer (default: 30)

Response: {
  success: boolean,
  message: string,
  data: {
    trends: object,
    period: string
  }
}
```

---

## Messaging API

**Base URL**: `/api/v1/messages`

### Send Message
```
POST /send
Headers:
  - Authorization: Bearer {token}

Body: {
  senderId: string (required),
  recipientId: string (required),
  subject: string (required),
  messageBody: string (required),
  attachmentUrl: string (optional)
}

Response: {
  success: boolean,
  message: string,
  data: DirectMessage
}
```

### Get Inbox
```
GET /inbox
Query Parameters:
  - userId (required): string
  - limit (optional): integer (default: 20)
  - offset (optional): integer (default: 0)

Response: {
  success: boolean,
  message: string,
  data: DirectMessage[],
  pagination: {
    limit: number,
    offset: number,
    total: number,
    pages: number
  }
}
```

### Get Sent Messages
```
GET /sent
Query Parameters:
  - userId (required): string
  - limit (optional): integer (default: 20)
  - offset (optional): integer (default: 0)

Response: {
  success: boolean,
  message: string,
  data: DirectMessage[],
  pagination: { ... }
}
```

### Get Conversation
```
GET /conversation
Query Parameters:
  - userId (required): string
  - otherUserId (required): string
  - limit (optional): integer (default: 50)

Response: {
  success: boolean,
  message: string,
  data: DirectMessage[]
}
```

### Mark Message as Read
```
POST /:messageId/read
Path Parameters:
  - messageId: string

Response: {
  success: boolean,
  message: string,
  data: DirectMessage
}
```

### Mark Multiple as Read
```
POST /mark-multiple-read
Body: {
  messageIds: string[] (required)
}

Response: {
  success: boolean,
  message: string
}
```

### Delete Message
```
DELETE /:messageId
Path Parameters:
  - messageId: string

Response: {
  success: boolean,
  message: string,
  data: DirectMessage
}
```

### Search Messages
```
GET /search
Query Parameters:
  - userId (required): string
  - searchTerm (required): string
  - limit (optional): integer (default: 20)

Response: {
  success: boolean,
  message: string,
  data: DirectMessage[]
}
```

### Get Unread Count
```
GET /unread-count
Query Parameters:
  - userId (required): string

Response: {
  success: boolean,
  message: string,
  data: {
    unreadCount: number
  }
}
```

---

## Course Content API

**Base URL**: `/api/v1/course-content`

### Upload Content
```
POST /upload
Body: FormData {
  courseId: string,
  lessonId: string,
  title: string,
  description: string,
  file: File
}
```

### Get Course Content
```
GET /course/:courseId
Query Parameters:
  - limit (optional): integer
  - offset (optional): integer
```

### Get Lesson Content
```
GET /lesson/:lessonId
```

### Update Content
```
PUT /:contentId
Body: {
  title: string,
  description: string,
  ...
}
```

### Delete Content
```
DELETE /:contentId
```

### Search Content
```
GET /search
Query Parameters:
  - courseId: string
  - searchTerm: string
```

---

## Announcements API

**Base URL**: `/api/v1/announcements`

### Create Announcement
```
POST /
Body: {
  courseId: string (required),
  title: string (required),
  content: string (required),
  expiryDate: ISO date (optional)
}
```

### List Announcements
```
GET /
Query Parameters:
  - limit (optional): integer
  - offset (optional): integer
```

### Get Course Announcements
```
GET /:courseId
Query Parameters:
  - limit (optional): integer
  - offset (optional): integer
```

### Get Announcement Details
```
GET /:announcementId
```

### Update Announcement
```
PUT /:announcementId
Body: {
  title: string (optional),
  content: string (optional),
  ...
}
```

### Delete Announcement
```
DELETE /:announcementId
```

---

## Reporting API

**Base URL**: `/api/v1/reports`

### Student Performance Report
```
GET /student-performance
Query Parameters:
  - branchId (required): string
  - courseId (optional): string
  - startDate (optional): ISO date
  - endDate (optional): ISO date
```

### Attendance Summary Report
```
GET /attendance-summary
Query Parameters:
  - branchId (required): string
  - studentId (optional): string
  - startDate (optional): ISO date
  - endDate (optional): ISO date
```

### Financial Summary Report
```
GET /financial-summary
Query Parameters:
  - branchId (required): string
  - month (optional): integer
  - year (optional): integer
```

### Teacher Evaluation Report
```
GET /teacher-evaluation
Query Parameters:
  - branchId (required): string
  - teacherId (optional): string
```

### Generate Custom Report
```
POST /generate-custom
Body: {
  reportType: string,
  filters: object,
  format: string (json|pdf|csv)
}
```

### Export Report
```
GET /export
Query Parameters:
  - reportId (required): string
  - format (required): string (pdf|csv)
```

---

## Authentication

All endpoints (except health checks) require:

```
Headers:
  Authorization: Bearer {JWT_TOKEN}
```

---

## Error Handling

All endpoints follow standard error response format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes:
- `ROUTE_NOT_FOUND` - 404
- `UNAUTHORIZED` - 401
- `FORBIDDEN` - 403
- `VALIDATION_ERROR` - 400
- `INTERNAL_ERROR` - 500

---

## Rate Limiting

API implements rate limiting:
- Default: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes

---

## Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing Endpoints

### Using cURL:
```bash
# Get analytics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:5000/api/v1/analytics/dashboard?branchId=branch123"

# Send message
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"senderId":"user1","recipientId":"user2","subject":"Test","messageBody":"Hello"}' \
  "http://localhost:5000/api/v1/messages/send"
```

### Using Swagger UI:
Navigate to `http://localhost:5000/api/docs` for interactive API testing

---

## Pagination

Endpoints supporting pagination use:
- `limit`: Items per page (default varies)
- `offset`: Starting position (default: 0)

Response includes:
```json
{
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 150,
    "pages": 8
  }
}
```

---

**Last Updated**: April 21, 2025  
**API Version**: v1
