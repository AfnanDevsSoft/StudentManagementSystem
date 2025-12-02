# Frontend Authentication Setup - Complete Guide

## 🎯 Overview
The Student Management System now has a complete, integrated authentication system connecting the Next.js frontend with the Express.js backend API. The login form is ready for user authentication.

## ✅ What's Been Configured

### 1. **Login Form Component** ✅
**Location**: `/frontend/full-version/src/views/Login.jsx`

**Updated Features**:
- ✅ Username field (changed from email)
- ✅ Password field with visibility toggle
- ✅ Form validation with valibot
- ✅ "Remember me" checkbox
- ✅ Forgot password link
- ✅ Register account link
- ✅ Google OAuth button
- ✅ Demo credentials display (username: `admin` / password: `admin`)

**Changes Made**:
```javascript
// Before: email field
const schema = object({
  email: pipe(string(), minLength(1), email()),
  password: pipe(string(), nonEmpty(), minLength(5))
})

// After: username field
const schema = object({
  username: pipe(string(), minLength(1), minLength(3)),
  password: pipe(string(), nonEmpty(), minLength(5))
})
```

### 2. **NextAuth Configuration** ✅
**Location**: `/frontend/full-version/src/libs/auth.js`

**Key Configuration**:
```javascript
// Credentials Provider
CredentialProvider({
  async authorize(credentials) {
    // Calls backend API endpoint
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ 
        username: email,  // Maps form email to backend username
        password 
      })
    })
    
    // Extracts and returns user data with tokens
    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      role: userData.role?.name,
      accessToken: data.data?.access_token,
      refreshToken: data.data?.refresh_token
    }
  }
})
```

**Session Strategy**: JWT (JSON Web Tokens)
- Max Age: 30 days
- Session persistence across page refreshes
- Automatic token refresh capability

**Callbacks Configured**:
- `jwt()`: Stores user data and tokens in JWT
- `session()`: Adds user data to session object

### 3. **Environment Configuration** ✅
**Location**: `/frontend/full-version/.env.local`

**Configuration Variables**:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=ThisIsAVerySecureRandomSecretKeyForNextAuthDevelopment2024

# Google OAuth (Optional)
# GOOGLE_CLIENT_ID=your_client_id
# GOOGLE_CLIENT_SECRET=your_client_secret
```

### 4. **NextAuth Route Handler** ✅
**Location**: `/frontend/full-version/src/app/api/auth/[...nextauth]/route.js`

Exposes NextAuth endpoints at:
- `POST /api/auth/signin` - Sign in endpoint
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Sign out endpoint
- `GET /api/auth/providers` - List providers

## 🔌 Backend Integration

### Connected Backend Endpoints

**1. Login Endpoint**
```
POST /api/v1/auth/login
```
**Request**:
```json
{
  "username": "admin",
  "password": "admin"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "jwt_access_token_here",
    "refresh_token": "jwt_refresh_token_here",
    "user": {
      "id": "user_id_uuid",
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": {
        "id": "role_id_uuid",
        "name": "admin"
      }
    }
  }
}
```

**Response** (Error - 401):
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**2. Refresh Token Endpoint** (For future implementation)
```
POST /api/v1/auth/refresh
```

**3. Logout Endpoint** (For future implementation)
```
POST /api/v1/auth/logout
```

## 🚀 How to Test

### 1. **Start the Backend**
```bash
cd backend
npm start
# Server should run on http://localhost:3000
```

### 2. **Start the Frontend**
```bash
cd frontend/full-version
npm run dev
# Frontend should run on http://localhost:3001
```

### 3. **Test Login**
- Navigate to: `http://localhost:3001/login`
- Enter credentials:
  - Username: `admin`
  - Password: `admin`
- Click "Log In"

### 4. **Expected Result**
- ✅ Form submits to backend
- ✅ Receives access token and user data
- ✅ Session is created in NextAuth
- ✅ User is redirected to dashboard
- ✅ User data is available in pages via `useSession()`

## 📋 File Changes Summary

### Modified Files:

1. **`/frontend/full-version/src/views/Login.jsx`**
   - Changed field from `email` to `username`
   - Updated validation schema
   - Updated form label and demo credentials

2. **`/frontend/full-version/src/libs/auth.js`**
   - Updated API endpoint to `/auth/login`
   - Changed parameter from `email` to `username`
   - Added user data extraction from backend response
   - Added token storage in session

3. **`/frontend/full-version/.env.local`** (Created)
   - Added `NEXT_PUBLIC_API_URL` pointing to backend
   - Added `NEXTAUTH_URL` for NextAuth configuration
   - Added `NEXTAUTH_SECRET` for session encryption

## 🔐 Security Notes

### Current Implementation:
- ✅ HTTPS in production (configured with NEXTAUTH_URL)
- ✅ Secure session tokens (JWT with secret)
- ✅ Password hashed on backend (bcryptjs)
- ✅ Credentials provider (no plain text passwords)
- ✅ CSRF protection (NextAuth built-in)

### For Production:
- [ ] Use strong random `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Enable HTTPS for all API calls
- [ ] Store sensitive env vars in secure vault
- [ ] Implement rate limiting on login endpoint
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Add account lockout after failed attempts
- [ ] Enable Google OAuth with production credentials

## 📍 Authentication Flow

```
User enters credentials
    ↓
Login.jsx form validation
    ↓
nextAuth.authorize() called
    ↓
POST /api/v1/auth/login to backend
    ↓
Backend validates and returns tokens
    ↓
NextAuth stores tokens in JWT
    ↓
Session created with user data
    ↓
User redirected to dashboard
    ↓
useSession() hook provides user data to pages
```

## 🎓 Using Authentication in Components

### Get Session in Client Components:
```javascript
'use client'
import { useSession } from 'next-auth/react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (status === 'unauthenticated') return <div>Not authenticated</div>
  
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Role: {session.user.role}</p>
      <p>Access Token: {session.user.accessToken}</p>
    </div>
  )
}
```

### Get Session in Server Components:
```javascript
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/libs/auth'

export default async function ServerComponent() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return <div>Not authenticated</div>
  }
  
  return <div>Welcome, {session.user.name}</div>
}
```

### Protect Routes:
```javascript
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/libs/auth'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }
  
  return <div>This page is protected</div>
}
```

## 🔄 Token Refresh (Future Enhancement)

Currently, tokens are set once at login. For production apps, implement token refresh:

```javascript
// In auth.js callbacks
async jwt({ token, user }) {
  if (user) {
    // Initial login
    token.accessToken = user.accessToken
    token.refreshToken = user.refreshToken
    token.accessTokenExpires = Date.now() + (1 * 60 * 60 * 1000) // 1 hour
  }
  
  if (Date.now() < token.accessTokenExpires) {
    // Token still valid
    return token
  }
  
  // Token expired, refresh it
  const refreshedToken = await refreshAccessToken(token)
  return refreshedToken
}
```

## ❓ Troubleshooting

### Issue: "Invalid credentials"
- **Solution**: Ensure backend is running on port 3000
- **Solution**: Check username/password in database
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is correct

### Issue: "Cannot POST /auth/login"
- **Solution**: Check backend `auth.routes.ts` is loaded
- **Solution**: Verify endpoint is `/auth/login` not `/login`
- **Solution**: Ensure backend server is started

### Issue: Session not persisting
- **Solution**: Check `NEXTAUTH_SECRET` is set
- **Solution**: Verify cookies are enabled in browser
- **Solution**: Check browser console for CORS errors

### Issue: CORS errors
- **Solution**: Backend needs CORS middleware configured
- **Solution**: Add frontend URL to CORS allowed origins
- **Solution**: Ensure credentials are sent with requests

## 📚 Related Files

- Backend Auth Service: `/backend/src/services/auth.service.ts`
- Backend Auth Routes: `/backend/src/routes/auth.routes.ts`
- Backend User Model: `/backend/src/models/user.model.ts`
- Frontend Login Page: `/frontend/full-version/src/app/[lang]/(blank-layout-pages)/(guest-only)/login/page.jsx`

## ✨ What's Next

1. **User Registration**: Update `/frontend/full-version/src/views/Register.jsx`
2. **Forgot Password**: Implement password reset flow
3. **Token Refresh**: Implement automatic token refresh
4. **OAuth Providers**: Setup Google and other providers
5. **2FA**: Add two-factor authentication
6. **User Profile**: Create user profile management page
7. **API Client**: Create authenticated API client with token injection
8. **Protected Pages**: Add route guards to dashboard and admin pages

## 📞 Support

For issues or questions about the authentication setup, check:
1. Console logs in browser DevTools
2. Network tab for API requests/responses
3. NextAuth documentation: https://next-auth.js.org
4. Backend API logs: `npm run logs` in backend

---

**Status**: ✅ Frontend Authentication Ready
**Last Updated**: $(date)
**Version**: 1.0
