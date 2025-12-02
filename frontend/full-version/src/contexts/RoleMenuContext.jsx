/**
 * Role-Based Menu Context
 * Provides role-based menu data and role checking utilities
 * to the entire application
 */

'use client'

import { createContext, useContext, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { getRoleBasedMenuData } from '@/data/navigation/roleBasedMenuData'

// Create Role Menu Context
const RoleMenuContext = createContext(null)

/**
 * RoleMenuProvider Component
 * Wraps application with role-based menu functionality
 */
export function RoleMenuProvider({ children, dictionary = {} }) {
  const { user } = useAuth()

  // Get menu data based on user role
  const menuData = useMemo(() => {
    if (!user?.role) {
      return []
    }
    return getRoleBasedMenuData(user.role, dictionary)
  }, [user?.role, dictionary])

  // Determine user role type
  const roleType = useMemo(() => {
    if (!user?.role) return 'guest'

    const role = user.role.toLowerCase()

    if (['student', 'learner', 'user'].includes(role)) return 'student'
    if (['teacher', 'educator', 'instructor'].includes(role)) return 'teacher'
    if (['admin', 'superadmin', 'administrator', 'super_admin'].includes(role)) return 'admin'

    return 'guest'
  }, [user?.role])

  // Role checking utilities
  const canAccess = requiredRoles => {
    if (!requiredRoles) return true
    if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles]

    return requiredRoles.includes(roleType)
  }

  const value = {
    menuData,
    roleType,
    userRole: user?.role,
    canAccess,
    isStudent: roleType === 'student',
    isTeacher: roleType === 'teacher',
    isAdmin: roleType === 'admin',
    user
  }

  return <RoleMenuContext.Provider value={value}>{children}</RoleMenuContext.Provider>
}

/**
 * Hook to use Role Menu Context
 * Must be used within RoleMenuProvider
 */
export function useRoleMenu() {
  const context = useContext(RoleMenuContext)

  if (!context) {
    throw new Error('useRoleMenu must be used within a RoleMenuProvider')
  }

  return context
}

export default RoleMenuContext
