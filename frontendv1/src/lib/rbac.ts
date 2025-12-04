import { UserRole } from "@/types";

// Permission Definitions
export const rolePermissions: Record<UserRole, string[]> = {
  SuperAdmin: [
    "manage_branches",
    "manage_users",
    "manage_roles",
    "manage_students",
    "manage_teachers",
    "manage_courses",
    "manage_grades",
    "view_analytics",
    "manage_payroll",
    "manage_admissions",
    "view_reports",
    "view_communications",
  ],
  Admin: [
    "manage_students",
    "manage_teachers",
    "manage_courses",
    "manage_grades",
    "view_analytics",
    "manage_admissions",
    "view_reports",
    "view_communications",
  ],
  Teacher: [
    "view_students",
    "manage_grades",
    "manage_attendance",
    "view_my_courses",
    "view_communications",
    "send_messages",
  ],
  Student: [
    "view_grades",
    "view_attendance",
    "view_courses",
    "view_announcements",
    "view_course_content",
    "send_messages",
  ],
  Parent: [
    "view_student_grades",
    "view_student_attendance",
    "view_announcements",
    "send_messages",
  ],
};

// RBAC Helper Functions
export const canAccess = (userRole: UserRole, permission: string): boolean => {
  return rolePermissions[userRole]?.includes(permission) ?? false;
};

export const canAccessDashboard = (userRole: UserRole): boolean => {
  return ["SuperAdmin", "Admin", "Teacher", "Student", "Parent"].includes(
    userRole
  );
};

export const getDashboardRoute = (userRole: UserRole): string => {
  switch (userRole) {
    case "SuperAdmin":
      return "/dashboard/superadmin";
    case "Admin":
      return "/dashboard/admin";
    case "Teacher":
      return "/dashboard/teacher";
    case "Student":
      return "/dashboard/student";
    case "Parent":
      return "/dashboard/parent";
    default:
      return "/";
  }
};

// Role Badge Colors
export const roleBadgeColors: Record<UserRole, string> = {
  SuperAdmin: "bg-red-100 text-red-800",
  Admin: "bg-blue-100 text-blue-800",
  Teacher: "bg-green-100 text-green-800",
  Student: "bg-purple-100 text-purple-800",
  Parent: "bg-yellow-100 text-yellow-800",
};

// Role Display Names
export const roleDisplayNames: Record<UserRole, string> = {
  SuperAdmin: "Super Administrator",
  Admin: "Administrator",
  Teacher: "Teacher",
  Student: "Student",
  Parent: "Parent/Guardian",
};
