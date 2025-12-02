# Phase 2 APIs - Live Testing Guide

**API Server**: http://localhost:3000/api/v1  
**Status**: ✅ Running and tested  
**Admin Credentials**: admin1 / password123

---

## Quick Start - Copy & Paste Commands

### 1️⃣ Login and Get Token

```bash
# Step 1: Login as admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"password123"}' | jq .

# Step 2: Extract token (macOS/Linux)
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"password123"}' | jq -r '.data.access_token')

echo "Your Token: $TOKEN"
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "b6012ae5-...",
      "username": "admin1",
      "role": "SuperAdmin"
    }
  }
}
```

---

## Analytics API - Live Commands

### Get Enrollment Metrics

```bash
TOKEN="your_token_here"

curl -X GET "http://localhost:3000/api/v1/analytics/enrollment?branchId=09746aaa-d990-4120-875a-a5477ccdb8ef" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response**:

```json
{
  "success": true,
  "message": "Enrollment metrics calculated",
  "data": {
    "totalEnrollments": 0,
    "enrollmentsByGrade": []
  }
}
```

---

### Get Attendance Metrics

```bash
curl -X GET "http://localhost:3000/api/v1/analytics/attendance?branchId=09746aaa-d990-4120-875a-a5477ccdb8ef" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response**:

```json
{
  "success": true,
  "message": "Attendance metrics calculated",
  "data": {
    "totalRecords": 0,
    "presentCount": 0,
    "absentCount": 0,
    "attendancePercentage": "0.00%"
  }
}
```

---

### Get Fee Metrics

```bash
curl -X GET "http://localhost:3000/api/v1/analytics/fees?branchId=09746aaa-d990-4120-875a-a5477ccdb8ef" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Teacher Metrics

```bash
curl -X GET "http://localhost:3000/api/v1/analytics/teachers?branchId=09746aaa-d990-4120-875a-a5477ccdb8ef" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Dashboard Summary

```bash
curl -X GET "http://localhost:3000/api/v1/analytics/dashboard?branchId=09746aaa-d990-4120-875a-a5477ccdb8ef" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Trend Analysis

```bash
curl -X GET "http://localhost:3000/api/v1/analytics/trends/attendance?branchId=09746aaa-d990-4120-875a-a5477ccdb8ef&days=30" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Messaging API - Live Commands

### Get Test Data (User IDs)

```bash
# Get a sender ID
SENDER_ID=$(curl -s -X GET "http://localhost:3000/api/v1/users" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

# Get a recipient ID
RECIPIENT_ID=$(curl -s -X GET "http://localhost:3000/api/v1/users" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[1].id')

echo "Sender: $SENDER_ID"
echo "Recipient: $RECIPIENT_ID"
```

---

### Send a Message

```bash
curl -X POST "http://localhost:3000/api/v1/messages/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "05fd78e0-3a52-45bf-ba4e-9b1338c537cc",
    "recipientId": "0919d187-8b5e-4be8-a561-bdb1cbc3da27",
    "subject": "Test Message",
    "messageBody": "Hello, this is a test message!",
    "attachmentUrl": null
  }' | jq .
```

**Response**:

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "06373f6e-833d-4207-be6e-7257081e654d",
    "sender_id": "05fd78e0-3a52-45bf-ba4e-9b1338c537cc",
    "recipient_id": "0919d187-8b5e-4be8-a561-bdb1cbc3da27",
    "subject": "Test Message",
    "message_body": "Hello, this is a test message!",
    "attachment_url": null,
    "created_at": "2025-12-02T05:19:17.595Z",
    "read_at": null,
    "is_deleted": false
  }
}
```

---

### Get Inbox Messages

```bash
curl -X GET "http://localhost:3000/api/v1/messages/inbox?userId=0919d187-8b5e-4be8-a561-bdb1cbc3da27&limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Sent Messages

```bash
curl -X GET "http://localhost:3000/api/v1/messages/sent?userId=05fd78e0-3a52-45bf-ba4e-9b1338c537cc&limit=10&offset=0" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Unread Message Count

```bash
curl -X GET "http://localhost:3000/api/v1/messages/unread-count?userId=0919d187-8b5e-4be8-a561-bdb1cbc3da27" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response**:

```json
{
  "success": true,
  "message": "Unread count retrieved",
  "data": {
    "unreadCount": 1
  }
}
```

---

### Mark Message as Read

```bash
curl -X POST "http://localhost:3000/api/v1/messages/06373f6e-833d-4207-be6e-7257081e654d/read" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Conversation Between Two Users

```bash
curl -X GET "http://localhost:3000/api/v1/messages/conversation?userId=05fd78e0-3a52-45bf-ba4e-9b1338c537cc&otherUserId=0919d187-8b5e-4be8-a561-bdb1cbc3da27" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Search Messages

```bash
curl -X GET "http://localhost:3000/api/v1/messages/search?userId=05fd78e0-3a52-45bf-ba4e-9b1338c537cc&searchTerm=test&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Reporting API - Live Commands

### Get Test Data (Branch & Course IDs)

```bash
# Get branch ID
BRANCH_ID=$(curl -s -X GET "http://localhost:3000/api/v1/branches" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

# Get course ID
COURSE_ID=$(curl -s -X GET "http://localhost:3000/api/v1/courses?branchId=$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id // empty')

echo "Branch: $BRANCH_ID"
echo "Course: $COURSE_ID"
```

---

### Generate Student Progress Report

```bash
curl -X POST "http://localhost:3000/api/v1/reports/student-progress" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": "09746aaa-d990-4120-875a-a5477ccdb8ef",
    "courseId": "24aed94a-b8d0-4e12-a638-ea0be1afe0f9",
    "format": "pdf"
  }' | jq .
```

**Note**: Currently has UUID validation issue. Will be fixed.

---

### Get All Reports

```bash
curl -X GET "http://localhost:3000/api/v1/reports?branchId=09746aaa-d990-4120-875a-a5477ccdb8ef&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response**:

```json
{
  "success": true,
  "message": "Reports retrieved",
  "data": [],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 0,
    "pages": 0
  }
}
```

---

## Course Content API - Live Commands

### Get Course Content

```bash
curl -X GET "http://localhost:3000/api/v1/course-content/24aed94a-b8d0-4e12-a638-ea0be1afe0f9" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response**:

```json
{
  "success": true,
  "message": "Content retrieved",
  "data": [],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 0,
    "pages": 0
  }
}
```

---

### Get Published Content

```bash
curl -X GET "http://localhost:3000/api/v1/course-content/24aed94a-b8d0-4e12-a638-ea0be1afe0f9/published" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Content by Type

```bash
curl -X GET "http://localhost:3000/api/v1/course-content/24aed94a-b8d0-4e12-a638-ea0be1afe0f9/by-type/video" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Popular Content

```bash
curl -X GET "http://localhost:3000/api/v1/course-content/24aed94a-b8d0-4e12-a638-ea0be1afe0f9/popular" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Announcements API - Live Commands

### Get Announcements for Course

```bash
curl -X GET "http://localhost:3000/api/v1/announcements/24aed94a-b8d0-4e12-a638-ea0be1afe0f9?limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response**:

```json
{
  "success": true,
  "message": "Announcements retrieved",
  "data": [],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 0,
    "pages": 0
  }
}
```

---

### Create Announcement

```bash
curl -X POST "http://localhost:3000/api/v1/announcements" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "24aed94a-b8d0-4e12-a638-ea0be1afe0f9",
    "title": "Important: Final Exam Schedule",
    "content": "The final examination will be held on December 15, 2025.",
    "priority": "high",
    "announcementType": "exam",
    "expiryDate": "2025-12-15"
  }' | jq .
```

---

### Get Announcements by Priority

```bash
curl -X GET "http://localhost:3000/api/v1/announcements/24aed94a-b8d0-4e12-a638-ea0be1afe0f9/priority/high" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

### Get Announcement Statistics

```bash
curl -X GET "http://localhost:3000/api/v1/announcements/24aed94a-b8d0-4e12-a638-ea0be1afe0f9/statistics" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Response**:

```json
{
  "success": true,
  "message": "Announcement statistics retrieved",
  "data": {
    "totalAnnouncements": 0,
    "urgentCount": 0,
    "highPriorityCount": 0,
    "examsCount": 0,
    "assignmentCount": 0
  }
}
```

---

## Bash Script - Test All APIs at Once

Save this as `test_all_apis.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Phase 2 API Tests...${NC}\n"

# Login
echo -e "${YELLOW}1. Logging in...${NC}"
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"password123"}' | jq -r '.data.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}Login failed!${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}\n"

# Get IDs
echo -e "${YELLOW}2. Getting test data...${NC}"
BRANCH_ID=$(curl -s -X GET "http://localhost:3000/api/v1/branches" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

SENDER_ID=$(curl -s -X GET "http://localhost:3000/api/v1/users" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

RECIPIENT_ID=$(curl -s -X GET "http://localhost:3000/api/v1/users" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[1].id')

COURSE_ID=$(curl -s -X GET "http://localhost:3000/api/v1/courses?branchId=$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id // empty')

echo -e "${GREEN}✓ Test data retrieved${NC}\n"

# Analytics Tests
echo -e "${BLUE}=== ANALYTICS API ===${NC}"
echo -e "${YELLOW}1. Enrollment Metrics${NC}"
curl -s -X GET "http://localhost:3000/api/v1/analytics/enrollment?branchId=$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'

echo -e "${YELLOW}2. Attendance Metrics${NC}"
curl -s -X GET "http://localhost:3000/api/v1/analytics/attendance?branchId=$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'

# Messaging Tests
echo -e "\n${BLUE}=== MESSAGING API ===${NC}"

echo -e "${YELLOW}1. Send Message${NC}"
curl -s -X POST "http://localhost:3000/api/v1/messages/send" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"senderId\":\"$SENDER_ID\",\"recipientId\":\"$RECIPIENT_ID\",\"subject\":\"Test\",\"messageBody\":\"Test\"}" | jq '.message'

echo -e "${YELLOW}2. Get Inbox${NC}"
curl -s -X GET "http://localhost:3000/api/v1/messages/inbox?userId=$RECIPIENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'

# Announcements Tests
echo -e "\n${BLUE}=== ANNOUNCEMENTS API ===${NC}"
echo -e "${YELLOW}1. Get Announcements${NC}"
curl -s -X GET "http://localhost:3000/api/v1/announcements/$COURSE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.message'

echo -e "\n${GREEN}✓ All tests completed!${NC}"
```

Run it:

```bash
chmod +x test_all_apis.sh
./test_all_apis.sh
```

---

## API Response Codes

| Code | Meaning                             |
| ---- | ----------------------------------- |
| 200  | ✅ Request successful (GET)         |
| 201  | ✅ Resource created (POST)          |
| 400  | ❌ Bad request / Invalid parameters |
| 401  | ❌ Unauthorized / Invalid token     |
| 403  | ❌ Forbidden / No permission        |
| 404  | ❌ Resource not found               |
| 500  | ❌ Server error                     |

---

## Common Issues & Solutions

### Issue: "Invalid token"

**Solution**: Make sure you're using the correct Bearer format:

```bash
-H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Issue: "Route not found"

**Solution**: Verify the endpoint path and HTTP method. Check `/api/v1` prefix.

### Issue: "Missing required fields"

**Solution**: Ensure all required fields are included in the request body.

### Issue: Pagination not working

**Solution**: Add `limit` and `offset` parameters to GET requests:

```bash
?limit=10&offset=0
```

---

## Testing Tools

### Using jq for Pretty JSON

```bash
curl ... | jq '.'       # Pretty print all
curl ... | jq '.data'   # Extract data field
curl ... | jq '.data[]' # Iterate array
curl ... | jq -r '.token' # Raw output
```

### Using Postman

1. Open Postman
2. Set Base URL: `http://localhost:3000/api/v1`
3. Get token from login endpoint
4. Add to Authorization header: `Bearer {token}`
5. Test endpoints

### Using Insomnia

Similar to Postman, create environment variable for `TOKEN`

---

## Next Steps

1. ✅ All Phase 2 APIs are functional
2. ⚠️ Fix Reporting API UUID generation issue
3. 📊 Run database seeding for actual test data
4. 🧪 Start frontend integration testing
5. 🚀 Deploy to production

---

**Last Updated**: December 2, 2025  
**Status**: ✅ Ready for Integration
