# Quick Start Guide - SuperAdmin Dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (see backend README)

### Installation

```bash
# Navigate to frontend directory
cd frontendv1

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

---

## 📊 Dashboard Navigation

Once logged in as SuperAdmin, access:

- **Students** → `/dashboard/superadmin/students`
- **Teachers** → `/dashboard/superadmin/teachers`
- **Courses** → `/dashboard/superadmin/courses`
- **Analytics** → `/dashboard/superadmin/analytics`
- **Settings** → `/dashboard/superadmin/settings`

---

## 🎯 Current Features

### ✅ Students Page
- View all students with pagination
- Search students by name or roll number
- Filter by class and section
- View student details
- Status indicators

### ✅ Teachers Page
- View all teachers with qualifications
- Search by name or employee code
- Filter by department
- Track courses assigned
- Experience tracking

### ✅ Courses Page
- View all courses in grid layout
- Search by course code or name
- Filter by grade and status
- See enrolled students count
- Teacher assignments

### ✅ Analytics Dashboard
- View enrollment trends
- Performance analytics by grade
- Subject-wise pass rates
- Top performers leaderboard
- Time range selector (Week/Month/Year)

### ✅ Settings
- School information management
- Notification preferences
- Security settings (2FA, timeouts, password expiry)
- System information display
- User statistics

---

## 🔌 Integration with Backend

### Step 1: Replace Sample Data with API Calls

Example - Students page:

```typescript
// Current: Using sample data
const [students, setStudents] = useState<StudentData[]>(SAMPLE_STUDENTS);

// TODO: Replace with API call
useEffect(() => {
  const fetchStudents = async () => {
    const response = await fetch('/api/students');
    const data = await response.json();
    setStudents(data);
  };
  fetchStudents();
}, []);
```

### Step 2: Add Create/Edit Functionality

```typescript
// Add to each page
const handleAddNew = () => setShowModal(true);
const handleSave = async (data) => {
  await fetch('/api/students', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });
};
```

### Step 3: Add Delete Functionality

```typescript
const handleDelete = async (id: string) => {
  if(confirm('Are you sure?')) {
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
  };
};
```

---

## 📝 Example: Adding a New Page

1. Create file: `src/app/dashboard/superadmin/[feature]/page.tsx`

2. Template:

```typescript
"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LayoutDashboard, SomeIcon } from "lucide-react";

interface DataItem {
  id: string;
  name: string;
  // ... more fields
}

export default function FeaturePage() {
  const [data, setData] = useState<DataItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const sidebarItems = [
    {
      label: "Dashboard",
      href: "/dashboard/superadmin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Feature",
      href: "/dashboard/superadmin/feature",
      icon: <SomeIcon size={20} />,
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout title="Feature Title" sidebarItems={sidebarItems}>
        <div className="space-y-6">
          {/* Your content here */}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
```

---

## 🎨 Customizing Styles

### Change Color Scheme

Edit Tailwind classes in components:

```typescript
// Change from blue to purple
<button className="bg-purple-600 hover:bg-purple-700 text-white">
  Action
</button>
```

### Common Tailwind Classes

```
Background: bg-{color}-{shade}
Text: text-{color}-{shade}
Border: border-{color}-{shade}
Ring: ring-{color}-{shade}
Shadow: shadow, shadow-lg, shadow-xl
Spacing: p-{n}, m-{n}, gap-{n}
```

---

## 🧪 Testing the Dashboard

### Smoke Test
- [ ] All pages load
- [ ] No console errors
- [ ] Navigation works
- [ ] Search functions
- [ ] Filters work
- [ ] Responsive on mobile

### Feature Test
- [ ] Add button ready for modals
- [ ] Edit buttons clickable
- [ ] Delete buttons show (with confirmations)
- [ ] Statistics update
- [ ] Charts render correctly

### Performance Test
```bash
# Build for production
npm run build

# Check build size
du -sh .next
```

---

## 📱 Mobile Optimization

The dashboard is fully responsive:

- **Mobile:** Single column, stacked layout
- **Tablet:** 2-3 columns, adjusted spacing
- **Desktop:** Full featured with all columns

Test with:
```bash
# DevTools
F12 → Toggle device toolbar → Select device
```

---

## 🐛 Common Issues & Fixes

### Issue: Pages not found
**Solution:** Verify route structure matches file paths
```
/dashboard/superadmin/students/page.tsx → /dashboard/superadmin/students
```

### Issue: Icons not showing
**Solution:** Ensure lucide-react is imported
```typescript
import { IconName } from "lucide-react";
```

### Issue: Styles not applying
**Solution:** Verify Tailwind CSS is configured
```bash
npm install -D tailwindcss
npx tailwindcss init
```

### Issue: Build failing
**Solution:** Check TypeScript errors
```bash
npm run build
npx tsc --noEmit
```

---

## 📊 Data Structure Reference

### Student
```json
{
  "id": "1",
  "rollNumber": "2024001",
  "firstName": "Ahmed",
  "lastName": "Ali",
  "class": "10-A",
  "section": "A",
  "status": "active"
}
```

### Teacher
```json
{
  "id": "1",
  "employeeCode": "TEA001",
  "firstName": "Muhammad",
  "department": "Mathematics",
  "yearsOfExperience": 8
}
```

### Course
```json
{
  "id": "1",
  "courseCode": "MATH101",
  "courseName": "Algebra",
  "grade": "9",
  "credits": 3,
  "students": 32
}
```

---

## 🔐 Security Notes

1. ✅ All pages protected with `ProtectedRoute`
2. ✅ Authentication checked before rendering
3. ✅ Sidebar respects user permissions
4. ⚠️ TODO: Add role-based access control
5. ⚠️ TODO: Add CSRF token to forms
6. ⚠️ TODO: Sanitize user inputs

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Maintenance
npm run lint             # Check code quality
npm run format           # Format code
npm install             # Install dependencies
npm update              # Update dependencies

# Debugging
npm run dev -- --debug  # Debug mode
```

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 📞 Support & Troubleshooting

1. Check browser console for errors
2. Review NextBuild output
3. Verify API endpoints are running
4. Check database connectivity
5. Review authentication tokens

---

## 🎯 Next Development Goals

1. Add edit modals for all entities
2. Connect to backend APIs
3. Add delete confirmation dialogs
4. Implement bulk operations
5. Add export to PDF/CSV
6. Set up advanced filtering
7. Add real-time notifications
8. Create user role management

---

**Last Updated:** April 21, 2025  
**Version:** 1.0.0

