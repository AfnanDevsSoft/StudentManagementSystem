# Phase 2 Deployment & Testing Guide

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Testing Phase 2 Features](#testing-phase-2-features)
4. [Deployment Steps](#deployment-steps)
5. [Post-Deployment Verification](#post-deployment-verification)

---

## Pre-Deployment Checklist

### Backend Requirements
- [ ] Node.js v16+ installed
- [ ] PostgreSQL database running
- [ ] Environment variables configured
- [ ] All dependencies installed (`npm install`)
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Prisma schema updated with Phase 2 models
- [ ] All routes tested locally

### Code Quality
- [ ] No TypeScript compilation errors
- [ ] All lint checks passing (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] No console.error without proper handling
- [ ] Swagger documentation complete

### Security
- [ ] JWT token validation enabled
- [ ] CORS configured for frontend domains
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] No sensitive data in logs
- [ ] Environment variables not exposed

---

## Environment Setup

### 1. Backend Environment Variables

Create `.env` file in `/backend`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/koolhub_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRATION="7d"

# Server
PORT=5000
NODE_ENV="production"

# CORS
CORS_ORIGINS="https://yourdomain.com,https://admin.yourdomain.com"

# API Docs
API_DOCS_PATH="/api/docs"

# Redis (if using caching)
REDIS_URL="redis://localhost:6379"

# Email Service (if notifications enabled)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### 2. Database Setup

```bash
# Navigate to backend
cd backend

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npm run db:seed

# Verify schema
npx prisma db push
```

### 3. Install Dependencies

```bash
# In backend directory
npm install

# Verify installation
npm list
```

---

## Testing Phase 2 Features

### Unit Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- analytics.test.ts

# Generate coverage report
npm run test:coverage
```

### Integration Testing

#### 1. Start the Server

```bash
npm run dev
```

The server should start on `http://localhost:5000`

#### 2. Test Analytics Endpoints

```bash
# Get enrollment metrics
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/v1/analytics/enrollment?branchId=branch123"

# Get dashboard data
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/v1/analytics/dashboard?branchId=branch123"

# Get attendance metrics
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/v1/analytics/attendance?branchId=branch123&startDate=2025-04-01&endDate=2025-04-21"
```

#### 3. Test Messaging Endpoints

```bash
# Send message
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId":"user1",
    "recipientId":"user2",
    "subject":"Test Message",
    "messageBody":"Hello, this is a test message"
  }' \
  "http://localhost:5000/api/v1/messages/send"

# Get inbox
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/v1/messages/inbox?userId=user2&limit=10"

# Get unread count
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/v1/messages/unread-count?userId=user2"
```

#### 4. Test Reporting Endpoints

```bash
# Get student performance report
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/v1/reports/student-performance?branchId=branch123"

# Get attendance summary
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5000/api/v1/reports/attendance-summary?branchId=branch123"
```

### API Documentation Testing

Open browser and navigate to:
```
http://localhost:5000/api/docs
```

This opens Swagger UI where you can:
1. Authenticate with JWT token
2. Test all Phase 2 endpoints
3. View request/response schemas
4. Test with real data

### Performance Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/v1/analytics/dashboard?branchId=branch123"

# Using Artillery
npm install -g artillery
artillery quick --count 100 --num 1000 \
  http://localhost:5000/api/v1/messages/inbox?userId=user1
```

---

## Deployment Steps

### Step 1: Build Application

```bash
# In backend directory
npm run build

# Verify build
ls -la dist/
```

### Step 2: Test Production Build Locally

```bash
# Build and start
npm run build
npm start

# Test endpoints
curl "http://localhost:5000/health"
```

### Step 3: Deploy to Staging

```bash
# Using Docker
docker build -t koolhub-backend:phase2 .
docker run -p 5000:5000 \
  --env-file .env \
  koolhub-backend:phase2

# Using traditional server
scp -r dist/ user@staging-server:/app/
ssh user@staging-server
cd /app
npm install --production
npm start
```

### Step 4: Run Staging Tests

```bash
# Test all endpoints against staging
npm run test:staging

# Run integration tests
npm run test:integration
```

### Step 5: Deploy to Production

```bash
# Using process manager (PM2)
pm2 start "npm start" --name "koolhub-backend"
pm2 save
pm2 startup

# Using systemd
sudo systemctl start koolhub-backend
sudo systemctl enable koolhub-backend
```

---

## Post-Deployment Verification

### 1. Health Check

```bash
curl "https://yourdomain.com/health"

# Expected response:
# {"status":"ok","timestamp":"2025-04-21T10:30:00Z"}
```

### 2. Verify All Routes

```bash
# Test each Phase 2 endpoint:
# - Analytics: GET /api/v1/analytics/dashboard
# - Messaging: GET /api/v1/messages/inbox
# - Reporting: GET /api/v1/reports/student-performance
# - Course Content: GET /api/v1/course-content/course/{id}
# - Announcements: GET /api/v1/announcements
```

### 3. Monitor Logs

```bash
# Using PM2
pm2 logs koolhub-backend

# Using systemd
sudo journalctl -u koolhub-backend -f
```

### 4. Check Database Connectivity

```bash
# Verify Prisma connection
npx prisma db execute --stdin <<EOF
SELECT NOW();
EOF
```

### 5. Performance Monitoring

```bash
# Monitor CPU and Memory
top -p $(pgrep -f "node")

# Monitor Network
netstat -tuln | grep 5000
```

### 6. API Response Testing

```bash
# Test with various payloads
# Analytics with different date ranges
# Messaging with attachment URLs
# Reporting with multiple filters
# Course content with large files
```

---

## Rollback Procedures

### In Case of Issues:

#### 1. Immediate Rollback
```bash
# Stop current deployment
pm2 stop koolhub-backend

# Restore previous version
git checkout stable-phase1
npm install
npm run build
npm start

# Verify
curl "http://localhost:5000/health"
```

#### 2. Database Rollback
```bash
# Revert migrations
npx prisma migrate resolve --rolled-back <migration_name>

# Restore from backup
pg_restore -d koolhub_db backup.sql
```

#### 3. Version Control
```bash
# Tag current version
git tag -a v2.0.0-prod -m "Phase 2 Production Release"

# Create recovery branch
git checkout -b recovery/phase1-stable
git reset --hard stable-phase1
```

---

## Monitoring & Maintenance

### Daily Checks

- [ ] API response times < 200ms
- [ ] Error rate < 0.1%
- [ ] Database query performance
- [ ] Log file sizes manageable
- [ ] No authentication failures
- [ ] Messaging delivery working

### Weekly Checks

- [ ] Database vacuum and analyze
- [ ] Log rotation
- [ ] Backup verification
- [ ] Security updates
- [ ] Performance trending
- [ ] Error pattern analysis

### Monthly Checks

- [ ] Full system audit
- [ ] Capacity planning
- [ ] Load testing
- [ ] Security scanning
- [ ] Dependency updates
- [ ] Documentation updates

---

## Troubleshooting

### Common Issues

#### Issue: "Cannot find module @prisma/client"
```bash
# Solution:
npm install
npx prisma generate
```

#### Issue: "Database connection refused"
```bash
# Solution:
# 1. Verify DATABASE_URL in .env
# 2. Check PostgreSQL is running
# 3. Verify database exists
psql -U postgres -c "CREATE DATABASE koolhub_db;"
```

#### Issue: "JWT token invalid"
```bash
# Solution:
# 1. Verify JWT_SECRET matches
# 2. Check token expiration
# 3. Regenerate test token
```

#### Issue: "CORS error in browser"
```bash
# Solution:
# 1. Verify CORS_ORIGINS in .env
# 2. Check frontend URL is listed
# 3. Restart server
```

---

## Performance Optimization Tips

1. **Enable Redis Caching**
   ```bash
   npm install redis
   # Configure in services
   ```

2. **Database Indexing**
   ```bash
   npx prisma db execute --stdin < indexes.sql
   ```

3. **Connection Pooling**
   ```env
   DATABASE_URL="postgresql://...?schema=public&connection_limit=20"
   ```

4. **Response Compression**
   ```typescript
   // Already enabled in app.ts with helmet
   ```

5. **Query Optimization**
   - Use pagination
   - Select only needed fields
   - Use database-level filtering

---

## Security Hardening

1. **Update Dependencies**
   ```bash
   npm audit fix
   npm update
   ```

2. **Enable HTTPS**
   ```bash
   # Configure in reverse proxy (nginx/Apache)
   # Use Let's Encrypt certificate
   ```

3. **Rate Limiting**
   - Already configured in app.ts
   - Adjust limits per endpoint as needed

4. **CORS Whitelist**
   - Only allow known frontend domains
   - Update CORS_ORIGINS as needed

5. **Helmet Security Headers**
   - Already enabled in app.ts

---

**Deployment Status**: READY FOR PRODUCTION ✅  
**Last Updated**: April 21, 2025  
**Next Review**: May 21, 2025
