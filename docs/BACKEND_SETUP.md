# KoolHub Backend Setup Guide

Complete step-by-step guide to set up and run the KoolHub Student Management System backend.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Running the Server](#running-the-server)
5. [Accessing Swagger API Docs](#accessing-swagger-api-docs)
6. [Troubleshooting](#troubleshooting)

---

## 📌 Prerequisites

Before starting, ensure you have:

### Software Requirements

- **Node.js** v16+ (Recommended: v18 LTS)

  - Download: https://nodejs.org/
  - Verify: `node --version`

- **npm** v8+ (comes with Node.js)

  - Verify: `npm --version`

- **PostgreSQL** 14+

  - Download: https://www.postgresql.org/download/
  - Verify: `psql --version`

- **Git** (optional, for version control)
  - Download: https://git-scm.com/

### Hardware Requirements

- **RAM:** 2GB minimum
- **Disk Space:** 1GB free space
- **Internet:** For downloading packages

---

## 🚀 Initial Setup

### Step 1: Navigate to Backend Directory

```bash
cd /Users/ashhad/Dev/soft/Student\ Management/studentManagement/backend
```

### Step 2: Install Node Dependencies

```bash
npm install
```

This will install all required packages from `package.json`:

- Express.js and related middleware
- Prisma ORM
- JWT authentication libraries
- Swagger documentation
- Database drivers
- And more...

**Expected output:**

```
added X packages, and audited X packages in Xs

Y packages are looking for funding
```

### Step 3: Verify Environment Setup

Check that `.env` file exists and contains required configurations:

```bash
cat .env
```

**Expected content:**

```
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/schoolManagement"
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=schoolManagement
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin123
PORT=3000
NODE_ENV=development
JWT_SECRET=your-dev-secret-key
REFRESH_TOKEN_SECRET=your-dev-refresh-secret
API_DOCS_PATH=/api/docs
```

✅ If all variables are present, proceed to next step.

---

## 🗄️ Database Configuration

### Step 4: Verify PostgreSQL is Running

#### On macOS (using Homebrew):

```bash
# Start PostgreSQL
brew services start postgresql

# Verify it's running
brew services list | grep postgresql

# Should show: postgresql started
```

#### On Linux (Debian/Ubuntu):

```bash
# Start PostgreSQL
sudo service postgresql start

# Verify it's running
sudo service postgresql status
```

#### On Windows (using installer):

1. Open Services (Ctrl+Alt+Delete → Task Manager → Services)
2. Look for "postgresql-x64-14" or similar
3. If stopped, right-click and select "Start"

### Step 5: Create Database

Connect to PostgreSQL and create the `schoolManagement` database:

#### Option A: Using psql CLI

```bash
# Connect to PostgreSQL (will prompt for password: admin123)
psql -U postgres -h localhost

# Create database
CREATE DATABASE "schoolManagement"
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8';

# Verify database was created
\l

# Exit psql
\q
```

#### Option B: Using createdb command

```bash
createdb -U postgres -h localhost -E UTF8 schoolManagement
```

#### Option C: Using pgAdmin GUI

1. Open pgAdmin (usually installed with PostgreSQL)
2. Connect to local PostgreSQL server
3. Right-click "Databases" → Create → Database
4. Name: `schoolManagement`
5. Click Create

### Step 6: Setup Prisma Schema

Generate Prisma client and sync schema with database:

```bash
# Generate Prisma client
npx prisma generate

# Sync schema with database (creates all tables)
npx prisma db push

# Or run migrations (alternative method)
npm run db:migrate
```

**Expected output:**

```
✓ Prisma schema loaded from prisma/schema.prisma
✓ Database created in X seconds
✓ Generated Prisma Client (v5.7.0) to ./node_modules/@prisma/client
```

### Step 7: Verify Database Tables

Connect to the database and verify tables were created:

```bash
# Connect to database
psql -U postgres -h localhost schoolManagement

# List tables
\dt

# You should see 20+ tables created
```

---

## 🚀 Running the Server

### Step 8: Start Development Server

```bash
npm run dev
```

**Expected output:**

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         KoolHub Student Management System - API Server        ║
║                                                                ║
║  🚀 Server running on http://localhost:3000                   ║
║  📚 API Documentation: http://localhost:3000/api/docs         ║
║  🔗 API Base URL: http://localhost:3000/api/v1                ║
║                                                                ║
║  Environment: development                                     ║
║  Database: schoolManagement@localhost                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

Server is now running and ready to accept requests!

### Step 9: Verify Server Health

In another terminal, check server health:

```bash
curl http://localhost:3000/health
```

**Expected response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 25.456
}
```

---

## 📚 Accessing Swagger API Docs

The most important part - viewing all API endpoints!

### Step 10: Open Swagger UI

1. **Open your web browser**
2. **Navigate to:** `http://localhost:3000/api/docs`

You should see:

- Interactive API documentation
- All 40+ endpoints organized by module
- Request/response schemas
- Try-it-out functionality to test endpoints
- Authentication setup with Bearer token
- Detailed descriptions and parameters

### Explore the API

In Swagger UI:

1. **Expand modules** (Auth, Branches, Users, Students, Teachers, Courses)
2. **Click on endpoints** to see details
3. **Try endpoints:**
   - Click "Try it out"
   - Enter required parameters
   - Click "Execute"
   - See response

### Example: Test Health Endpoint

1. Find "Health" section
2. Click GET /health
3. Click "Try it out"
4. Click "Execute"
5. See response with server status

---

## 🧪 Seed Sample Data (Optional)

To populate the database with sample data:

```bash
npm run db:seed
```

This creates:

- Sample branches
- Sample users (admin, teachers, etc.)
- Sample students
- Sample courses
- Sample grades and attendance records

You can then query this data via API endpoints.

---

## 📊 Useful Commands

### Development Commands

```bash
# Start dev server with auto-reload
npm run dev

# Build for production
npm run build

# Start production build
npm run start
```

### Database Commands

```bash
# Open Prisma Studio GUI (visual database editor)
npm run db:studio

# Create/apply migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Reset database (WARNING: deletes all data!)
npx prisma migrate reset
```

### Code Quality Commands

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm test
```

---

## 🔗 API Endpoint Examples

### Authentication

**Login:**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### Students

**Get all students:**

```bash
curl -X GET "http://localhost:3000/api/v1/students?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get student by ID:**

```bash
curl -X GET http://localhost:3000/api/v1/students/{student_id} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Teachers

**Get all teachers:**

```bash
curl -X GET "http://localhost:3000/api/v1/teachers?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Courses

**Get all courses:**

```bash
curl -X GET "http://localhost:3000/api/v1/courses?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🚫 Troubleshooting

### Issue: Database Connection Failed

**Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Check if PostgreSQL is running:**

   ```bash
   # macOS
   brew services list | grep postgresql

   # Linux
   sudo service postgresql status

   # Windows - Check Services (services.msc)
   ```

2. **Start PostgreSQL if stopped:**

   ```bash
   # macOS
   brew services start postgresql

   # Linux
   sudo service postgresql start
   ```

3. **Verify connection string in .env:**

   ```
   DATABASE_URL="postgresql://postgres:admin123@localhost:5432/schoolManagement"
   ```

4. **Test connection directly:**
   ```bash
   psql -U postgres -h localhost -d schoolManagement
   ```

### Issue: Port 3000 Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Find process using port 3000:**

   ```bash
   # macOS/Linux
   lsof -i :3000

   # Windows
   netstat -ano | findstr :3000
   ```

2. **Kill the process:**

   ```bash
   # macOS/Linux
   kill -9 <PID>

   # Windows (in Command Prompt as Admin)
   taskkill /PID <PID> /F
   ```

3. **Or use a different port in .env:**
   ```
   PORT=3001
   ```

### Issue: npm Dependencies Installation Failed

**Error:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve dependency peer
```

**Solutions:**

1. **Clear npm cache:**

   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json:**

   ```bash
   rm -rf node_modules package-lock.json
   ```

3. **Reinstall dependencies:**

   ```bash
   npm install
   ```

4. **Or use legacy peer deps (last resort):**
   ```bash
   npm install --legacy-peer-deps
   ```

### Issue: Database Tables Not Created

**Error:**

```
Error: relation "users" does not exist
```

**Solutions:**

1. **Run Prisma push to create tables:**

   ```bash
   npx prisma db push
   ```

2. **Or run migrations:**

   ```bash
   npm run db:migrate
   ```

3. **Verify database exists:**
   ```bash
   psql -U postgres -h localhost -l | grep schoolManagement
   ```

### Issue: Cannot Find Module Error

**Error:**

```
Cannot find module '@prisma/client'
Cannot find module 'express'
```

**Solutions:**

1. **Ensure dependencies are installed:**

   ```bash
   npm install
   ```

2. **Generate Prisma client:**

   ```bash
   npx prisma generate
   ```

3. **Clear and rebuild:**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

### Issue: Swagger Docs Not Loading

**Error:**
Browser shows blank page at http://localhost:3000/api/docs

**Solutions:**

1. **Verify server is running:**

   ```bash
   npm run dev
   ```

2. **Check if port is correct in .env:**

   ```
   PORT=3000
   ```

3. **Clear browser cache:**

   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear cached images and files
   - Refresh page

4. **Check server logs for errors**

### Issue: JWT Authentication Errors

**Error:**

```
401 Unauthorized - Invalid or missing token
```

**Solutions:**

1. **Ensure you're including Bearer token:**

   ```
   Authorization: Bearer YOUR_JWT_TOKEN_HERE
   ```

2. **Get new token from login endpoint:**

   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

3. **Verify JWT secrets are set in .env:**
   ```
   JWT_SECRET=your-secret-key
   REFRESH_TOKEN_SECRET=your-refresh-secret
   ```

---

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL running and accessible
- [ ] `schoolManagement` database created
- [ ] `.env` file configured with database credentials
- [ ] Dependencies installed (`npm install` completed)
- [ ] Prisma schema synced (`npx prisma db push` completed)
- [ ] Server starting without errors (`npm run dev`)
- [ ] Health check responding (`curl http://localhost:3000/health`)
- [ ] Swagger docs accessible (`http://localhost:3000/api/docs`)
- [ ] Can see all 40+ endpoints in Swagger UI

---

## 📞 Next Steps

1. ✅ **Server Running** - Check Swagger UI at http://localhost:3000/api/docs
2. 📖 **Read Documentation** - Review COMPREHENSIVE_FEATURES_DOCUMENTATION.md
3. 🔑 **Test Authentication** - Use login endpoint to get JWT token
4. 🧪 **Test Endpoints** - Try example API calls in Swagger UI
5. 💻 **Start Development** - Implement controllers and services

---

## 📚 Reference Documentation

- **Comprehensive Features:** `COMPREHENSIVE_FEATURES_DOCUMENTATION.md`
- **Database Schema:** `DATABASE_SCHEMA_DETAILED.md`
- **API Specification:** `API_SPECIFICATION.md`
- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **Backend README:** `README.md`
- **Swagger UI:** http://localhost:3000/api/docs

---

**Status:** ✅ Backend setup complete and ready for development!

**Questions?** Check the troubleshooting section or review the documentation files.

---

Last Updated: April 2024
Version: 1.0.0
