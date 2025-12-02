/**
 * Form Validation Hook
 * Provides validation utilities for all forms in the application
 */

import { useCallback } from 'react'
import { useToast } from './toastNotification'
import { customValidators } from './validationSchemas'

/**
 * Hook for form validation utilities
 */
export const useFormValidation = () => {
  const { error: showError } = useToast()

  /**
   * Validate required field
   */
  const validateRequired = useCallback(
    (value, fieldName) => {
      if (!customValidators.isRequired(value)) {
        showError(`${fieldName} is required`)
        return false
      }
      return true
    },
    [showError]
  )

  /**
   * Validate email
   */
  const validateEmail = useCallback(
    (email, fieldName = 'Email') => {
      if (!customValidators.isValidEmail(email)) {
        showError(`${fieldName} is invalid`)
        return false
      }
      return true
    },
    [showError]
  )

  /**
   * Validate password strength
   */
  const validatePassword = useCallback(
    (password, fieldName = 'Password') => {
      if (!customValidators.isStrongPassword(password)) {
        showError(
          `${fieldName} must contain uppercase, lowercase, numbers, and special characters (min 8 characters)`
        )
        return false
      }
      return true
    },
    [showError]
  )

  /**
   * Validate date range
   */
  const validateDateRange = useCallback(
    (startDate, endDate) => {
      if (!customValidators.isValidDateRange(startDate, endDate)) {
        showError('End date must be after start date')
        return false
      }
      return true
    },
    [showError]
  )

  /**
   * Validate phone number
   */
  const validatePhoneNumber = useCallback(
    (phone, fieldName = 'Phone number') => {
      if (!customValidators.isValidPhoneNumber(phone)) {
        showError(`${fieldName} format is invalid`)
        return false
      }
      return true
    },
    [showError]
  )

  /**
   * Validate file size
   */
  const validateFileSize = useCallback(
    (file, maxSizeMB = 50, fieldName = 'File') => {
      if (!file) return true
      if (!customValidators.isValidFileSize(file, maxSizeMB)) {
        showError(`${fieldName} size must be less than ${maxSizeMB}MB`)
        return false
      }
      return true
    },
    [showError]
  )

  /**
   * Validate file type
   */
  const validateFileType = useCallback(
    (file, allowedTypes, fieldName = 'File') => {
      if (!file) return true
      if (!customValidators.isValidFileType(file, allowedTypes)) {
        showError(`${fieldName} type is not allowed`)
        return false
      }
      return true
    },
    [showError]
  )

  /**
   * Validate form data
   */
  const validateFormData = useCallback(
    (data, rules) => {
      let isValid = true

      Object.keys(rules).forEach(fieldName => {
        const rule = rules[fieldName]
        const value = data[fieldName]

        // Check required
        if (rule.required && !customValidators.isRequired(value)) {
          showError(`${rule.label || fieldName} is required`)
          isValid = false
        }

        // Check email
        if (rule.isEmail && value && !customValidators.isValidEmail(value)) {
          showError(`${rule.label || fieldName} is invalid`)
          isValid = false
        }

        // Check min length
        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          showError(`${rule.label || fieldName} must be at least ${rule.minLength} characters`)
          isValid = false
        }

        // Check max length
        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          showError(`${rule.label || fieldName} cannot exceed ${rule.maxLength} characters`)
          isValid = false
        }
      })

      return isValid
    },
    [showError]
  )

  return {
    validateRequired,
    validateEmail,
    validatePassword,
    validateDateRange,
    validatePhoneNumber,
    validateFileSize,
    validateFileType,
    validateFormData
  }
}

export default useFormValidation
