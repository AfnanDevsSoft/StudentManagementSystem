'use client'

// Next Imports
import { redirect } from 'next/navigation'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * RoleBasedRoute HOC
 * Protects routes based on user role
 * Only allows users with specified roles to access the route
 *
 * @param {Array} allowedRoles - Array of allowed role names (e.g., ['admin', 'teacher'])
 * @param {string} locale - Language locale code
 * @returns {Function} Wrapper component
 */
export const withRoleBasedRoute = (allowedRoles = []) => {
  return async function ProtectedRoleRoute({ children, lang }) {
    const session = await getServerSession()

    if (!session) {
      redirect(getLocalizedUrl('/login', lang))
    }

    // Get user role from session
    const userRole = session?.user?.role?.toLowerCase()

    // Check if user role is in allowed roles
    const isAuthorized = allowedRoles.length === 0 || allowedRoles.includes(userRole)

    if (!isAuthorized) {
      redirect(getLocalizedUrl('/pages/misc/401-not-authorized', lang))
    }

    return <>{children}</>
  }
}

/**
 * Client-side role check hook for dynamic role verification
 * Use in components that need to verify role at runtime
 */
export function useRoleCheck() {
  'use client'

  const { user } = useAuth()

  const hasRole = requiredRoles => {
    if (!user) return false
    if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles]

    const userRole = user.role?.toLowerCase()

    return requiredRoles.includes(userRole)
  }

  const isStudent = () => hasRole(['student', 'learner'])
  const isTeacher = () => hasRole(['teacher', 'instructor'])
  const isAdmin = () => hasRole(['admin', 'superadmin', 'administrator'])

  return {
    hasRole,
    isStudent,
    isTeacher,
    isAdmin,
    userRole: user?.role
  }
}
