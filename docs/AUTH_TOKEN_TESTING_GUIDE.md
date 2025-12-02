# Authentication & Token Storage Testing Guide

## ✅ Complete Auth Flow Implementation

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│           FRONTEND (Next.js 15.1.2)                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. Login Form (src/views/Login.jsx)               │
│     ↓ Username: admin1, Password: password123      │
│     ↓ Valibot validation                            │
│                                                     │
│  2. NextAuth Credentials Provider (src/libs/auth.js)│
│     ↓ signIn('credentials', {...})                 │
│     ↓ authorize() callback                          │
│                                                     │
│  3. Backend API Call                                │
│     ↓ POST /api/auth/login                         │
│     ↓ { username, password }                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│          BACKEND (Express, Port 5000)               │
│     ↓ Validates credentials                         │
│     ↓ Returns: { access_token, refresh_token, user }│
├─────────────────────────────────────────────────────┤
│                                                     │
│  4. JWT Callback (src/libs/auth.js)                │
│     ↓ token.id = user.id                           │
│     ↓ token.role = user.role (SuperAdmin|Teacher|Student)
│     ↓ token.accessToken = backend access_token    │
│     ↓ token.refreshToken = backend refresh_token  │
│                                                     │
│  5. Session Callback (src/libs/auth.js)            │
│     ↓ session.user = { ...token data }             │
│                                                     │
│  6. useAuth Hook (src/hooks/useAuth.js)            │
│     ↓ session → localStorage sync                  │
│     ↓ localStorage.access_token                    │
│     ↓ localStorage.user_role                       │
│     ↓ window.authToken = access_token              │
│                                                     │
│  7. Middleware Redirect (middleware.js)            │
│     ↓ Check token.role                             │
│     ↓ Redirect to /dashboards/{admin|teacher|student}
│                                                     │
│  8. Dashboard Display                              │
│     ↓ Shows role-specific content                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🧪 Testing Checklist

### Phase 1: Environment Setup
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:3001
- [ ] NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
- [ ] NEXTAUTH_SECRET configured
- [ ] NEXTAUTH_URL=http://localhost:3001

### Phase 2: Login Flow Test

#### Test Account 1: Admin
```
Username: admin1
Password: password123
Expected Role: SuperAdmin
Expected Dashboard: /dashboards/admin
```

**Steps:**
1. Navigate to http://localhost:3001/login
2. Enter admin1 / password123
3. Click "Log In"
4. Verify:
   - ✅ No errors shown
   - ✅ Redirects to /dashboards/admin
   - ✅ Dashboard displays with admin content

#### Test Account 2: Teacher
```
Username: teacher1
Password: password123
Expected Role: BranchAdmin or Teacher
Expected Dashboard: /dashboards/teacher
```

#### Test Account 3: Student
```
Username: student1
Password: password123
Expected Role: Student
Expected Dashboard: /dashboards/student
```

### Phase 3: Token Storage Verification

After successful login, verify tokens are stored:

#### 1. Browser Cookies
**How to check:**
1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Select localhost:3001
4. Look for: `next-auth.session-token`

**Expected:**
- ✅ Cookie present
- ✅ Value is long JWT string
- ✅ Secure flag set
- ✅ HttpOnly flag set

**Verify in Console:**
```javascript
// In browser console, execute:
document.cookie.split(';').forEach(c => {
  if (c.includes('session')) console.log(c)
})
```

#### 2. localStorage
**How to check:**
1. Open browser DevTools (F12)
2. Go to Application → Local Storage
3. Select localhost:3001

**Expected:**
```javascript
{
  "access_token": "eyJ0eXAiOiJKV1QiLC...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLC...",
  "user_role": "SuperAdmin",
  "user_id": "1",
  "username": "admin1"
}
```

**Verify in Console:**
```javascript
// In browser console, execute:
{
  accessToken: localStorage.getItem('access_token')?.substring(0, 50) + '...',
  refreshToken: localStorage.getItem('refresh_token')?.substring(0, 50) + '...',
  role: localStorage.getItem('user_role'),
  id: localStorage.getItem('user_id'),
  username: localStorage.getItem('username')
}
```

#### 3. Session Data
**Verify in Console:**
```javascript
// Using next-auth hook:
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
console.log(session?.user)

// Expected output:
{
  id: '1',
  username: 'admin1',
  role: 'SuperAdmin',
  email: 'admin1@koolhub.edu',
  accessToken: 'eyJ0eXAi...',
  refreshToken: 'eyJ0eXAi...'
}
```

### Phase 4: API Request Verification

#### Test API Call with Token
```javascript
// In browser console:
const response = await fetch(
  'http://localhost:5000/api/v1/users',
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    }
  }
)
console.log(await response.json())
```

**Expected:**
- ✅ Status 200 OK
- ✅ Response contains data (not 401 Unauthorized)

#### Test API Client
```javascript
// In browser console:
import { api } from '@/libs/api'

api.get('/users').then(data => console.log(data))
```

### Phase 5: Role-Based Redirect Verification

**Admin Flow:**
```
/login → admin1/password123 → /dashboards/admin
```

**Teacher Flow:**
```
/login → teacher1/password123 → /dashboards/teacher
```

**Student Flow:**
```
/login → student1/password123 → /dashboards/student
```

### Phase 6: Error Handling

#### Test Invalid Credentials
```
Username: invalid
Password: wrong
```

**Expected:**
- ✅ Error message displayed
- ✅ No redirect happens
- ✅ User stays on login page

#### Test Empty Fields
**Expected:**
- ✅ Form validation errors
- ✅ Submit button disabled/inactive

### Phase 7: Logout Verification

**Steps:**
1. Login successfully
2. Click logout button
3. Verify:
   - ✅ Redirects to /login
   - ✅ localStorage cleared
   - ✅ Session cookie cleared
   - ✅ Cannot access protected routes

**Verify in Console after logout:**
```javascript
localStorage.getItem('access_token')  // Should be null
document.cookie  // Should not contain session-token
```

### Phase 8: Token Refresh (Long Session Test)

**How it works:**
- Token issued for 30 days
- Auto-refresh after 25 days
- Uses refresh_token endpoint

**To test refresh manually:**
```javascript
// In browser console:
import { api } from '@/libs/api'

const refreshToken = localStorage.getItem('refresh_token')
const response = await fetch(
  'http://localhost:5000/api/v1/auth/refresh',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${refreshToken}`,
      'Content-Type': 'application/json'
    }
  }
)
const data = await response.json()
console.log(data)  // Should contain new access_token
```

## 📋 Files Modified for Auth

1. **src/libs/auth.js** (140 lines)
   - CredentialProvider with backend API call
   - JWT callback for token storage
   - Session callback for user data
   - Token refresh logic
   - Comprehensive logging

2. **src/hooks/useAuth.js** (NEW - 80 lines)
   - useSession integration
   - localStorage sync
   - Token getters
   - Role checking utilities

3. **src/libs/api.js** (NEW - 100 lines)
   - Auto token injection in headers
   - API method helpers (get, post, put, delete)
   - Error handling (401 redirect)
   - Logging

4. **src/views/Login.jsx** (Updated)
   - Test credentials: admin1/password123, teacher1, student1
   - Username field (not email)
   - Role-based redirect logic
   - Error state display

5. **middleware.js** (70 lines)
   - Role-based routing
   - Protected route handling
   - getDashboardUrl mapping

## 🔍 Debugging Tips

### Enable Auth Debug Logging
In your component:
```javascript
import AuthDebug from '@/components/AuthDebug'

// Add to your layout or page
export default function Page() {
  return (
    <>
      <AuthDebug />
      {/* Your content */}
    </>
  )
}
```

Then check browser console (F12) for auth info.

### Common Issues

#### Issue: "Invalid credentials" error
**Check:**
1. Username is correct (admin1, not admin)
2. Password is correct (password123)
3. Backend is running on port 5000
4. NEXT_PUBLIC_API_URL is set correctly

#### Issue: Token not in localStorage
**Check:**
1. useAuth hook is mounted in your component
2. Session is not loading (status !== 'loading')
3. Backend returned tokens in response

#### Issue: 401 Unauthorized on API calls
**Check:**
1. Token is valid (not expired)
2. Token format: `Bearer ${token}` in headers
3. API endpoint requires authentication
4. Token has not been cleared

#### Issue: Can't access dashboard after login
**Check:**
1. Middleware is redirecting correctly
2. Dashboard pages exist
3. Role mapping is correct
4. Token contains role field

## 📊 Expected Test Results

### Successful Login
```
✅ Form submits
✅ No validation errors
✅ Backend returns 200 OK
✅ User data extracted correctly
✅ Tokens stored in JWT
✅ Session created with role
✅ localStorage populated
✅ Redirects to correct dashboard
✅ Dashboard content displays
✅ useSession() returns user data
```

### Successful API Call
```
✅ Token injected in headers
✅ Authorization header: "Bearer {token}"
✅ Backend receives request
✅ Returns 200 OK (not 401)
✅ Data returned successfully
```

### Successful Logout
```
✅ Logout button works
✅ Redirects to /login
✅ localStorage cleared
✅ Cookies deleted
✅ Protected routes inaccessible
```

## 🚀 Quick Start

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend/full-version
npm run dev

# Open browser
http://localhost:3001/login

# Login with
Username: admin1
Password: password123

# Check console
F12 → Console → Look for debug messages
```

## 📝 Notes

- Tokens stored in JWT callback with 30-day maxAge
- localStorage acts as backup for token persistence
- API client auto-injects tokens from localStorage
- Middleware validates tokens and redirects based on role
- Debug component logs all auth info to console
