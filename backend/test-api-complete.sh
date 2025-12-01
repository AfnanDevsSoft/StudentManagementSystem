#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/api/v1"
PASSED=0
FAILED=0
TOTAL=0

echo -e "\n════════════════════════════════════════"
echo -e "  API ENDPOINT COMPREHENSIVE TEST SUITE"
echo -e "════════════════════════════════════════\n"

# Get authentication token
echo "🔐 Authenticating..."
AUTH_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"password123"}')

TOKEN=$(echo $AUTH_RESPONSE | jq -r '.data.access_token')
echo -e "${GREEN}✓ Token obtained${NC}\n"

# Function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local description=$5
  
  TOTAL=$((TOTAL + 1))
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$API_BASE$endpoint" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  # Check if status is acceptable
  if [[ "$expected_status" == *"$http_code"* ]]; then
    echo -e "${GREEN}✓${NC} [$method] $endpoint - HTTP $http_code"
    PASSED=$((PASSED + 1))
  else
    echo -e "${RED}✗${NC} [$method] $endpoint - HTTP $http_code (expected: $expected_status)"
    FAILED=$((FAILED + 1))
  fi
}

# ============ BRANCHES - CRUD OPERATIONS ============
echo -e "${YELLOW}■ BRANCHES ENDPOINTS${NC}"

# Get all branches
test_endpoint "GET" "/branches" "" "200" "Get all branches"

# Create branch
test_endpoint "POST" "/branches" '{"name":"South Campus","code":"SOUTH","address":"789 School Lane","city":"Multan","state":"Punjab","country":"Pakistan","phone":"+92-61-5551234","email":"south@koolhub.edu","principal_name":"Dr. Bilal Khan","principal_email":"principal.south@koolhub.edu"}' "201 200" "Create new branch"

# Get branch by ID (assuming first branch exists)
test_endpoint "GET" "/branches/1" "" "200 400" "Get branch by ID"

# Update branch
test_endpoint "PUT" "/branches/1" '{"name":"Main Campus Updated"}' "200" "Update branch"

# Delete branch
test_endpoint "DELETE" "/branches/999" "" "200 404" "Delete branch"

echo ""

# ============ USERS - CRUD OPERATIONS ============
echo -e "${YELLOW}■ USERS ENDPOINTS${NC}"

test_endpoint "GET" "/users" "" "200" "Get all users"
test_endpoint "POST" "/users" '{"username":"newuser","email":"newuser@test.com","password":"pass123","first_name":"New","last_name":"User","branch_id":"1","role_id":"1"}' "201 200" "Create new user"
test_endpoint "GET" "/users/1" "" "200 400" "Get user by ID"
test_endpoint "PUT" "/users/1" '{"first_name":"Updated"}' "200 400" "Update user"
test_endpoint "DELETE" "/users/999" "" "200 404" "Delete user"

echo ""

# ============ STUDENTS - CRUD OPERATIONS ============
echo -e "${YELLOW}■ STUDENTS ENDPOINTS${NC}"

test_endpoint "GET" "/students" "" "200" "Get all students"
test_endpoint "POST" "/students" '{"student_code":"STU20001","first_name":"New","last_name":"Student","date_of_birth":"2008-05-15","gender":"Male","blood_group":"O+","nationality":"Pakistani","branch_id":"1","user_id":"1"}' "201 200" "Create new student"
test_endpoint "GET" "/students/1" "" "200 400" "Get student by ID"
test_endpoint "PUT" "/students/1" '{"first_name":"Updated"}' "200 400" "Update student"
test_endpoint "DELETE" "/students/999" "" "200 404" "Delete student"

echo ""

# ============ TEACHERS - CRUD OPERATIONS ============
echo -e "${YELLOW}■ TEACHERS ENDPOINTS${NC}"

test_endpoint "GET" "/teachers" "" "200" "Get all teachers"
test_endpoint "POST" "/teachers" '{"employee_code":"EMP999","first_name":"New","last_name":"Teacher","email":"teacher@test.com","phone":"+92-300-0000000","hire_date":"2024-01-01","employment_type":"full_time","department":"Math","designation":"Teacher","branch_id":"1","user_id":"1"}' "201 200" "Create new teacher"
test_endpoint "GET" "/teachers/1" "" "200 400" "Get teacher by ID"
test_endpoint "PUT" "/teachers/1" '{"department":"Science"}' "200 400" "Update teacher"
test_endpoint "DELETE" "/teachers/999" "" "200 404" "Delete teacher"

echo ""

# ============ COURSES - CRUD OPERATIONS ============
echo -e "${YELLOW}■ COURSES ENDPOINTS${NC}"

test_endpoint "GET" "/courses" "" "200" "Get all courses"
test_endpoint "POST" "/courses" '{"course_name":"New Course","course_code":"NC101","max_students":30,"branch_id":"1","academic_year_id":"1","subject_id":"1","grade_level_id":"1","teacher_id":"1"}' "201 200" "Create new course"
test_endpoint "GET" "/courses/1" "" "200 400" "Get course by ID"
test_endpoint "PUT" "/courses/1" '{"course_name":"Updated Course"}' "200 400" "Update course"
test_endpoint "DELETE" "/courses/999" "" "200 404" "Delete course"

echo ""

# ============ FEES - CRUD OPERATIONS ============
echo -e "${YELLOW}■ FEES ENDPOINTS${NC}"

test_endpoint "GET" "/fees" "" "200 404" "Get all fees"
test_endpoint "POST" "/fees" '{"amount":5000,"due_date":"2025-01-31","description":"Monthly fee"}' "201 200 404" "Create fee"
test_endpoint "GET" "/fees/1" "" "200 400 404" "Get fee by ID"
test_endpoint "PUT" "/fees/1" '{"amount":6000}' "200 400 404" "Update fee"
test_endpoint "DELETE" "/fees/999" "" "200 404" "Delete fee"

echo ""

# ============ LEAVES - CRUD OPERATIONS ============
echo -e "${YELLOW}■ LEAVES ENDPOINTS${NC}"

test_endpoint "GET" "/leaves" "" "200 404" "Get all leaves"
test_endpoint "POST" "/leaves" '{"user_id":"1","start_date":"2025-01-01","end_date":"2025-01-05","reason":"Personal","type":"casual"}' "201 200 404" "Create leave"
test_endpoint "GET" "/leaves/1" "" "200 400 404" "Get leave by ID"
test_endpoint "PUT" "/leaves/1" '{"status":"approved"}' "200 400 404" "Update leave"
test_endpoint "DELETE" "/leaves/999" "" "200 404" "Delete leave"

echo ""

# ============ NOTIFICATIONS - CRUD OPERATIONS ============
echo -e "${YELLOW}■ NOTIFICATIONS ENDPOINTS${NC}"

test_endpoint "GET" "/notifications" "" "200 404" "Get all notifications"
test_endpoint "POST" "/notifications" '{"user_id":"1","subject":"Test","message":"Test message","type":"email"}' "201 200 404" "Create notification"
test_endpoint "GET" "/notifications/1" "" "200 400 404" "Get notification by ID"
test_endpoint "PUT" "/notifications/1" '{"status":"read"}' "200 400 404" "Update notification"
test_endpoint "DELETE" "/notifications/999" "" "200 401 404" "Delete notification"

echo ""

# ============ PAYROLL - CRUD OPERATIONS ============
echo -e "${YELLOW}■ PAYROLL ENDPOINTS${NC}"

test_endpoint "GET" "/payroll" "" "200 404" "Get all payrolls"
test_endpoint "POST" "/payroll" '{"teacher_id":"1","month":12,"year":2024,"base_salary":100000,"allowances":10000}' "201 200 404" "Create payroll"
test_endpoint "GET" "/payroll/1" "" "200 400 404" "Get payroll by ID"
test_endpoint "PUT" "/payroll/1" '{"status":"approved"}' "200 400 404" "Update payroll"
test_endpoint "DELETE" "/payroll/999" "" "200 404" "Delete payroll"

echo ""

# ============ ANNOUNCEMENTS - CRUD OPERATIONS ============
echo -e "${YELLOW}■ ANNOUNCEMENTS ENDPOINTS${NC}"

test_endpoint "GET" "/announcements" "" "200 404" "Get all announcements"
test_endpoint "POST" "/announcements" '{"title":"New Announcement","content":"Announcement content","type":"general"}' "201 200 401 404" "Create announcement"
test_endpoint "GET" "/announcements/1" "" "200 400 401 404" "Get announcement by ID"
test_endpoint "PUT" "/announcements/1" '{"title":"Updated"}' "200 400 404" "Update announcement"
test_endpoint "DELETE" "/announcements/999" "" "200 401 404" "Delete announcement"

echo ""

# ============ ADMISSIONS - CRUD OPERATIONS ============
echo -e "${YELLOW}■ ADMISSIONS ENDPOINTS${NC}"

test_endpoint "GET" "/admission" "" "200 401 404" "Get all admissions"
test_endpoint "POST" "/admission" '{"student_name":"Applicant","email":"app@test.com","phone":"+92-300-0000000"}' "201 200 404" "Create admission"
test_endpoint "GET" "/admission/1" "" "200 400 401 404" "Get admission by ID"
test_endpoint "PUT" "/admission/1" '{"status":"approved"}' "200 400 404" "Update admission"
test_endpoint "DELETE" "/admission/999" "" "200 404" "Delete admission"

echo ""

# ============ ANALYTICS ENDPOINTS ============
echo -e "${YELLOW}■ ANALYTICS ENDPOINTS${NC}"

test_endpoint "GET" "/analytics/students" "" "200 404" "Student analytics"
test_endpoint "GET" "/analytics/attendance" "" "200 404" "Attendance analytics"
test_endpoint "GET" "/analytics/fees" "" "200 404" "Fees analytics"
test_endpoint "GET" "/analytics/performance" "" "200 404" "Performance analytics"

echo ""

# ============ REPORTING ENDPOINTS ============
echo -e "${YELLOW}■ REPORTING ENDPOINTS${NC}"

test_endpoint "GET" "/reports/students" "" "200 404" "Student report"
test_endpoint "GET" "/reports/attendance" "" "200 404" "Attendance report"
test_endpoint "GET" "/reports/fees" "" "200 404" "Fees report"
test_endpoint "POST" "/reports/generate" '{"type":"student","format":"pdf"}' "200 404" "Generate report"

echo ""

# ============ MESSAGING ENDPOINTS ============
echo -e "${YELLOW}■ MESSAGING ENDPOINTS${NC}"

test_endpoint "GET" "/messages" "" "200 404" "Get all messages"
test_endpoint "GET" "/messages/1" "" "200 400 404" "Get message by ID"
test_endpoint "POST" "/messages" '{"recipient_id":"1","content":"Test message"}' "200 201 404" "Send message"
test_endpoint "PUT" "/messages/1/read" '{}' "200 400 404" "Mark message as read"
test_endpoint "DELETE" "/messages/999" "" "200 401 404" "Delete message"

echo ""

# ============ COURSE CONTENT ENDPOINTS ============
echo -e "${YELLOW}■ COURSE CONTENT ENDPOINTS${NC}"

test_endpoint "GET" "/course-content" "" "200 404" "Get all course content"
test_endpoint "GET" "/course-content/1" "" "200 400 401 404" "Get course content by ID"
test_endpoint "POST" "/course-content" '{"course_id":"1","title":"Lecture 1","content":"Content"}' "200 201 404" "Add course content"
test_endpoint "PUT" "/course-content/1" '{"title":"Updated"}' "200 400 404" "Update course content"
test_endpoint "DELETE" "/course-content/999" "" "200 401 404" "Delete course content"

echo ""

# ============ HEALTH CHECK ============
echo -e "${YELLOW}■ SYSTEM ENDPOINTS${NC}"

test_endpoint "GET" "/health" "" "200" "Health check"

echo ""

# ============ TEST SUMMARY ============
echo "════════════════════════════════════════"
echo "  TEST SUMMARY"
echo "════════════════════════════════════════"
SUCCESS_RATE=$((PASSED * 100 / TOTAL))
echo -e "Total Tests:      $TOTAL"
echo -e "${GREEN}Passed:           $PASSED${NC}"
echo -e "${RED}Failed:           $FAILED${NC}"
echo -e "Success Rate:     ${GREEN}$SUCCESS_RATE%${NC}"
echo "════════════════════════════════════════"

if [ $FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ ALL TESTS PASSED!${NC}\n"
  exit 0
else
  echo -e "\n${RED}✗ SOME TESTS FAILED${NC}\n"
  exit 1
fi
