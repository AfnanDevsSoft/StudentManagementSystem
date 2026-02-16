# SuperAdmin Permission Migration

## What Changed?

**Security Fix:** Removed SuperAdmin RBAC bypass

**Previous Behavior:**
- SuperAdmin could bypass ALL permission checks
- Complete access to all endpoints regardless of permissions
- No audit trail for SuperAdmin actions
- Violated principle of least privilege

**New Behavior:**
- SuperAdmin MUST have explicit permissions assigned
- All permission checks are enforced uniformly
- Comprehensive audit logging for ALL users including SuperAdmin
- Enforces principle of least privilege

## Migration Required

### Step 1: Add AuditLog Schema (if not exists)

Add to `prisma/schema.prisma`:

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  action    String   // e.g., 'PERMISSION_CHECK', 'LOGIN', 'CREATE_STUDENT'
  resource  String?  // e.g., 'students', 'courses'
  resourceId String?
  details   Json?    // Additional context
  createdAt DateTime @default(now())
  
  user      User?    @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

Then run:
```bash
npx prisma migrate dev --name add-audit-log
```

### Step 2: Run Migration to Assign Permissions

Run this Prisma migration to assign ALL permissions to SuperAdmin:

```bash
npx prisma migrate dev --name fix_superadmin_permissions
```

Or manually run:

```sql
INSERT INTO "RolePermission" (role_id, permission_id)
SELECT r.id, p.id
FROM "Role" r
CROSS JOIN "Permission" p
WHERE r.role_name = 'SuperAdmin'
  AND NOT EXISTS (
    SELECT 1 
    FROM "RolePermission" rp 
    WHERE rp.role_id = r.id 
    AND rp.permission_id = p.id
);
```

### Step 3: Verify SuperAdmin Permissions

Run this query to verify SuperAdmin has all permissions:

```sql
SELECT 
    r.role_name,
    COUNT(rp.permission_id) as permission_count
FROM "Role" r
LEFT JOIN "RolePermission" rp ON r.id = rp.role_id
WHERE r.role_name = 'SuperAdmin'
GROUP BY r.id, r.role_name;
```

Expected result: `permission_count` should equal total number of permissions (currently 40+)

## Testing

### Test 1: Verify Permission Enforcement

```typescript
// Login as SuperAdmin
const token = await login('superadmin', 'password');

// Try to access endpoint WITHOUT having explicit permission in DB
// Should now FAIL (previously would succeed due to bypass)
const response = await fetch('/api/v1/users', {
  headers: { 'Authorization': `Bearer ${token}` }
});

console.log(response.status); // Should be 403 if permission not assigned
```

### Test 2: Verify Audit Logging

```sql
-- Check audit logs for SuperAdmin actions
SELECT * FROM "AuditLog"
WHERE userId = 'superadmin-user-id'
ORDER BY createdAt DESC
LIMIT 10;
```

You should see entries for all permission checks, including SuperAdmin actions.

### Test 3: Verify All Permissions Assigned

```typescript
// Check SuperAdmin permissions via API
const permissions = await RBACService.getUserPermissions(superAdminUserId);
console.log(permissions.length); // Should be 40+
```

## Rollback Plan

If you need to rollback (NOT RECOMMENDED for security reasons):

1. Restore the previous version of `permission.middleware.ts`
2. Remove the audit logging code
3. Run migration to remove all SuperAdmin permissions:

```sql
DELETE FROM "RolePermission" 
WHERE role_id = (SELECT id FROM "Role" WHERE role_name = 'SuperAdmin');
```

## Security Benefits

✅ **Complete Audit Trail** - All actions logged regardless of user role  
✅ **Principle of Least Privilege** - SuperAdmin only has explicitly granted permissions  
✅ **Uniform Security** - Same permission checks apply to all users  
✅ **Compliance** - Meets security audit requirements  
✅ **Defense in Depth** - Multiple layers of authorization  

## Performance Impact

- Minimal: One additional database write per permission check
- Audit logs are written asynchronously (fire-and-forget)
- Connection pool handles audit log writes efficiently
- Can be archived after 90 days to save space

## Monitoring

Watch for:
- Permission denied errors for SuperAdmin (indicates missing permissions)
- Audit log failures (check error logs)
- Unusual permission patterns

**Query to find SuperAdmin permission denials:**

```sql
SELECT 
    al.userId,
    al.action,
    al.resource,
    al.details->>'requiredPermission' as required_permission,
    al.createdAt
FROM "AuditLog" al
JOIN "User" u ON al.userId = u.id
JOIN "Role" r ON u.roleId = r.id
WHERE r.role_name = 'SuperAdmin'
  AND al.details->>'granted' = 'false'
ORDER BY al.createdAt DESC;
```

---

**Migration Date:** February 13, 2026  
**Security Fix:** CRITICAL - RBAC Bypass Removed  
**Breaking Change:** YES - SuperAdmin must have explicit permissions
