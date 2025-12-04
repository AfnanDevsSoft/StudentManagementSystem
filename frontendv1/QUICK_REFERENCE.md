# Frontend v1 - Quick Reference Guide

## 🚀 Quick Start (30 seconds)

```bash
cd frontendv1
npm run dev
# Open http://localhost:3000
# Login: admin1 / password123
```

---

## 📂 Where to Find Things

| What             | Where                                         |
| ---------------- | --------------------------------------------- |
| Login Page       | `/src/app/auth/login/page.tsx`                |
| Dashboards       | `/src/app/dashboard/[role]/page.tsx`          |
| Management Pages | `/src/app/dashboard/[role]/[entity]/page.tsx` |
| Components       | `/src/components/*.tsx`                       |
| API Client       | `/src/lib/apiClient.ts`                       |
| RBAC             | `/src/lib/rbac.ts`                            |
| Validation       | `/src/lib/validation.ts`                      |
| Types            | `/src/types/index.ts`                         |
| Store            | `/src/stores/authStore.ts`                    |

---

## 🎯 Common Tasks

### Add New Management Page

1. Create folder: `/src/app/dashboard/[role]/[entity]/`
2. Create `page.tsx` file
3. Use template from existing pages (e.g., Students)
4. Update sidebar items with navigation links

Example path structure:

```
/dashboard/admin/reports/page.tsx
/dashboard/superadmin/roles/page.tsx
/dashboard/teacher/assignments/page.tsx
```

### Add New API Endpoint

1. Open `/src/lib/apiClient.ts`
2. Add method to ApiClient class:

```typescript
async getReports(branchId: string) {
  return this.get(`/branches/${branchId}/reports`);
}
```

### Add Form Validation

1. Open `/src/lib/validation.ts`
2. Create interface for form data
3. Create validation function
4. Export validation utilities

Example:

```typescript
export interface ReportFormData {
  title: string;
  description: string;
}

export const validateReportForm = (data: ReportFormData): ValidationResult => {
  const errors: ValidationError[] = [];
  // Add validation logic
  return { isValid: errors.length === 0, errors };
};
```

### Add Toast Notification

```typescript
import toast from "react-hot-toast";

toast.success("Success message");
toast.error("Error message");
toast.loading("Loading...");
```

### Create Modal Form

```typescript
import { Modal, FormField, Button } from "@/components/UI";

<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <FormField
    label="Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
  />
  <Button onClick={handleSubmit}>Save</Button>
</Modal>;
```

---

## 🔑 Key Files to Know

### Types (`/src/types/index.ts`)

- All data interfaces
- API response types
- All form types

### API Client (`/src/lib/apiClient.ts`)

- All API methods
- Request/response interceptors
- Error handling

### RBAC (`/src/lib/rbac.ts`)

- Permission matrix
- Role utilities
- Dashboard routing

### Auth Store (`/src/stores/authStore.ts`)

- User state
- Auth methods
- Permission checking

### Validation (`/src/lib/validation.ts`)

- Form validators
- Error utilities
- Regex patterns

---

## 📱 Dashboard URLs

| Role       | URL                     | Status |
| ---------- | ----------------------- | ------ |
| SuperAdmin | `/dashboard/superadmin` | ✅     |
| Admin      | `/dashboard/admin`      | ✅     |
| Teacher    | `/dashboard/teacher`    | ✅     |
| Student    | `/dashboard/student`    | ✅     |
| Parent     | `/dashboard/parent`     | ✅     |

---

## 🛠️ Management Page URLs

| Page       | URL                              | Status |
| ---------- | -------------------------------- | ------ |
| Students   | `/dashboard/admin/students`      | ✅     |
| Teachers   | `/dashboard/admin/teachers`      | ✅     |
| Courses    | `/dashboard/admin/courses`       | ✅     |
| Branches   | `/dashboard/superadmin/branches` | ✅     |
| Users      | `/dashboard/superadmin/users`    | ✅     |
| Grades     | `/dashboard/teacher/grades`      | ✅     |
| Attendance | `/dashboard/teacher/attendance`  | ✅     |

---

## 🔓 Role Permissions

### SuperAdmin

- ✅ View all branches
- ✅ Manage users
- ✅ Manage roles
- ✅ System settings

### Admin

- ✅ Manage students
- ✅ Manage teachers
- ✅ Manage courses
- ✅ View reports

### Teacher

- ✅ View my courses
- ✅ Enter grades
- ✅ Mark attendance
- ✅ Send messages

### Student

- ✅ View courses
- ✅ View grades
- ✅ View attendance
- ✅ Send messages

### Parent

- ✅ View children
- ✅ View performance
- ✅ Send messages

---

## 🧪 Testing Endpoints

### Login Test

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"password123"}'
```

### Get Students Test

```bash
curl -X GET http://localhost:3000/api/v1/branches/branch-id/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📦 Dependencies

| Package         | Purpose          |
| --------------- | ---------------- |
| next            | React framework  |
| react           | UI library       |
| typescript      | Type safety      |
| tailwindcss     | Styling          |
| zustand         | State management |
| axios           | HTTP client      |
| lucide-react    | Icons            |
| react-hot-toast | Notifications    |

---

## ⚙️ Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 🚨 Troubleshooting

### Clear Cache

```bash
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Type Check

```bash
npm run build
```

### Lint Check

```bash
npm run lint
```

### Kill Port

```bash
lsof -ti:3000 | xargs kill -9
```

---

## 📋 Checklist for New Features

- [ ] Create types in `/src/types/index.ts`
- [ ] Add API methods in `/src/lib/apiClient.ts`
- [ ] Create validation in `/src/lib/validation.ts`
- [ ] Create page component
- [ ] Add navigation links
- [ ] Add RBAC permissions if needed
- [ ] Test all flows
- [ ] Test responsive design
- [ ] Update documentation

---

## 🎨 Color Reference

| Color      | Usage                   |
| ---------- | ----------------------- |
| Blue-600   | Primary buttons, active |
| Green-600  | Success, active status  |
| Red-600    | Delete, error, inactive |
| Yellow-600 | Warning, late status    |
| Orange-600 | Half-day status         |
| Purple-600 | SuperAdmin role         |
| Pink-600   | Parent role             |

---

## 📊 Component Props Reference

### Modal

```typescript
<Modal
  isOpen={boolean}
  title={string}
  onClose={() => void}
  size="sm" | "md" | "lg"
/>
```

### FormField

```typescript
<FormField
  label={string}
  type="text" | "email" | "password" | "number"
  value={string}
  onChange={(e) => void}
  error={string}
  placeholder={string}
/>
```

### Button

```typescript
<Button
  variant="primary" | "secondary" | "danger"
  size="sm" | "md" | "lg"
  disabled={boolean}
  onClick={() => void}
>
  Text
</Button>
```

---

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com/docs/intro)

---

## 📞 Need Help?

1. Check IMPLEMENTATION_GUIDE.md for detailed info
2. Check TESTING_GUIDE.md for testing procedures
3. Check console for error messages
4. Check Network tab for API responses
5. Review existing page implementations

---

**Version:** 1.0.0
**Last Updated:** December 3, 2025

Happy coding! 🚀
