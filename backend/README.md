# Afnan Devs SMS - Backend API

## 🎯 Overview

This is the Node.js/Express.js backend for the Afnan Devs SMS. It provides a comprehensive REST API for managing educational institutions with multi-branch support, student enrollment, academic management, teacher administration, and more.

**API Documentation:** Available at `http://localhost:3000/api/docs` (Swagger UI)

## 🏗️ Architecture

- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 14+ with Prisma ORM
- **Authentication:** JWT-based (access & refresh tokens)
- **API Documentation:** Swagger/OpenAPI 3.0
- **Caching:** Redis
- **Logging:** Winston
- **Validation:** Joi
- **File Uploads:** Multer
- **Email:** Nodemailer

## 📋 Prerequisites

Before running the backend, ensure you have installed:

- **Node.js** v16+ (Recommended: v18 LTS)
- **PostgreSQL** 14+ (running locally or on your network)
- **Redis** (optional, for caching features)
- **npm** or **yarn** package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Environment Setup

The `.env` file is pre-configured with local PostgreSQL credentials. Verify the database settings:

```env
# Database (Local PostgreSQL)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=schoolManagement
POSTGRES_USER=postgres
POSTGRES_PASSWORD=admin123
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/schoolManagement"

# JWT Secrets
JWT_SECRET=your-secret-key-change-this
REFRESH_TOKEN_SECRET=your-refresh-secret-change-this

# Server
PORT=3000
NODE_ENV=development

# API Documentation
API_DOCS_PATH=/api/docs
```

⚠️ **Important:** Change JWT secrets for production!

### 3. Create PostgreSQL Database

Connect to your PostgreSQL instance and create the database:

```sql
CREATE DATABASE "schoolManagement"
  WITH ENCODING 'UTF8'
  LC_COLLATE = 'en_US.UTF-8'
  LC_CTYPE = 'en_US.UTF-8';
```

Or using `psql`:

```bash
createdb -U postgres -E UTF8 schoolManagement
```

### 4. Setup Prisma Schema

The Prisma schema is already configured (`prisma/schema.prisma`) with all 40+ database tables.

Generate Prisma client:

```bash
npx prisma generate
```

### 5. Run Database Migrations

Create database tables:

```bash
npm run db:migrate
```

Or create initial schema:

```bash
npx prisma db push
```

### 6. Seed Database (Optional)

Populate with sample data:

```bash
npm run db:seed
```

### 7. Start Development Server

```bash
npm run dev
```

Expected output:

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║         Afnan Devs SMS - API Server                   ║
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

### 8. Access Swagger Documentation

Open your browser and navigate to:

```
http://localhost:3000/api/docs
```

You'll see the interactive Swagger UI with all API endpoints, request/response schemas, and authentication setup.

## 📚 API Endpoints Overview

### Authentication (`/api/v1/auth`)

- `POST /login` - User authentication
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout

### Branches (`/api/v1/branches`)

- `GET /` - List all branches
- `GET /:id` - Get branch details
- `POST /` - Create new branch
- `PUT /:id` - Update branch
- `DELETE /:id` - Delete branch

### Users (`/api/v1/users`)

- `GET /` - List users with pagination
- `GET /:id` - Get user details
- `POST /` - Create new user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

### Students (`/api/v1/students`)

- `GET /` - List students with filtering
- `GET /:id` - Get student details
- `POST /` - Create new student
- `PUT /:id` - Update student
- `GET /:id/enrollment` - Student enrollments
- `GET /:id/grades` - Student grades
- `GET /:id/attendance` - Student attendance

### Teachers (`/api/v1/teachers`)

- `GET /` - List teachers
- `GET /:id` - Get teacher details
- `POST /` - Create new teacher
- `PUT /:id` - Update teacher
- `GET /:id/courses` - Teacher's courses
- `GET /:id/attendance` - Teacher attendance

### Courses (`/api/v1/courses`)

- `GET /` - List courses
- `GET /:id` - Get course details
- `POST /` - Create new course
- `PUT /:id` - Update course
- `GET /:id/enrollments` - Course enrollments
- `POST /:id/students` - Enroll student

### Health Check (`/health`)

- `GET /` - Server health status

**Total: 40+ endpoints** (see Swagger documentation for complete list)

## 🔧 Available Commands

```bash
# Development
npm run dev                  # Start dev server with auto-reload

# Production
npm run build               # Build TypeScript to JavaScript
npm run start               # Run production build

# Database
npm run db:migrate          # Create/apply database migrations
npm run db:push             # Sync schema with database
npm run db:seed             # Populate with sample data
npm run db:studio           # Open Prisma Studio GUI

# Testing & Quality
npm test                    # Run unit tests
npm run test:watch          # Run tests in watch mode
npm run coverage             # Generate test coverage report

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix linting issues
npm run format              # Format code with Prettier
npm run format:check        # Check code formatting
```

## 🗄️ Database Schema

The database includes 40+ tables organized into modules:

### Core Entities

- **Branches** - Multi-tenancy support
- **Users** - Authentication & RBAC
- **Roles** - Role-based access control

### Academic Module

- **Students** - Student records with enrollment tracking
- **Teachers** - Faculty management
- **Courses** - Course definitions and assignments
- **Subjects** - Subject management
- **GradeLevels** - Grade/Class levels
- **StudentEnrollments** - Course enrollments
- **Grades** - Academic grades and assessments

### Attendance Module

- **Attendance** - Student attendance records
- **TeacherAttendance** - Teacher check-in/out

### Payroll Module

- **PayrollRecords** - Teacher salary records

### Leave Management Module

- **LeaveRequests** - Leave request tracking

### Admission Module

- **AdmissionForms** - Dynamic admission forms
- **AdmissionApplications** - Admission applications

### Communication Module

- **CommunicationLogs** - Student-parent communication
- **Notifications** - System notifications

### Audit & Security

- **AuditLogs** - Action audit trail
- **ParentGuardian** - Parent/guardian information

See `COMPREHENSIVE_FEATURES_DOCUMENTATION.md` for complete details.

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Getting Access Token

1. Login via `/api/v1/auth/login`:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@afnandevssms.com"
  }
}
```

### Using Access Token

Include the token in Authorization header:

```bash
curl -X GET http://localhost:3000/api/v1/students \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Refresh Token

Get a new access token before expiry:

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Authorization: Bearer refresh_token_here"
```

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    ...
  },
  "message": "Operation successful"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run coverage
```

## 📝 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── swagger.ts          # Swagger/OpenAPI configuration
│   │   ├── database.ts         # Prisma setup (coming)
│   │   └── logger.ts           # Winston logger (coming)
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── error.middleware.ts     # Error handling
│   │   ├── rbac.middleware.ts      # Role-based access control
│   │   └── validation.middleware.ts # Request validation
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── branches.routes.ts
│   │   ├── users.routes.ts
│   │   ├── students.routes.ts
│   │   ├── teachers.routes.ts
│   │   ├── courses.routes.ts
│   │   ├── health.routes.ts
│   │   └── v1/               # API v1 routes
│   ├── controllers/          # (Coming) Request handlers
│   ├── services/             # (Coming) Business logic
│   ├── repositories/         # (Coming) Data access layer
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── package.json
├── tsconfig.json
├── .env                     # Environment variables
└── README.md
```

## 🔄 Development Workflow

1. **Code Changes:** Make changes to TypeScript files
2. **Auto-reload:** Dev server automatically restarts (ts-node-dev)
3. **Type Checking:** TypeScript validates types on save
4. **Swagger Docs:** Automatically updated with JSDoc comments
5. **Test:** Run `npm test` before committing
6. **Lint:** Run `npm run lint:fix` for consistent code style

## 🚨 Common Issues

### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** Ensure PostgreSQL is running on localhost:5432

```bash
# macOS (using Homebrew)
brew services start postgresql

# Linux (Debian/Ubuntu)
sudo service postgresql start

# Verify connection
psql -U postgres -h localhost
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:** Change PORT in .env or kill process on port 3000

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Module Not Found

```
Cannot find module 'express'
```

**Solution:** Install dependencies

```bash
npm install
```

### Prisma Client Not Generated

```
Cannot find module '@prisma/client'
```

**Solution:** Generate Prisma client

```bash
npx prisma generate
```

## 📖 Documentation References

- **Swagger/OpenAPI:** http://localhost:3000/api/docs
- **Comprehensive Features:** `COMPREHENSIVE_FEATURES_DOCUMENTATION.md`
- **Database Schema:** `DATABASE_SCHEMA_DETAILED.md`
- **API Specification:** `API_SPECIFICATION.md`
- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md`

## 🔄 API Versioning

Currently supporting:

- **v1** - Current stable version

All endpoints are prefixed with `/api/v1/`

Future versions will be available at `/api/v2/`, `/api/v3/`, etc.

## 🛡️ Security Considerations

- ✅ JWT authentication on protected endpoints
- ✅ Role-based access control (RBAC)
- ✅ Request validation with Joi
- ✅ Helmet.js for security headers
- ✅ CORS configured for allowed origins
- ⚠️ **Change JWT secrets in production!**
- ⚠️ **Use environment variables for sensitive data**
- ⚠️ **Enable HTTPS in production**
- ⚠️ **Use strong PostgreSQL password**
- ⚠️ **Implement rate limiting for production**

## 📞 Support & Contribution

For issues or contributions:

1. Check existing documentation
2. Review Swagger API documentation
3. Check database schema
4. Review implementation guide
5. Contact development team

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated:** April 2024
**Version:** 1.0.0
**Status:** Initial Setup Complete ✅
