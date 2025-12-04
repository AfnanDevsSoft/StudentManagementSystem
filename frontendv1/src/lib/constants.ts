export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
export const APP_NAME = "Student Management System";
export const APP_VERSION = "1.0.0";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 0;

// Toast defaults
export const TOAST_DURATION = 3000;

// Role colors
export const ROLE_COLORS = {
  SuperAdmin: "bg-red-100 text-red-800",
  Admin: "bg-blue-100 text-blue-800",
  Teacher: "bg-green-100 text-green-800",
  Student: "bg-purple-100 text-purple-800",
  Parent: "bg-yellow-100 text-yellow-800",
};

// Status colors
export const STATUS_COLORS = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};
