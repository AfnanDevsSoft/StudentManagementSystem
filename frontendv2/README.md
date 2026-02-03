# Student Management System - Frontend v2

A beautiful, modern, and comprehensive UI/UX for the Student Management System built with React, TypeScript, TailwindCSS, and Vite.

## 🎨 Features

### ✅ Implemented Modules

1. **Dashboard** - Overview with stats, charts, and activity feeds
2. **Branch Management** - Multi-branch support with detailed metrics
3. **Roles & Permissions** - RBAC with permission matrix
4. **Students** - Student management with search and filters
5. **Teachers** - Teacher profiles with course assignments
6. **Admissions** - Kanban board for application pipeline
7. **Users** - User management (placeholder)
8. **Courses** - Course catalog (placeholder)
9. **Attendance** - Attendance tracking (placeholder)
10. **Grades** - Grade management (placeholder)
11. **Payroll** - Payroll processing (placeholder)
12. **Finance** - Financial management (placeholder)
13. **Library** - Library management (placeholder)
14. **Health Records** - Student health tracking (placeholder)
15. **Events** - Calendar and events (placeholder)
16. **Messages** - Messaging system (placeholder)
17. **Announcements** - Announcements board (placeholder)
18. **Analytics** - Reports and analytics (placeholder)
19. **Settings** - System settings (placeholder)

### 🎯 Design Features

- **Modern UI/UX** - Clean, professional, and intuitive interface
- **Dark Mode** - Full dark mode support
- **Responsive** - Works on desktop, tablet, and mobile
- **Glassmorphism** - Modern card designs with blur effects
- **Smooth Animations** - Delightful micro-interactions
- **Vibrant Colors** - Eye-catching color palette
- **Beautiful Charts** - Data visualization with Recharts
- **Icon System** - Lucide React icons throughout

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:3002`

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/          # Layout components (Sidebar, Header, MainLayout)
│   ├── ui/              # Reusable UI components (Button, Card, Input, etc.)
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx  # Authentication context
├── lib/
│   ├── api.ts           # API configuration and endpoints
│   └── utils.ts         # Utility functions
├── pages/
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard page
│   ├── students/        # Students module
│   ├── teachers/        # Teachers module
│   ├── branches/        # Branches module
│   ├── roles/           # Roles & permissions module
│   └── admissions/      # Admissions module
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Global styles

```

## 🎨 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **UI Components**: Radix UI
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **HTTP Client**: Axios

## 🔐 Authentication

The app uses JWT-based authentication. Login credentials are managed through the backend API.

Default login flow:
1. Navigate to `/login`
2. Enter credentials
3. JWT token stored in localStorage
4. Redirected to `/dashboard`

## 📊 API Integration

The app connects to the backend API at `http://localhost:3000/api`. All endpoints are configured in `src/lib/api.ts`.

API proxy is configured in `vite.config.ts` for development.

## 🎯 Key Pages

### Dashboard
- Overview cards with key metrics
- Enrollment trend chart
- Weekly attendance chart
- Grade distribution pie chart
- Recent activity feed
- Upcoming events

### Students
- Grid view with student cards
- Search and filters
- Status badges
- Pagination
- Quick actions

### Teachers
- Grid view with teacher cards
- Department and designation info
- Course and student counts
- Profile links

### Branches
- Branch cards with location details
- Principal information
- Student/teacher/revenue metrics
- Status indicators

### Roles & Permissions
- Role list with system/custom distinction
- Permission matrix table
- CRUD permissions visualization
- User assignment info

### Admissions
- Kanban board view
- List view toggle
- Application pipeline stages
- Status tracking
- Payment status

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Secondary**: Purple (#8b5cf6)
- **Accent**: Green (#10b981)
- **Destructive**: Red (#ef4444)

### Typography
- System font stack with fallbacks
- Consistent sizing scale
- Proper hierarchy

### Components
All UI components follow a consistent design pattern with:
- Proper spacing
- Border radius
- Shadow effects
- Hover states
- Active states
- Disabled states

## 📝 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🚧 Development Status

### Completed ✅
- Foundation and design system
- Authentication flow
- Layout components (Sidebar, Header)
- Dashboard with charts
- Students module
- Teachers module
- Branches module
- Roles & Permissions module
- Admissions module (Kanban + List)
- Routing for all modules

### In Progress 🚧
- Detail pages for each module
- Form pages (Add/Edit)
- Remaining module implementations
- Advanced filtering
- Bulk operations

### Planned 📋
- Real-time notifications
- Advanced analytics
- Export functionality
- Print layouts
- Mobile app views

## 🤝 Contributing

This is a comprehensive student management system. When adding new features:

1. Follow the existing component structure
2. Use TypeScript for type safety
3. Maintain the design system consistency
4. Add proper error handling
5. Include loading states

## 📄 License

Copyright © 2026 Oxford Global Hub. All rights reserved.

## 🙏 Acknowledgments

- Built with modern React best practices
- UI components from Radix UI
- Icons from Lucide React
- Charts from Recharts
 