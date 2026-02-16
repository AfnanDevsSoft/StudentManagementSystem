-- Migration: Fix SuperAdmin Permissions
-- Description: Assign all permissions to SuperAdmin role since bypass is removed
-- Date: February 13, 2026

-- Insert all missing permissions for SuperAdmin role
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

-- Verify the assignment
SELECT 
    r.role_name,
    COUNT(rp.permission_id) as permission_count,
    'SuperAdmin now has all permissions' as status
FROM "Role" r
LEFT JOIN "RolePermission" rp ON r.id = rp.role_id
WHERE r.role_name = 'SuperAdmin'
GROUP BY r.id, r.role_name;
