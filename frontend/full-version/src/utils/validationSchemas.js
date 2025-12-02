/**
 * Form Validation Schemas
 * Centralized validation rules for all Phase 2 forms
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/

/**
 * Messaging Form Validation
 */
export const messagingValidation = {
  recipientId: {
    required: 'Recipient ID is required',
    minLength: {
      value: 3,
      message: 'Recipient ID must be at least 3 characters'
    },
    maxLength: {
      value: 50,
      message: 'Recipient ID cannot exceed 50 characters'
    },
    pattern: {
      value: /^[a-zA-Z0-9-_]+$/,
      message: 'Recipient ID can only contain letters, numbers, hyphens, and underscores'
    }
  },
  subject: {
    required: 'Subject is required',
    minLength: {
      value: 3,
      message: 'Subject must be at least 3 characters'
    },
    maxLength: {
      value: 100,
      message: 'Subject cannot exceed 100 characters'
    }
  },
  messageBody: {
    required: 'Message body is required',
    minLength: {
      value: 5,
      message: 'Message must be at least 5 characters'
    },
    maxLength: {
      value: 5000,
      message: 'Message cannot exceed 5000 characters'
    }
  }
}

/**
 * Announcements Form Validation
 */
export const announcementsValidation = {
  title: {
    required: 'Announcement title is required',
    minLength: {
      value: 5,
      message: 'Title must be at least 5 characters'
    },
    maxLength: {
      value: 150,
      message: 'Title cannot exceed 150 characters'
    }
  },
  content: {
    required: 'Announcement content is required',
    minLength: {
      value: 10,
      message: 'Content must be at least 10 characters'
    },
    maxLength: {
      value: 3000,
      message: 'Content cannot exceed 3000 characters'
    }
  },
  courseId: {
    required: 'Course selection is required'
  },
  priority: {
    required: 'Priority level is required'
  },
  expiryDate: {
    validate: {
      isFuture: value => {
        if (!value) return 'Expiry date is required'
        const selectedDate = new Date(value)
        const now = new Date()
        return selectedDate > now || 'Expiry date must be in the future'
      }
    }
  }
}

/**
 * Course Content Upload Validation
 */
export const courseContentValidation = {
  courseId: {
    required: 'Course selection is required'
  },
  lessonId: {
    required: 'Lesson selection is required'
  },
  title: {
    required: 'Content title is required',
    minLength: {
      value: 3,
      message: 'Title must be at least 3 characters'
    },
    maxLength: {
      value: 100,
      message: 'Title cannot exceed 100 characters'
    }
  },
  description: {
    maxLength: {
      value: 500,
      message: 'Description cannot exceed 500 characters'
    }
  },
  contentType: {
    required: 'Content type is required'
  },
  file: {
    required: 'File is required',
    validate: {
      fileSize: file => {
        if (!file || !file[0]) return true
        const maxSizeMB = 50
        const fileSizeGB = file[0].size / 1024 / 1024
        return fileSizeGB < maxSizeMB || `File size must be less than ${maxSizeMB}MB`
      },
      fileType: file => {
        if (!file || !file[0]) return true
        const allowedTypes = [
          'application/pdf',
          'video/mp4',
          'video/quicktime',
          'audio/mpeg',
          'audio/wav',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ]
        return allowedTypes.includes(file[0].type) || 'File type is not allowed'
      }
    }
  }
}

/**
 * Reporting Form Validation
 */
export const reportingValidation = {
  reportType: {
    required: 'Report type is required'
  },
  branchId: {
    required: 'Branch selection is required'
  },
  startDate: {
    required: 'Start date is required',
    validate: {
      isValidDate: value => {
        if (!value) return 'Start date is required'
        const date = new Date(value)
        return !isNaN(date.getTime()) || 'Invalid date format'
      }
    }
  },
  endDate: {
    required: 'End date is required',
    validate: {
      isValidDate: value => {
        if (!value) return 'End date is required'
        const date = new Date(value)
        return !isNaN(date.getTime()) || 'Invalid date format'
      },
      isAfterStart: (value, formValues) => {
        if (!value || !formValues.startDate) return true
        const startDate = new Date(formValues.startDate)
        const endDate = new Date(value)
        return endDate > startDate || 'End date must be after start date'
      }
    }
  },
  format: {
    required: 'Export format is required'
  },
  includeCharts: {
    // Optional field
  }
}

/**
 * Validation error messages
 */
export const validationMessages = {
  required: 'This field is required',
  minLength: 'This field is too short',
  maxLength: 'This field is too long',
  pattern: 'This field has an invalid format',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  dateRange: 'End date must be after start date',
  fileSize: 'File size exceeds maximum allowed',
  fileType: 'File type is not supported'
}

/**
 * Custom validation functions
 */
export const customValidators = {
  /**
   * Validate email
   */
  isValidEmail: email => {
    return EMAIL_REGEX.test(email)
  },

  /**
   * Validate URL
   */
  isValidUrl: url => {
    return URL_REGEX.test(url)
  },

  /**
   * Validate password strength
   */
  isStrongPassword: password => {
    if (!password) return false
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    const isLongEnough = password.length >= 8

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough
  },

  /**
   * Validate date range
   */
  isValidDateRange: (startDate, endDate) => {
    if (!startDate || !endDate) return false
    const start = new Date(startDate)
    const end = new Date(endDate)
    return end > start
  },

  /**
   * Validate phone number
   */
  isValidPhoneNumber: phone => {
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/
    return phoneRegex.test(phone)
  },

  /**
   * Validate file size (in MB)
   */
  isValidFileSize: (file, maxSizeMB) => {
    if (!file) return true
    const fileSizeMB = file.size / 1024 / 1024
    return fileSizeMB <= maxSizeMB
  },

  /**
   * Validate file type
   */
  isValidFileType: (file, allowedTypes) => {
    if (!file) return true
    return allowedTypes.includes(file.type)
  },

  /**
   * Validate required field
   */
  isRequired: value => {
    if (typeof value === 'string') return value.trim().length > 0
    if (Array.isArray(value)) return value.length > 0
    return value !== null && value !== undefined && value !== ''
  }
}

/**
 * Get validation error message
 */
export const getValidationErrorMessage = (fieldName, error) => {
  if (!error) return ''

  if (error.type === 'required') {
    return validationMessages.required
  }

  if (error.type === 'minLength') {
    return error.message || validationMessages.minLength
  }

  if (error.type === 'maxLength') {
    return error.message || validationMessages.maxLength
  }

  if (error.type === 'pattern') {
    return error.message || validationMessages.pattern
  }

  if (error.type === 'validate') {
    return error.message || 'Validation failed'
  }

  return error.message || 'Invalid input'
}

/**
 * Validation error formatter
 */
export const formatValidationErrors = errors => {
  const formattedErrors = {}

  Object.keys(errors).forEach(fieldName => {
    const error = errors[fieldName]
    formattedErrors[fieldName] = getValidationErrorMessage(fieldName, error)
  })

  return formattedErrors
}

export default {
  messagingValidation,
  announcementsValidation,
  courseContentValidation,
  reportingValidation,
  validationMessages,
  customValidators,
  getValidationErrorMessage,
  formatValidationErrors
}
