# Quick Reference - CRUD Implementation

## File Locations
```
Frontend Root: /Users/ashhad/Dev/soft/Student Management/studentManagement/frontendv1/

Key Files:
├── src/components/
│   ├── UserForm.tsx ............................ User form component (NEW)
│   ├── BranchForm.tsx .......................... Branch form component (UPDATED)
│   └── Modal.tsx ............................... Shared modal wrapper
├── src/lib/
│   ├── api-types.ts ............................ Type definitions
│   └── api.ts .................................. API client
└── src/app/admin/users/
    └── page.tsx ............................... Users CRUD page (NEW)
```

## Component Quick Start

### UserForm Component
```typescript
import UserForm from '@/components/UserForm';

<UserForm
  initialData={user}        // Optional: for editing
  onSubmit={handleSave}     // Required: submit handler
  onCancel={handleCancel}   // Required: cancel handler
  isLoading={false}         // Optional: loading state
  branches={branches}       // Optional: branch options
  roles={roles}             // Optional: role options
/>
```

### UsersPage Route
```
Route: /admin/users
Entry Point: /frontendv1/src/app/admin/users/page.tsx
```

## API Endpoints Required

### Users Endpoints
```
GET    /api/users              - Get all users
POST   /api/users              - Create user
PUT    /api/users/:id          - Update user (id in URL)
DELETE /api/users/:id          - Delete user

GET    /api/branches           - Get all branches (for dropdown)
GET    /api/roles              - Get all roles (for dropdown)
```

### Request/Response Format

**Create/Update User:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "hashed_password",  // Only for create
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "branch_id": "branch-123",
  "role_id": "role-456",
  "is_active": true
}
```

**Response:**
```json
{
  "id": "user-123",
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "branch_id": "branch-123",
  "role_id": "role-456",
  "is_active": true,
  "created_at": "2025-04-21T10:00:00Z",
  "updated_at": "2025-04-21T10:00:00Z"
}
```

## Validation Rules

### UserForm Validation
| Field | Rule | Error Message |
|-------|------|---------------|
| username | Required, not editable when editing | "Username is required" |
| email | Required, valid email format | "Email is required" / "Invalid email format" |
| password | Required for new users only | "Password is required for new users" |
| first_name | Required | "First name is required" |
| last_name | Required | "Last name is required" |
| phone | Required | "Phone is required" |
| branch_id | Must select one | "Branch is required" |
| role_id | Must select one | "Role is required" |

### BranchForm Validation
| Field | Rule | Error Message |
|-------|------|---------------|
| name | Required | "Branch name is required" |
| description | Required | "Description is required" |
| location | Required | "Location is required" |
| contact_phone | Required | "Contact phone is required" |

## State Variables

### UsersPage State
```typescript
users: User[]                    // All loaded users
branches: Branch[]              // Branches for dropdown
roles: Role[]                   // Roles for dropdown
loading: boolean                // API call in progress
searchTerm: string              // Current search filter
showForm: boolean               // Form modal visibility
editingUser: User | null        // User being edited (null for create)
deleteConfirm: User | null      // User awaiting delete confirmation
error: string                   // Error message to display
success: string                 // Success message to display
```

## User Workflows

### Create Flow
```
1. Click "Add User"
2. setShowForm(true) & setEditingUser(null)
3. UserForm renders in modal
4. User fills form & clicks Save
5. validateForm()
6. handleSubmit() → API POST
7. loadUsers() → refresh table
8. Show success message
9. Close modal
```

### Edit Flow
```
1. Click Edit on user row
2. setEditingUser(user) & setShowForm(true)
3. UserForm renders with initialData
4. User updates form & clicks Save
5. validateForm()
6. handleSubmit() → API PUT
7. loadUsers() → refresh table
8. Show success message
9. Close modal
```

### Delete Flow
```
1. Click Delete on user row
2. setDeleteConfirm(user)
3. Confirmation modal shows
4. User confirms delete
5. handleDelete() → API DELETE
6. loadUsers() → refresh table
7. Show success message
```

### Search Flow
```
1. User types in search box
2. setSearchTerm(value)
3. filteredUsers = users.filter(...)
4. Table re-renders with filtered results
```

## Common Code Patterns

### API Call with Error Handling
```typescript
const loadUsers = async () => {
  setLoading(true);
  try {
    const response = await api.get("/users");
    setUsers(response.data);
    setError("");
  } catch (err) {
    setError("Failed to load users");
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

### Form Submission
```typescript
const handleSubmit = async (data: UserFormData) => {
  setLoading(true);
  try {
    if (editingUser) {
      await api.put(`/users/${editingUser.id}`, data);
    } else {
      await api.post("/users", data);
    }
    setShowForm(false);
    loadUsers();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### Inline Error Display
```typescript
{errors.email && (
  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
)}
```

## Testing Commands

### Start Frontend Dev Server
```bash
cd /Users/ashhad/Dev/soft/Student\ Management/studentManagement/frontendv1
npm run dev
# Opens at http://localhost:3000
```

### Navigate to Users Page
```
http://localhost:3000/admin/users
```

### Browser Testing
1. Open DevTools (F12)
2. Go to Network tab
3. Perform CRUD operations
4. Watch API calls
5. Check Console for errors

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Page shows "No users found" | No API data | Check backend is running, check `/users` endpoint |
| "Failed to load users" error | API error | Check browser console, check API response |
| Form validation fails | Invalid input | Review validation rules in UserForm |
| Branches/Roles dropdown empty | API not returning data | Check `/branches` and `/roles` endpoints |
| Search not working | Search filter issue | Check filteredUsers logic, verify data |
| Modal won't close | State not updating | Check onCancel handler |
| Edit form shows password | Should hide on edit | Verify initialData check in UserForm |

## Styling Reference

### Tailwind Classes Used
```
Colors:
- Blue: bg-blue-600, text-blue-600, border-blue-500
- Red: bg-red-600, text-red-600, border-red-500
- Green: bg-green-100, text-green-800
- Gray: bg-gray-50, bg-gray-100, text-gray-600

States:
- Hover: hover:bg-blue-700, hover:bg-gray-200
- Focus: focus:ring-2, focus:ring-blue-500
- Disabled: disabled:opacity-50
- Active: font-bold, text-blue-600

Layout:
- Container: max-w-7xl, mx-auto, px-4
- Grid: grid, grid-cols-1, md:grid-cols-2
- Spacing: gap-4, space-y-6, py-3, px-6
```

### Responsive Breakpoints
- Mobile: `max-w` not specified (full width)
- Tablet: `md:` prefix (768px and up)
- Desktop: No breakpoint (automatic at large sizes)

## Documentation Files
- **CHECKPOINT_CRUD_IMPLEMENTATION.md** - Session checkpoint
- **CRUD_IMPLEMENTATION_GUIDE.md** - Complete implementation guide
- **QUICK_REFERENCE.md** - This file

## Key Points to Remember

✅ **Do's:**
- Always validate form data before submission
- Always handle API errors gracefully
- Always show loading states
- Always refresh data after CRUD operations
- Always use TypeScript interfaces for type safety

❌ **Don'ts:**
- Don't allow username changes after creation
- Don't show password field when editing user
- Don't make password optional for new users
- Don't forget to clear errors after field change
- Don't hardcode API URLs (use api.ts client)

---

**Last Updated:** April 21, 2025
