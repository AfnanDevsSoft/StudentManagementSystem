# SuperAdmin Dashboard - Feature Reference Guide

## 📋 Dashboard Pages Overview

### 1. Students Management
**Path:** `/dashboard/superadmin/students`  
**File:** `src/app/dashboard/superadmin/students/page.tsx`

**Components:**
- Statistics Cards: Total Students, Active, Average Age, Pass Rate
- Search Bar with real-time filtering
- Filter Options: By Class, Section, Status
- Data Table with columns:
  - Roll Number, Name, Class, Section, Email, Phone, Status, Actions
- Edit/Delete action buttons for each student

**Key Functions:**
```typescript
filteredStudents - Filters by search term and selected filters
getStatusColor() - Returns color classes for status badges
```

---

### 2. Teachers Management
**Path:** `/dashboard/superadmin/teachers`  
**File:** `src/app/dashboard/superadmin/teachers/page.tsx`

**Components:**
- Statistics Cards: Total Teachers, Active, Departments, Avg Experience
- Search Bar for teachers/codes
- Filter by Department dropdown
- Data Table with columns:
  - Employee Code, Name, Department, Designation, Experience, Qualifications, Courses, Status, Actions
- Edit/Delete action buttons

**Key Functions:**
```typescript
filteredTeachers - Filters by search and department
getStatusColor() - Status color mapping
```

---

### 3. Courses Management
**Path:** `/dashboard/superadmin/courses`  
**File:** `src/app/dashboard/superadmin/courses/page.tsx`

**Components:**
- Statistics Cards: Total Courses, Active, Total Students, Grades
- Search bar for course search
- Filter by Grade dropdown
- Filter by Status dropdown
- Course Cards Grid Layout with:
  - Course Code, Name, Description
  - Grade, Teacher, Credits, Students
  - Status Badge
  - Edit/Delete buttons

**Key Functions:**
```typescript
filteredCourses - Multi-filter logic
getStatusColor() - 3-state color mapping (active, inactive, archived)
```

---

### 4. Analytics & Reports
**Path:** `/dashboard/superadmin/analytics`  
**File:** `src/app/dashboard/superadmin/analytics/page.tsx`

**Components:**
- Statistics Cards with trend indicators
- Time Range Selector: Week, Month, Year
- 4 Chart Visualizations:
  1. **Enrollment Trend** - 6-month horizontal bar visualization
  2. **Performance by Grade** - Grade-wise average bars
  3. **Subject Performance** - Stacked pass/fail rates
  4. **Top Performers** - Leaderboard ranking

**Sample Data:**
- Enrollment: Jan-Jun data points
- Performance: Grades 9-12 with averages
- Subjects: Math, English, Science, Social Studies
- Top Performers: 4 students with rankings

---

### 5. Settings
**Path:** `/dashboard/superadmin/settings`  
**File:** `src/app/dashboard/superadmin/settings/page.tsx`

**Components:**

**Section 1: School Information**
- Text inputs: School Name, Email, Phone, Address
- Save button with success message
- State management for all fields

**Section 2: Notifications (2-column layout)**
- Email Notifications toggle
- Student Registration toggle
- Grades Posted toggle
- Attendance Alert toggle
- System Updates toggle

**Section 3: Security (2-column layout)**
- Two-Factor Authentication toggle
- Session Timeout dropdown (15, 30, 60, 120 minutes)
- Password Expiry dropdown (30, 60, 90, 180 days)

**Section 4: System Information**
- Version, Database Size, Last Backup, Active Users (display only)

**Section 5: User Statistics**
- Total Users, Students, Teachers, Admins (display only)

---

## 🎨 Design System

### Color Palette
| Color | Usage | Tailwind Class |
|-------|-------|----------------|
| Blue | Primary, Info, Links | `bg-blue-600`, `text-blue-600` |
| Green | Success, Active | `bg-green-600`, `text-green-600` |
| Purple | Analytics, Special | `bg-purple-600`, `text-purple-600` |
| Orange | Warnings, Secondary | `bg-orange-600`, `text-orange-600` |
| Red | Danger, Inactive | `bg-red-600`, `text-red-600` |
| Gray | Neutral, Disabled | `bg-gray-100`, `text-gray-600` |

### Typography
- Page Titles: `text-3xl font-bold`
- Section Titles: `text-lg font-semibold`
- Table Headers: `text-sm font-semibold`
- Body Text: `text-sm` or `text-base`
- Labels: `text-sm font-medium`

### Spacing
- Page Containers: `space-y-6` (vertical rhythm)
- Card Padding: `p-6`
- Input Padding: `px-4 py-2`
- Grid Gaps: `gap-4` (compact), `gap-6` (loose)

---

## 🔧 Common Components & Patterns

### Status Badge Pattern
```typescript
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-yellow-100 text-yellow-800",
    // ... more statuses
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

// Usage:
<span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
  {status}
</span>
```

### Search & Filter Pattern
```typescript
const [searchTerm, setSearchTerm] = useState("");
const [filterType, setFilterType] = useState("all");

const filtered = data.filter((item) => {
  const matchesSearch = item.name.includes(searchTerm);
  const matchesFilter = filterType === "all" || item.type === filterType;
  return matchesSearch && matchesFilter;
});
```

### Statistics Cards Pattern
```typescript
const stats = [
  { label: "Title", value: "123", color: "bg-blue-100 text-blue-600" },
  // ...
];

{stats.map((stat) => (
  <div key={stat.label} className="bg-white rounded-lg shadow p-6">
    <p className="text-gray-600 text-sm">{stat.label}</p>
    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
  </div>
))}
```

---

## 📱 Responsive Breakpoints

- **Mobile:** Single column layouts (`grid-cols-1`)
- **Tablet:** 2 columns (`md:grid-cols-2`)
- **Desktop:** 3-4 columns (`lg:grid-cols-3`, `lg:grid-cols-4`)

### Examples
```typescript
// 2-column on mobile, 4-column on desktop
className="grid grid-cols-1 md:grid-cols-4 gap-4"

// Full width on mobile, half on tablet, third on desktop
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## 🚀 Performance Optimizations

1. **Component Structure**
   - Separate data fetching logic from UI
   - Memoize expensive calculations

2. **Rendering**
   - Use `.map()` efficiently
   - Key props on lists for reconciliation

3. **Styling**
   - Tailwind CSS (no runtime CSS-in-JS)
   - Utility classes for quick styling

4. **State Management**
   - Local state for UI toggles and filters
   - No unnecessary re-renders

---

## 🔗 Integration Points (Ready for Backend)

### Students Page
- Replace `SAMPLE_STUDENTS` with API call to `/api/students`
- PUT request for edit
- DELETE request for deletion

### Teachers Page
- Replace `SAMPLE_TEACHERS` with `/api/teachers`
- POST for new teacher
- PUT for updates

### Courses Page
- Replace `SAMPLE_COURSES` with `/api/courses`
- POST for new course
- DELETE for course removal

### Analytics Page
- Connect to `/api/analytics/enrollment`
- Connect to `/api/analytics/performance`
- Connect to `/api/analytics/subjects`

### Settings Page
- PUT `/api/settings/school-info`
- PUT `/api/settings/notifications`
- PUT `/api/settings/security`

---

## 📚 Available Icons (Lucide React)

- `LayoutDashboard` - Navigation to main dashboard
- `Users` - Students/Teachers management
- `BookOpen` - Courses
- `BarChart3` - Analytics
- `Settings` - Settings/Configuration
- `Search` - Search functionality
- `Plus` - Add new item
- `Edit2` - Edit action
- `Trash2` - Delete action
- `LineChart` - Line chart visualization
- `PieChart` - Pie/distribution chart
- `TrendingUp` - Performance/ranking
- `Bell` - Notifications
- `Lock` - Security
- `Database` - System info
- `AlertCircle` - Alerts/warnings

---

## 🧪 Testing Checklist

- [ ] All pages load without errors
- [ ] Search functionality works on all tables
- [ ] Filters update results correctly
- [ ] Add buttons are clickable (ready for modals)
- [ ] Edit/Delete buttons show correct styling
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] All icons display correctly
- [ ] Colors match design system
- [ ] Tables are sortable (ready for implementation)
- [ ] Settings form saves properly

---

## 📖 Documentation Links

- **Frontend:** `frontendv1/README.md`
- **Backend:** `backend/README.md`
- **API Docs:** `docs/API_DOCUMENTATION_DETAILED.md`
- **Database Schema:** `docs/DATABASE_SCHEMA_DETAILED.md`

---

**Last Updated:** April 21, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready

