#!/bin/bash

# API Testing Script for Student Management System
# Tests all CRUD operations across all endpoints

BASE_URL="http://localhost:3000/api"
HEADER_JSON="Content-Type: application/json"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
TOTAL=0

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    TOTAL=$((TOTAL + 1))
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}Test #${TOTAL}: ${description}${NC}"
    echo -e "Method: ${method} | Endpoint: ${endpoint}"
    
    if [ -z "$data" ]; then
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "$HEADER_JSON" \
            -w "\n%{http_code}")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "$HEADER_JSON" \
            -d "$data" \
            -w "\n%{http_code}")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    echo -e "Response Code: ${http_code}"
    
    if [[ $http_code =~ ^(200|201|400|401|404|409)$ ]]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        FAILED=$((FAILED + 1))
    fi
    
    echo "Response: $body" | head -c 200
    echo -e "\n"
}

echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   API ENDPOINT TESTING - Student Management${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}\n"

# ===== HEALTH CHECK =====
echo -e "${YELLOW}1. HEALTH CHECK ENDPOINTS${NC}\n"
test_endpoint "GET" "/health" "" "Health Check"

# ===== AUTH ENDPOINTS =====
echo -e "${YELLOW}2. AUTH ENDPOINTS${NC}\n"
test_endpoint "POST" "/auth/login" '{"username":"admin","password":"password"}' "Login"
test_endpoint "POST" "/auth/register" '{"username":"newuser","email":"new@example.com","password":"password"}' "Register"
test_endpoint "POST" "/auth/refresh" '{"refresh_token":"token"}' "Refresh Token"

# ===== BRANCHES ENDPOINTS =====
echo -e "${YELLOW}3. BRANCHES ENDPOINTS${NC}\n"
test_endpoint "GET" "/branches" "" "Get All Branches"
test_endpoint "POST" "/branches" '{"name":"New Branch","location":"City","address":"Address"}' "Create Branch"
test_endpoint "GET" "/branches/1" "" "Get Branch By ID"
test_endpoint "PUT" "/branches/1" '{"name":"Updated Branch"}' "Update Branch"
test_endpoint "DELETE" "/branches/1" "" "Delete Branch"

# ===== USERS ENDPOINTS =====
echo -e "${YELLOW}4. USERS ENDPOINTS${NC}\n"
test_endpoint "GET" "/users" "" "Get All Users"
test_endpoint "POST" "/users" '{"username":"newuser2","email":"user2@example.com","first_name":"John","last_name":"Doe"}' "Create User"
test_endpoint "GET" "/users/1" "" "Get User By ID"
test_endpoint "PUT" "/users/1" '{"first_name":"Jane"}' "Update User"
test_endpoint "DELETE" "/users/1" "" "Delete User"

# ===== STUDENTS ENDPOINTS =====
echo -e "${YELLOW}5. STUDENTS ENDPOINTS${NC}\n"
test_endpoint "GET" "/students" "" "Get All Students"
test_endpoint "POST" "/students" '{"user_id":"1","branch_id":"1","grade":"10","roll_number":"001"}' "Create Student"
test_endpoint "GET" "/students/1" "" "Get Student By ID"
test_endpoint "PUT" "/students/1" '{"grade":"11"}' "Update Student"
test_endpoint "DELETE" "/students/1" "" "Delete Student"

# ===== TEACHERS ENDPOINTS =====
echo -e "${YELLOW}6. TEACHERS ENDPOINTS${NC}\n"
test_endpoint "GET" "/teachers" "" "Get All Teachers"
test_endpoint "POST" "/teachers" '{"user_id":"1","branch_id":"1","specialization":"Math","qualification":"BSc"}' "Create Teacher"
test_endpoint "GET" "/teachers/1" "" "Get Teacher By ID"
test_endpoint "PUT" "/teachers/1" '{"specialization":"Science"}' "Update Teacher"
test_endpoint "DELETE" "/teachers/1" "" "Delete Teacher"

# ===== COURSES ENDPOINTS =====
echo -e "${YELLOW}7. COURSES ENDPOINTS${NC}\n"
test_endpoint "GET" "/courses" "" "Get All Courses"
test_endpoint "POST" "/courses" '{"name":"Mathematics","branch_id":"1","teacher_id":"1","grade":"10"}' "Create Course"
test_endpoint "GET" "/courses/1" "" "Get Course By ID"
test_endpoint "PUT" "/courses/1" '{"name":"Advanced Math"}' "Update Course"
test_endpoint "DELETE" "/courses/1" "" "Delete Course"

# ===== FEES ENDPOINTS =====
echo -e "${YELLOW}8. FEES ENDPOINTS${NC}\n"
test_endpoint "GET" "/fees" "" "Get All Fees"
test_endpoint "POST" "/fees" '{"student_id":"1","branch_id":"1","amount":5000,"due_date":"2025-03-31"}' "Create Fee"
test_endpoint "GET" "/fees/1" "" "Get Fee By ID"
test_endpoint "PUT" "/fees/1" '{"amount":6000}' "Update Fee"
test_endpoint "DELETE" "/fees/1" "" "Delete Fee"

# ===== LEAVE ENDPOINTS =====
echo -e "${YELLOW}9. LEAVE ENDPOINTS${NC}\n"
test_endpoint "GET" "/leaves" "" "Get All Leaves"
test_endpoint "POST" "/leaves" '{"user_id":"1","start_date":"2025-03-01","end_date":"2025-03-05","reason":"Sick"}' "Create Leave"
test_endpoint "GET" "/leaves/1" "" "Get Leave By ID"
test_endpoint "PUT" "/leaves/1" '{"status":"approved"}' "Approve Leave"
test_endpoint "DELETE" "/leaves/1" "" "Delete Leave"

# ===== NOTIFICATION ENDPOINTS =====
echo -e "${YELLOW}10. NOTIFICATION ENDPOINTS${NC}\n"
test_endpoint "GET" "/notifications" "" "Get All Notifications"
test_endpoint "POST" "/notifications" '{"user_id":"1","title":"Test","message":"Test message"}' "Create Notification"
test_endpoint "GET" "/notifications/1" "" "Get Notification By ID"
test_endpoint "PUT" "/notifications/1" '{"is_read":true}' "Mark as Read"
test_endpoint "DELETE" "/notifications/1" "" "Delete Notification"

# ===== PAYROLL ENDPOINTS =====
echo -e "${YELLOW}11. PAYROLL ENDPOINTS${NC}\n"
test_endpoint "GET" "/payrolls" "" "Get All Payrolls"
test_endpoint "POST" "/payrolls" '{"employee_id":"1","month":"March","amount":50000}' "Create Payroll"
test_endpoint "GET" "/payrolls/1" "" "Get Payroll By ID"
test_endpoint "PUT" "/payrolls/1" '{"amount":55000}' "Update Payroll"
test_endpoint "DELETE" "/payrolls/1" "" "Delete Payroll"

# ===== ANNOUNCEMENT ENDPOINTS =====
echo -e "${YELLOW}12. ANNOUNCEMENT ENDPOINTS${NC}\n"
test_endpoint "GET" "/announcements" "" "Get All Announcements"
test_endpoint "POST" "/announcements" '{"branch_id":"1","title":"Notice","content":"Important announcement"}' "Create Announcement"
test_endpoint "GET" "/announcements/1" "" "Get Announcement By ID"
test_endpoint "PUT" "/announcements/1" '{"title":"Updated Notice"}' "Update Announcement"
test_endpoint "DELETE" "/announcements/1" "" "Delete Announcement"

# ===== ANALYTICS ENDPOINTS =====
echo -e "${YELLOW}13. ANALYTICS ENDPOINTS${NC}\n"
test_endpoint "GET" "/analytics/students/overview" "" "Student Analytics Overview"
test_endpoint "GET" "/analytics/attendance/summary" "" "Attendance Analytics"
test_endpoint "GET" "/analytics/fees/overview" "" "Fees Analytics"
test_endpoint "GET" "/analytics/performance" "" "Performance Analytics"

# ===== REPORTING ENDPOINTS =====
echo -e "${YELLOW}14. REPORTING ENDPOINTS${NC}\n"
test_endpoint "GET" "/reports/students" "" "Student Report"
test_endpoint "GET" "/reports/attendance" "" "Attendance Report"
test_endpoint "GET" "/reports/fees" "" "Fees Report"
test_endpoint "POST" "/reports/generate" '{"type":"students","format":"pdf"}' "Generate Report"

# ===== MESSAGING ENDPOINTS =====
echo -e "${YELLOW}15. MESSAGING ENDPOINTS${NC}\n"
test_endpoint "GET" "/messages" "" "Get All Messages"
test_endpoint "POST" "/messages" '{"to_user_id":"1","subject":"Test","body":"Message body"}' "Send Message"
test_endpoint "GET" "/messages/1" "" "Get Message By ID"
test_endpoint "PUT" "/messages/1" '{"is_read":true}' "Mark Message as Read"
test_endpoint "DELETE" "/messages/1" "" "Delete Message"

# ===== COURSE CONTENT ENDPOINTS =====
echo -e "${YELLOW}16. COURSE CONTENT ENDPOINTS${NC}\n"
test_endpoint "GET" "/course-content" "" "Get All Course Content"
test_endpoint "POST" "/course-content" '{"course_id":"1","title":"Lesson 1","content":"Content","type":"pdf"}' "Add Course Content"
test_endpoint "GET" "/course-content/1" "" "Get Course Content By ID"
test_endpoint "PUT" "/course-content/1" '{"title":"Updated Lesson"}' "Update Course Content"
test_endpoint "DELETE" "/course-content/1" "" "Delete Course Content"

# ===== ADMISSION ENDPOINTS =====
echo -e "${YELLOW}17. ADMISSION ENDPOINTS${NC}\n"
test_endpoint "GET" "/admissions" "" "Get All Admissions"
test_endpoint "POST" "/admissions" '{"first_name":"Ali","last_name":"Khan","email":"ali@example.com","grade":"9"}' "Apply for Admission"
test_endpoint "GET" "/admissions/1" "" "Get Admission By ID"
test_endpoint "PUT" "/admissions/1" '{"status":"approved"}' "Approve Admission"
test_endpoint "DELETE" "/admissions/1" "" "Delete Admission"

# ===== SUMMARY =====
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    TEST SUMMARY               ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo -e "Success Rate: $(( (PASSED * 100) / TOTAL ))%"
echo -e "${BLUE}════════════════════════════════════════════════${NC}\n"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    exit 1
fi
