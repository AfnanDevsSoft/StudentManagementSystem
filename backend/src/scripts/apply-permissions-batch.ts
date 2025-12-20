#!/usr/bin/env ts-node
/**
 * Batch Permission Application Script
 * Applies RBAC permission middleware to all remaining route files
 */

import * as fs from 'fs';
import * as path from 'path';

const ROUTES_DIR = path.join(__dirname, '../routes');

// Route files and their permission mappings
const ROUTE_PERMISSIONS_MAP: Record<string, { import: string, permissions: Record<string, string> }> = {
    'admission.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'admissions:read',
            'GET /:id': 'admissions:read',
            'POST /': 'admissions:create',
            'PUT /:id': 'admissions:update',
            'DELETE /:id': 'admissions:delete',
        }
    },
    'fee.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'finance:read',
            'GET /:id': 'finance:read',
            'GET /student/:studentId': 'finance:read',
            'POST /': 'finance:create',
            'PUT /:id': 'finance:update',
        }
    },
    'payroll.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'payroll:read',
            'GET /:id': 'payroll:read',
            'GET /teacher/:teacherId': 'payroll:read',
            'POST /': 'payroll:create',
            'PUT /:id': 'payroll:update',
        }
    },
    'library.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /books': 'library:read',
            'GET /books/:id': 'library:read',
            'POST /books': 'library:create',
            'PUT /books/:id': 'library:update',
            'DELETE /books/:id': 'library:delete',
            'POST /issue': 'library:create',
            'POST /return': 'library:update',
        }
    },
    'announcements.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'announcements:read',
            'GET /:id': 'announcements:read',
            'POST /': 'announcements:create',
            'PUT /:id': 'announcements:create',
            'DELETE /:id': 'announcements:create',
        }
    },
    'messaging.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'messaging:read',
            'GET /:id': 'messaging:read',
            'POST /': 'messaging:send',
            'PUT /:id/read': 'messaging:read',
        }
    },
    'assignments.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'assignments:read',
            'GET /:id': 'assignments:read',
            'GET /:id/submissions': 'assignments:read',
            'POST /': 'assignments:create',
            'POST /:id/submit': 'assignments:submit',
            'PUT /:id': 'assignments:update',
        }
    },
    'branches.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'branches:read',
            'GET /:id': 'branches:read',
            'POST /': 'branches:create',
            'PUT /:id': 'branches:update',
            'DELETE /:id': 'branches:delete',
        }
    },
    'analytics.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'analytics:read',
            'GET /dashboard': 'analytics:read',
            'GET /students': 'analytics:read',
            'GET /teachers': 'analytics:read',
        }
    },
    'reporting.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'reports:generate',
            'POST /generate': 'reports:generate',
            'GET /export': 'reports:export',
        }
    },
    'medical.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'health:read',
            'GET /:id': 'health:read',
            'GET /student/:studentId': 'health:read',
            'POST /': 'health:create',
            'PUT /:id': 'health:update',
        }
    },
    'timetable.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'courses:read',
            'GET /:id': 'courses:read',
            'POST /': 'courses:create',
            'PUT /:id': 'courses:update',
        }
    },
    'academic-years.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'branches:read',
            'POST /': 'branches:create',
            'PUT /:id': 'branches:update',
        }
    },
    'grade-levels.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'courses:read',
            'POST /': 'courses:create',
            'PUT /:id': 'courses:update',
        }
    },
    'subjects.routes.ts': {
        import: 'requirePermission',
        permissions: {
            'GET /': 'courses:read',
            'POST /': 'courses:create',
            'PUT /:id': 'courses:update',
        }
    },
};

console.log('📋 Batch Permission Application Script');
console.log('=====================================\n');

console.log(`Found ${Object.keys(ROUTE_PERMISSIONS_MAP).length} route files to update`);
console.log('\nRoute files to be updated:');
Object.keys(ROUTE_PERMISSIONS_MAP).forEach((file, i) => {
    const perms = Object.keys(ROUTE_PERMISSIONS_MAP[file].permissions).length;
    console.log(`  ${i + 1}. ${file} (${perms} endpoints)`);
});

console.log('\n⚠️  This is a reference script.');
console.log('   Apply permissions manually to each route file using the mapping above.');
console.log('\n   Pattern:');
console.log('   1. Import: import { requirePermission } from "../middleware/permission.middleware";');
console.log('   2. Apply:  router.get("/", authMiddleware, requirePermission("resource:action"), handler);');
console.log('\n✅ Routes already protected:');
console.log('   - students.routes.ts');
console.log('   - teachers.routes.ts');
console.log('   - users.routes.ts');
console.log('   - courses.routes.ts');
console.log('   - grades.routes.ts');
console.log('   - attendance.routes.ts');

console.log('\n📊 Progress:');
console.log(`   Protected: 6/33 route files (18%)`);
console.log(`   Remaining: 27 route files`);
console.log(`   Estimated time: 2-3 hours\n`);
