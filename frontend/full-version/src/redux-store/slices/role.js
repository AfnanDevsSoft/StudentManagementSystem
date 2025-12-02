/**
 * Redux Slice for User Role Management
 * Manages user role state across the application
 * Supports persistence and role-based access control
 */

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  role: null,
  roleType: 'guest', // 'student', 'teacher', 'admin', 'guest'
  permissions: [],
  isLoading: false,
  error: null
}

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    /**
     * Set user role
     * @param {string} action.payload - User role from API/auth
     */
    setUserRole: (state, action) => {
      state.role = action.payload
      state.roleType = normalizeRoleType(action.payload)
    },

    /**
     * Set role type (computed from role)
     * @param {string} action.payload - Normalized role type
     */
    setRoleType: (state, action) => {
      state.roleType = action.payload
    },

    /**
     * Set user permissions
     * @param {Array} action.payload - Array of permission strings
     */
    setPermissions: (state, action) => {
      state.permissions = action.payload || []
    },

    /**
     * Check if user has specific permission
     * @param {string} action.payload - Permission to check
     */
    hasPermission: (state, action) => {
      return state.permissions.includes(action.payload)
    },

    /**
     * Set loading state
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },

    /**
     * Set error
     */
    setError: (state, action) => {
      state.error = action.payload
    },

    /**
     * Reset role state
     */
    resetRole: state => {
      state.role = null
      state.roleType = 'guest'
      state.permissions = []
      state.error = null
    },

    /**
     * Clear error
     */
    clearError: state => {
      state.error = null
    }
  }
})

/**
 * Normalize role string to standard role type
 * @param {string} role - Raw role string
 * @returns {string} Normalized role type
 */
function normalizeRoleType(role) {
  if (!role) return 'guest'

  const lowerRole = role.toLowerCase()

  if (['student', 'learner', 'user'].includes(lowerRole)) return 'student'
  if (['teacher', 'educator', 'instructor'].includes(lowerRole)) return 'teacher'
  if (['admin', 'superadmin', 'administrator', 'super_admin'].includes(lowerRole)) return 'admin'

  return 'guest'
}

export const { setUserRole, setRoleType, setPermissions, hasPermission, setLoading, setError, resetRole, clearError } =
  roleSlice.actions

// Selectors
export const selectUserRole = state => state.roleReducer?.role
export const selectRoleType = state => state.roleReducer?.roleType
export const selectPermissions = state => state.roleReducer?.permissions
export const selectIsLoading = state => state.roleReducer?.isLoading
export const selectError = state => state.roleReducer?.error

export const selectIsStudent = state => state.roleReducer?.roleType === 'student'
export const selectIsTeacher = state => state.roleReducer?.roleType === 'teacher'
export const selectIsAdmin = state => state.roleReducer?.roleType === 'admin'

export const selectCanAccess = requiredRoles => state => {
  const roleType = state.roleReducer?.roleType
  if (!requiredRoles) return true
  if (!Array.isArray(requiredRoles)) requiredRoles = [requiredRoles]

  return requiredRoles.includes(roleType)
}

export default roleSlice.reducer
