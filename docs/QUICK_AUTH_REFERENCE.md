# 🚀 Authentication Quick Reference Card

## 🎯 In 60 Seconds

**Your auth system has 5 parts:**

1. **Login Form** - User enters credentials (username/password)
2. **Auth Library** - Sends to backend, gets tokens back
3. **Token Storage** - Stores in cookies + localStorage
4. **Auth Hook** - Gives you easy access to tokens/user
5. **API Client** - Auto-injects tokens in API requests

---

## 📝 Test Login NOW

```bash
# Terminal 1: Start Backend
cd backend && npm run dev

# Terminal 2: Start Frontend  
cd frontend/full-version && npm run dev

# Browser: Go to
http://localhost:3001/login

# Login with:
Username: admin1
Password: password123

# Check: Should go to /dashboards/admin
```

---

## 💾 Token Storage Locations

| Where | What | Duration |
|-------|------|----------|
| **Cookie** | Session token (httpOnly) | 30 days |
| **localStorage** | Access token + role | Manual clear |
| **Memory** | Session object | Page reload |

---

## 🔑 Access Tokens in Code

### Get Tokens
```javascript
import useAuth from '@/hooks/useAuth'

const { getAccessToken, getRefreshToken } = useAuth()
const token = getAccessToken()  // "eyJ0eXAi..."
```

### Check Role
```javascript
const { isAdmin, isTeacher, isStudent } = useAuth()

if (isAdmin) { /* admin stuff */ }
```

### Get User Info
```javascript
const { user, getUsername, getUserId } = useAuth()

console.log(user?.username)  // "admin1"
console.log(user?.role)      // "SuperAdmin"
```

---

## 🌐 Make API Calls

### Auto-Token Injection
```javascript
import { api } from '@/libs/api'

// Token auto-injected in Authorization header!
const users = await api.get('/users')
const user = await api.post('/users', { name: 'John' })
await api.delete('/users/1')
```

### Manual Header (if needed)
```javascript
fetch('http://localhost:5000/api/v1/users', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
})
```

---

## 🔍 Debug in Browser (F12)

### Check Cookies
```
DevTools → Application → Cookies → localhost:3001
Look for: next-auth.session-token
```

### Check localStorage
```
DevTools → Application → Storage → Local Storage → localhost:3001
Should see: access_token, refresh_token, user_role, user_id, username
```

### Check Session (Console)
```javascript
import { useSession } from 'next-auth/react'
const { data: session } = useSession()
console.log(session?.user?.accessToken)
```

---

## 📂 Files Created

| File | Purpose | Size |
|------|---------|------|
| `src/hooks/useAuth.js` | Token + role access | 80 lines |
| `src/libs/api.js` | Auto-token API client | 100 lines |
| `src/components/AuthDebug.jsx` | Console logging | 45 lines |

---

## ⚙️ Environment Setup

**File**: `.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3001
```

---

## 🎓 Complete Auth Flow (10 Steps)

```
1. User enters: admin1 / password123
2. Form validates (valibot)
3. Submit to NextAuth
4. NextAuth calls: POST /api/auth/login
5. Backend validates credentials
6. Backend returns: { access_token, refresh_token, user: {...} }
7. NextAuth JWT callback stores tokens
8. NextAuth session callback passes to session.user
9. NextAuth creates httpOnly cookie
10. useAuth hook syncs to localStorage
```

---

## ✅ Verification Checklist

After login:
- [ ] Redirects to correct dashboard (/dashboards/admin, etc)
- [ ] User name visible on page
- [ ] Cookie `next-auth.session-token` exists (F12)
- [ ] localStorage has `access_token` (F12)
- [ ] API calls get 200 (not 401)

---

## 🚨 Common Issues

| Problem | Fix |
|---------|-----|
| 401 on API calls | Check token in localStorage |
| Cannot access dashboard | Verify middleware config |
| Login fails | Ensure backend running on 5000 |
| Token not in localStorage | useAuth() hook not called |
| Session empty | Check `status !== 'loading'` |

---

## 🔐 Security Features

✅ Tokens in **httpOnly cookies** (XSS safe)  
✅ Tokens **expire** after 30 days  
✅ **Auto-refresh** after 25 days  
✅ Bearer token **format** required  
✅ **Role-based** dashboard redirect  

---

## 📞 Quick Commands

```bash
# Verify backend running
curl http://localhost:5000/api/v1/health

# Check frontend running
curl http://localhost:3001

# View auth files
ls -la src/{hooks,libs,components}/{useAuth,api,AuthDebug}.*

# Test API with token
curl -H "Authorization: Bearer $(cat /tmp/token.txt)" \
  http://localhost:5000/api/v1/users
```

---

## 🎯 Test Accounts

```
Admin:
  admin1 / password123 → /dashboards/admin

Teacher:
  teacher1 / password123 → /dashboards/teacher

Student:
  student1 / password123 → /dashboards/student
```

---

## 💡 Pro Tips

1. **Always use `useAuth()` hook** - Don't manually access localStorage
2. **Use `api` client** - Don't use fetch directly, auto-injects token
3. **Check `status !== 'loading'`** - Before accessing session
4. **Logout clears storage** - Automatic with NextAuth
5. **Refresh is automatic** - No manual refresh needed

---

## 📚 Learn More

- Full details: `docs/AUTH_IMPLEMENTATION_COMPLETE.md`
- Testing guide: `docs/AUTH_TOKEN_TESTING_GUIDE.md`
- Complete summary: `docs/FINAL_AUTH_SETUP_SUMMARY.md`

---

**Status**: ✅ Ready to Use

Start with: `http://localhost:3001/login`

---

*Last Updated: December 2, 2024*
