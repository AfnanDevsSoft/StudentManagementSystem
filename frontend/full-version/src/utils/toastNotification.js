/**
 * Toast Notification System
 * Provides toast notifications for success, error, warning, and info messages
 */

import React from 'react'
import { Alert, Box, IconButton, Snackbar } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

/**
 * Toast service using HTML5 notification or console fallback
 */
class ToastService {
  constructor() {
    this.activeNotifications = new Set()
    this.notificationQueue = []
  }

  /**
   * Show notification
   */
  notify(message, type = 'info', duration = 6000, actionCallback = null) {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      type,
      duration,
      actionCallback
    }

    this.activeNotifications.add(notification)

    // Dispatch custom event for UI components to listen to
    window.dispatchEvent(
      new CustomEvent('toast-notification', {
        detail: notification
      })
    )

    console.log(`[${type.toUpperCase()}] ${message}`)

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        this.activeNotifications.delete(notification)
      }, duration)
    }

    return notification.id
  }

  /**
   * Success notification
   */
  success(message, duration = 4000, actionCallback = null) {
    return this.notify(message, 'success', duration, actionCallback)
  }

  /**
   * Error notification
   */
  error(message, duration = 6000, actionCallback = null) {
    return this.notify(message, 'error', duration, actionCallback)
  }

  /**
   * Warning notification
   */
  warning(message, duration = 5000, actionCallback = null) {
    return this.notify(message, 'warning', duration, actionCallback)
  }

  /**
   * Info notification
   */
  info(message, duration = 4000, actionCallback = null) {
    return this.notify(message, 'info', duration, actionCallback)
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.activeNotifications.clear()
    window.dispatchEvent(new CustomEvent('toast-clear-all'))
  }

  /**
   * Remove specific notification
   */
  remove(notificationId) {
    for (const notification of this.activeNotifications) {
      if (notification.id === notificationId) {
        this.activeNotifications.delete(notification)
        break
      }
    }
    window.dispatchEvent(
      new CustomEvent('toast-remove', {
        detail: { id: notificationId }
      })
    )
  }
}

export const toastService = new ToastService()

/**
 * Hook to use toast notifications in components
 */
export const useToast = () => {
  const [notifications, setNotifications] = React.useState([])

  React.useEffect(() => {
    const handleNotification = event => {
      const notification = event.detail
      setNotifications(prev => [...prev, notification])
    }

    const handleRemove = event => {
      const { id } = event.detail
      setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const handleClearAll = () => {
      setNotifications([])
    }

    window.addEventListener('toast-notification', handleNotification)
    window.addEventListener('toast-remove', handleRemove)
    window.addEventListener('toast-clear-all', handleClearAll)

    return () => {
      window.removeEventListener('toast-notification', handleNotification)
      window.removeEventListener('toast-remove', handleRemove)
      window.removeEventListener('toast-clear-all', handleClearAll)
    }
  }, [])

  return {
    notifications,
    success: (message, duration, callback) => toastService.success(message, duration, callback),
    error: (message, duration, callback) => toastService.error(message, duration, callback),
    warning: (message, duration, callback) => toastService.warning(message, duration, callback),
    info: (message, duration, callback) => toastService.info(message, duration, callback),
    remove: id => toastService.remove(id),
    clearAll: () => toastService.clearAll()
  }
}

/**
 * Toast Container Component
 * Renders all active toast notifications
 */
export const ToastContainer = () => {
  const { notifications, remove } = useToast()

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.duration}
          onClose={() => remove(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          style={{ top: `${20 + index * 100}px` }}
        >
          <Alert
            onClose={() => remove(notification.id)}
            severity={notification.type}
            variant='filled'
            action={
              <IconButton size='small' color='inherit' onClick={() => remove(notification.id)}>
                <CloseIcon fontSize='small' />
              </IconButton>
            }
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  )
}

export default {
  toastService,
  useToast,
  ToastContainer
}
