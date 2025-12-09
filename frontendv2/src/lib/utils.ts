import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistance, formatRelative } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Date formatting utilities
export const formatDate = (date: Date | string, formatStr: string = 'PPP') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, formatStr)
}

export const formatDateRelative = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatRelative(dateObj, new Date())
}

export const formatDateDistance = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatDistance(dateObj, new Date(), { addSuffix: true })
}

// Number formatting utilities
export const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount)
}

export const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
}

export const formatPercentage = (value: number, decimals: number = 1) => {
    return `${value.toFixed(decimals)}%`
}

// String utilities
export const truncate = (str: string, length: number = 50) => {
    if (str.length <= length) return str
    return str.slice(0, length) + '...'
}

export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

// Status badge color utilities
export const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
        paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        unpaid: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        enrolled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        graduated: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
        present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    }
    return statusColors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
}

// File size formatting
export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Validation utilities
export const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}
