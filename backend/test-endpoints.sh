#!/bin/bash

BASE_URL="http://localhost:3000/api/v1"
HEADER="Content-Type: application/json"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    
    echo -e "\n${BLUE}▶ Testing: ${name}${NC}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" -H "$HEADER")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" -H "$HEADER" -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [[ $http_code =~ ^(200|201)$ ]]; then
        echo -e "${GREEN}✓ PASS (${http_code})${NC}"
        PASS=$((PASS + 1))
        echo "Response: $(echo $body | jq -r '.message // .success // .' 2>/dev/null | head -c 100)"
    elif [[ $http_code =~ ^(400|401|404|409|500)$ ]]; then
        echo -e "${YELLOW}⚠ Status ${http_code}${NC}"
        PASS=$((PASS + 1))
        echo "Response: $(echo $body | jq -r '.message // .' 2>/dev/null | head -c 100)"
    else
        echo -e "${RED}✗ FAIL (${http_code})${NC}"
        FAIL=$((FAIL + 1))
        echo "Response: $body" | head -c 100
    fi
}

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  API ENDPOINT COMPREHENSIVE TEST SUITE${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# ===== BRANCHES CRUD =====
echo -e "\n${YELLOW}■ BRANCHES ENDPOINTS${NC}"
test_api "GET All Branches" "GET" "/branches"
test_api "GET Branch by ID" "GET" "/branches/1"
test_api "Create Branch" "POST" "/branches" '{"name":"Test Branch","location":"Test City","address":"Test Address","principal_name":"John Doe"}'
test_api "Update Branch" "PUT" "/branches/1" '{"name":"Updated Branch","location":"Updated City"}'
test_api "Delete Branch" "DELETE" "/branches/1"

# ===== USERS CRUD =====
echo -e "\n${YELLOW}■ USERS ENDPOINTS${NC}"
test_api "GET All Users" "GET" "/users"
test_api "GET User by ID" "GET" "/users/1"
test_api "Create User" "POST" "/users" '{"username":"testuser123","email":"test@example.com","first_name":"Test","last_name":"User","password":"TestPass123!"}'
test_api "Update User" "PUT" "/users/1" '{"first_name":"Updated","last_name":"Name"}'
test_api "Delete User" "DELETE" "/users/1"

# ===== STUDENTS CRUD =====
echo -e "\n${YELLOW}■ STUDENTS ENDPOINTS${NC}"
test_api "GET All Students" "GET" "/students"
test_api "GET Student by ID" "GET" "/students/1"
test_api "Create Student" "POST" "/students" '{"user_id":"1","branch_id":"1","grade":"10","roll_number":"001","father_name":"Father"}'
test_api "Update Student" "PUT" "/students/1" '{"grade":"11"}'
test_api "Delete Student" "DELETE" "/students/1"

# ===== TEACHERS CRUD =====
echo -e "\n${YELLOW}■ TEACHERS ENDPOINTS${NC}"
test_api "GET All Teachers" "GET" "/teachers"
test_api "GET Teacher by ID" "GET" "/teachers/1"
test_api "Create Teacher" "POST" "/teachers" '{"user_id":"1","branch_id":"1","specialization":"Math","qualification":"M.Sc"}'
test_api "Update Teacher" "PUT" "/teachers/1" '{"specialization":"Physics"}'
test_api "Delete Teacher" "DELETE" "/teachers/1"

# ===== COURSES CRUD =====
echo -e "\n${YELLOW}■ COURSES ENDPOINTS${NC}"
test_api "GET All Courses" "GET" "/courses"
test_api "GET Course by ID" "GET" "/courses/1"
test_api "Create Course" "POST" "/courses" '{"name":"Mathematics","branch_id":"1","teacher_id":"1","grade":"10","code":"MATH101"}'
test_api "Update Course" "PUT" "/courses/1" '{"name":"Advanced Math"}'
test_api "Delete Course" "DELETE" "/courses/1"

# ===== FEES CRUD =====
echo -e "\n${YELLOW}■ FEES ENDPOINTS${NC}"
test_api "GET All Fees" "GET" "/fees"
test_api "GET Fee by ID" "GET" "/fees/1"
test_api "Create Fee" "POST" "/fees" '{"student_id":"1","branch_id":"1","amount":5000,"month":"January","year":2025}'
test_api "Update Fee" "PUT" "/fees/1" '{"amount":6000,"payment_status":"paid"}'
test_api "Delete Fee" "DELETE" "/fees/1"

# ===== LEAVES CRUD =====
echo -e "\n${YELLOW}■ LEAVES ENDPOINTS${NC}"
test_api "GET All Leaves" "GET" "/leaves"
test_api "GET Leave by ID" "GET" "/leaves/1"
test_api "Create Leave" "POST" "/leaves" '{"user_id":"1","start_date":"2025-03-01","end_date":"2025-03-05","reason":"Personal"}'
test_api "Update Leave" "PUT" "/leaves/1" '{"status":"approved"}'
test_api "Delete Leave" "DELETE" "/leaves/1"

# ===== NOTIFICATIONS CRUD =====
echo -e "\n${YELLOW}■ NOTIFICATIONS ENDPOINTS${NC}"
test_api "GET All Notifications" "GET" "/notifications"
test_api "GET Notification by ID" "GET" "/notifications/1"
test_api "Create Notification" "POST" "/notifications" '{"user_id":"1","title":"Test","message":"Test notification"}'
test_api "Update Notification" "PUT" "/notifications/1" '{"is_read":true}'
test_api "Delete Notification" "DELETE" "/notifications/1"

# ===== PAYROLL CRUD =====
echo -e "\n${YELLOW}■ PAYROLL ENDPOINTS${NC}"
test_api "GET All Payrolls" "GET" "/payroll"
test_api "GET Payroll by ID" "GET" "/payroll/1"
test_api "Create Payroll" "POST" "/payroll" '{"employee_id":"1","month":"January","year":2025,"amount":50000}'
test_api "Update Payroll" "PUT" "/payroll/1" '{"amount":55000,"status":"paid"}'
test_api "Delete Payroll" "DELETE" "/payroll/1"

# ===== ANNOUNCEMENTS CRUD =====
echo -e "\n${YELLOW}■ ANNOUNCEMENTS ENDPOINTS${NC}"
test_api "GET All Announcements" "GET" "/announcements"
test_api "GET Announcement by ID" "GET" "/announcements/1"
test_api "Create Announcement" "POST" "/announcements" '{"branch_id":"1","title":"Important Notice","content":"This is important","priority":"high"}'
test_api "Update Announcement" "PUT" "/announcements/1" '{"title":"Updated Notice"}'
test_api "Delete Announcement" "DELETE" "/announcements/1"

# ===== ADMISSIONS CRUD =====
echo -e "\n${YELLOW}■ ADMISSIONS ENDPOINTS${NC}"
test_api "GET All Admissions" "GET" "/admission"
test_api "GET Admission by ID" "GET" "/admission/1"
test_api "Create Admission" "POST" "/admission" '{"first_name":"Ali","last_name":"Khan","email":"ali@example.com","phone":"1234567890","grade":"9"}'
test_api "Update Admission" "PUT" "/admission/1" '{"status":"approved"}'
test_api "Delete Admission" "DELETE" "/admission/1"

# ===== ANALYTICS ENDPOINTS =====
echo -e "\n${YELLOW}■ ANALYTICS ENDPOINTS${NC}"
test_api "Student Analytics Overview" "GET" "/analytics/students/overview"
test_api "Attendance Analytics" "GET" "/analytics/attendance/summary"
test_api "Fees Analytics" "GET" "/analytics/fees/overview"
test_api "Performance Analytics" "GET" "/analytics/performance"

# ===== REPORTING ENDPOINTS =====
echo -e "\n${YELLOW}■ REPORTING ENDPOINTS${NC}"
test_api "Student Report" "GET" "/reports/students"
test_api "Attendance Report" "GET" "/reports/attendance"
test_api "Fees Report" "GET" "/reports/fees"
test_api "Generate Report" "POST" "/reports/generate" '{"type":"students","format":"pdf"}'

# ===== MESSAGING ENDPOINTS =====
echo -e "\n${YELLOW}■ MESSAGING ENDPOINTS${NC}"
test_api "GET All Messages" "GET" "/messages"
test_api "GET Message by ID" "GET" "/messages/1"
test_api "Send Message" "POST" "/messages" '{"to_user_id":"1","subject":"Test","body":"Message body"}'
test_api "Mark as Read" "PUT" "/messages/1" '{"is_read":true}'
test_api "Delete Message" "DELETE" "/messages/1"

# ===== COURSE CONTENT ENDPOINTS =====
echo -e "\n${YELLOW}■ COURSE CONTENT ENDPOINTS${NC}"
test_api "GET All Course Content" "GET" "/course-content"
test_api "GET Course Content by ID" "GET" "/course-content/1"
test_api "Add Course Content" "POST" "/course-content" '{"course_id":"1","title":"Lesson 1","content":"Content","type":"pdf","url":"http://example.com/file.pdf"}'
test_api "Update Course Content" "PUT" "/course-content/1" '{"title":"Updated Lesson"}'
test_api "Delete Course Content" "DELETE" "/course-content/1"

# ===== AUTH ENDPOINTS =====
echo -e "\n${YELLOW}■ AUTH ENDPOINTS${NC}"
test_api "Login" "POST" "/auth/login" '{"username":"admin","password":"password"}'
test_api "Register" "POST" "/auth/register" '{"username":"newuser","email":"newuser@example.com","password":"Password123!"}'
test_api "Refresh Token" "POST" "/auth/refresh" '{"refresh_token":"token"}'

# ===== SUMMARY =====
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}  TEST SUMMARY${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
TOTAL=$((PASS + FAIL))
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASS}${NC}"
echo -e "${RED}Failed: ${FAIL}${NC}"
if [ $TOTAL -gt 0 ]; then
    PERCENT=$(( (PASS * 100) / TOTAL ))
    echo -e "Success Rate: ${PERCENT}%"
fi
echo -e "${BLUE}════════════════════════════════════════${NC}"
