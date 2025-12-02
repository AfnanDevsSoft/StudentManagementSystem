/**
 * Role-Based Navigation Menu Data Generator
 * Generates different menu items based on user role
 * Supports: student, teacher, admin/superadmin
 */

/**
 * Get menu items based on user role
 * @param {string} role - User role (student, teacher, admin, superadmin)
 * @param {Object} dictionary - i18n dictionary for labels
 * @returns {Array} Menu items array filtered by role
 */
export const getRoleBasedMenuData = (role, dictionary) => {
  const normalizedRole = role?.toLowerCase() || 'student'

  switch (normalizedRole) {
    case 'student':
    case 'learner':
    case 'user':
      return getStudentMenuData(dictionary)
    case 'teacher':
    case 'educator':
    case 'instructor':
      return getTeacherMenuData(dictionary)
    case 'admin':
    case 'superadmin':
    case 'administrator':
    case 'super_admin':
      return getAdminMenuData(dictionary)
    default:
      return getStudentMenuData(dictionary)
  }
}

/**
 * Student Portal Menu Items
 * Focused on: Dashboard
 */
const getStudentMenuData = dictionary => [
  {
    label: dictionary?.navigation?.dashboard || 'Dashboard',
    href: '/dashboards/student',
    icon: 'ri-home-smile-line',
    isSection: false
  }
]

/**
 * Teacher Portal Menu Items
 * Focused on: Dashboard
 */
const getTeacherMenuData = dictionary => [
  {
    label: dictionary?.navigation?.dashboard || 'Dashboard',
    href: '/dashboards/teacher',
    icon: 'ri-home-smile-line',
    isSection: false
  }
]

/**
 * Admin Portal Menu Items
 * Focused on: Dashboard
 */
const getAdminMenuData = dictionary => [
  {
    label: dictionary?.navigation?.dashboard || 'Dashboard',
    href: '/dashboards/admin',
    icon: 'ri-home-smile-line',
    isSection: false
  }
]

export default getRoleBasedMenuData
