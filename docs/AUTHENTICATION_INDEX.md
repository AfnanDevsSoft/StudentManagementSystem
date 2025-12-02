# Frontend Authentication - Complete Index

## 📍 Quick Navigation

### Documentation Files
1. **[FRONTEND_AUTHENTICATION_SETUP.md](./FRONTEND_AUTHENTICATION_SETUP.md)**
   - Complete setup guide with examples
   - Backend integration details
   - Component usage patterns
   - Troubleshooting section
   - Production security notes

2. **[FRONTEND_AUTH_QUICK_VERIFICATION.md](./FRONTEND_AUTH_QUICK_VERIFICATION.md)**
   - Quick checklist of changes made
   - Testing steps and verification
   - Debugging commands
   - Success indicators

## 🔧 Updated Source Files

### 1. Frontend - Login Form
**File**: `/frontend/full-version/src/views/Login.jsx`
- **Change**: Email field → Username field
- **Line 43**: Validation schema changed
- **Line 72**: Default values updated
- **Line 95**: Form field renamed to `username`

### 2. Frontend - Authentication Configuration
**File**: `/frontend/full-version/src/libs/auth.js`
- **Lines 24-41**: Backend API endpoint and parameter updates
- **Lines 43-60**: User data extraction from backend response
- **Lines 78-104**: JWT callbacks for session management

### 3. Frontend - Environment Variables
**File**: `/frontend/full-version/.env.local`
- **NEW**: Created with API configuration
- **NEXT_PUBLIC_API_URL**: Backend API base URL
- **NEXTAUTH_URL**: NextAuth configuration
- **NEXTAUTH_SECRET**: Session encryption key

## 🎯 What Was Changed

### Before Integration
```
Frontend ❌ Backend
Email field            →  Username field required
/login endpoint        →  /auth/login endpoint
{ email, password }    →  { username, password }
No session config      →  JWT needed
```

### After Integration
```
Frontend ✅ Backend
Username field         ←→  Username accepted
/api/v1/auth/login     ←→  API endpoint aligned
{ username, password } ←→  Correct format
JWT session active     ←→  Tokens received and stored
```

## 🚀 Testing Workflow

### 1. Prerequisites
```bash
# Ensure backend is running
cd backend && npm start
# Port: 3000

# Ensure database has test user
# Username: admin, Password: admin
```

### 2. Start Frontend
```bash
cd frontend/full-version
npm run dev
# Port: 3001
```

### 3. Test Login
- URL: `http://localhost:3001/login`
- Username: `admin`
- Password: `admin`

### 4. Verify Success
- ✅ Form submits without error
- ✅ Redirects to home page
- ✅ User is authenticated
- ✅ Session contains user data

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Login.jsx (Form UI)                                    │
│  ↓ (username + password)                                │
│  NextAuth Credentials Provider (auth.js)               │
│  ↓ (validate form)                                      │
│  POST /api/v1/auth/login                               │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  Network Request (HTTP)                                 │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Express)                     │
│                                                           │
│  AuthController.login()                                 │
│  ↓ (validate input)                                     │
│  AuthService.login(username, password)                  │
│  ↓ (check database)                                     │
│  Database (Prisma ORM → PostgreSQL)                    │
│  ↓ (return user + tokens)                               │
│  JWT Response (access_token, refresh_token)           │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  Network Response (HTTP)                                │
├─────────────────────────────────────────────────────────┤
│                   FRONTEND (Next.js)                     │
│                                                           │
│  NextAuth JWT Callback                                  │
│  ↓ (store tokens in JWT)                                │
│  Session Created (30 days)                              │
│  ↓ (redirect to home)                                   │
│  useSession() Hook Available                            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
User Login Page
  ↓
Enter username & password
  ↓
Submit form
  ↓
Valibot validation (client-side)
  ↓
signIn('credentials', { email, password, redirect: false })
  ↓
NextAuth authorize() function
  ↓
POST http://localhost:3000/api/v1/auth/login
     { username: "admin", password: "admin" }
  ↓
Backend validates credentials
  ↓
Generate JWT tokens & fetch user data
  ↓
Response:
{
  access_token: "eyJ...",
  refresh_token: "eyJ...",
  user: { id, username, email, role, ... }
}
  ↓
NextAuth jwt() callback
  ↓
Store tokens & user data in JWT
  ↓
NextAuth session() callback
  ↓
Prepare session object
  ↓
Redirect to home page
  ↓
useSession() returns authenticated user
```

## 💾 Data Flow

### Request Flow
```
Form Input
  ↓
{ username: "admin", password: "admin" }
  ↓
NextAuth.js serializes
  ↓
HTTP POST request
  ↓
Backend receives
  ↓
Database query
  ↓
Password verification (bcrypt)
  ↓
Token generation
```

### Response Flow
```
Backend generates response
  ↓
{ access_token, refresh_token, user }
  ↓
HTTP response (200 OK)
  ↓
Frontend receives
  ↓
NextAuth extracts tokens & user
  ↓
JWT callback stores in session
  ↓
session() callback formats response
  ↓
useSession() hook returns data
```

## 🎓 Component Usage

### In Client Components
```javascript
'use client'
import { useSession } from 'next-auth/react'

export default function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <p>Loading...</p>
  if (status === 'unauthenticated') return <p>Not signed in</p>
  
  return (
    <div>
      <p>Welcome, {session.user.username}!</p>
      <p>Role: {session.user.role}</p>
    </div>
  )
}
```

### In Server Components
```javascript
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'

export default async function MyPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return <p>Please sign in first</p>
  }
  
  return <p>Welcome, {session.user.username}!</p>
}
```

### Protected Routes
```javascript
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'

export default async function ProtectedPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }
  
  return <div>Protected content</div>
}
```

## 🔍 Debugging Checklist

### Backend Issues
- [ ] Is backend running on port 3000?
- [ ] Is database connected?
- [ ] Is admin user created in database?
- [ ] Check backend logs for errors

### Frontend Issues
- [ ] Is frontend running on port 3001?
- [ ] Is `.env.local` file created?
- [ ] Is `NEXT_PUBLIC_API_URL` correct?
- [ ] Check browser console for errors

### Network Issues
- [ ] Can curl reach backend: `curl http://localhost:3000`
- [ ] Test login endpoint: POST `/api/v1/auth/login`
- [ ] Check Network tab in DevTools
- [ ] Verify CORS is enabled on backend

### Session Issues
- [ ] Check cookies in DevTools (Application tab)
- [ ] Verify `NEXTAUTH_SECRET` is set
- [ ] Check session: `fetch('/api/auth/session')`
- [ ] Verify SessionProvider wraps app

## 📚 Related Backend Files

- Auth Service: `/backend/src/services/auth.service.ts`
- Auth Routes: `/backend/src/routes/auth.routes.ts`
- User Model: `/backend/src/models/user.model.ts`
- Database Schema: `/backend/prisma/schema.prisma`

## 🔗 Frontend Configuration Files

- NextAuth Config: `/frontend/full-version/src/libs/auth.js`
- Login Form: `/frontend/full-version/src/views/Login.jsx`
- Auth Route: `/frontend/full-version/src/app/api/auth/[...nextauth]/route.js`
- Environment: `/frontend/full-version/.env.local`

## ✅ Verification Checklist

After setup, verify:

- [ ] Login form displays with Username field
- [ ] Demo credentials shown: admin / admin
- [ ] Backend running on port 3000
- [ ] Frontend running on port 3001
- [ ] Can submit login form
- [ ] Backend receives request
- [ ] Frontend receives response
- [ ] Session created (check cookies)
- [ ] Redirect to home page
- [ ] User data available in components
- [ ] useSession() returns user object

## 🎯 Success Metrics

### Form Level
- ✅ Username field accepts input
- ✅ Password field accepts input
- ✅ Validation shows appropriate messages
- ✅ Form submits when valid

### Network Level
- ✅ POST request to /api/v1/auth/login
- ✅ Request body: { username, password }
- ✅ Response status: 200 OK
- ✅ Response includes tokens

### Session Level
- ✅ JWT cookie created and stored
- ✅ Session contains user data
- ✅ useSession() returns user info
- ✅ Session persists across page reload

### Application Level
- ✅ User redirected to home page
- ✅ Navigation shows user is logged in
- ✅ Protected pages are accessible
- ✅ User data available in components

## 🚀 Next Phase

After testing authentication:

1. **Token Refresh**: Implement automatic token refresh
2. **Route Guards**: Add middleware to protect routes
3. **API Client**: Create authenticated HTTP client
4. **User Registration**: Implement signup
5. **Logout**: Add logout functionality
6. **Profile**: Create user profile page
7. **Roles**: Implement role-based access control

## 📖 Reference Links

- NextAuth.js: https://next-auth.js.org
- Next.js: https://nextjs.org
- Express.js: https://expressjs.com
- JWT: https://jwt.io
- Prisma: https://www.prisma.io

## 💬 Support

For questions or issues:
1. Check the main documentation files
2. Review troubleshooting section
3. Check browser console for errors
4. Check backend logs
5. Verify environment configuration

---

**Status**: ✅ READY FOR TESTING
**Last Updated**: 2024
**Version**: 1.0

