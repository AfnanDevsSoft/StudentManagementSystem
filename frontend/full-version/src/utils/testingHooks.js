/**
 * Testing Hooks Utility
 * Provides custom React hooks for testing and performance optimization
 */

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

/**
 * Hook to measure component render time
 * Useful for performance analysis
 *
 * @param {string} componentName - Name of component being measured
 * @returns {object} Performance metrics
 */
export const usePerformanceMetrics = (componentName = 'Component') => {
  const renderStartRef = useRef(Date.now())
  const renderEndRef = useRef(null)

  useEffect(() => {
    renderEndRef.current = Date.now()
    const renderTime = renderEndRef.current - renderStartRef.current

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered in ${renderTime}ms`)
    }
  }, [componentName])

  return {
    renderTime: renderEndRef.current ? renderEndRef.current - renderStartRef.current : 0
  }
}

/**
 * Hook to monitor Redux state changes
 * Helps track state mutations and updates
 *
 * @param {string} sliceName - Name of Redux slice to monitor
 * @returns {object} Current state and change history
 */
export const useReduxStateMonitor = sliceName => {
  const state = useSelector(state => state[sliceName])
  const stateHistoryRef = useRef([])

  useEffect(() => {
    stateHistoryRef.current.push({
      timestamp: new Date().toISOString(),
      state: JSON.parse(JSON.stringify(state))
    })

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Redux Monitor] ${sliceName} updated:`, state)
    }
  }, [state, sliceName])

  return {
    currentState: state,
    stateHistory: stateHistoryRef.current
  }
}

/**
 * Hook to track API call performance
 * Measures time from dispatch to data availability
 *
 * @param {string} label - Label for the API call
 * @returns {object} API metrics
 */
export const useAPIPerformanceTracker = (label = 'API Call') => {
  const startTimeRef = useRef(null)
  const metricsRef = useRef({})

  const startTracking = useCallback(() => {
    startTimeRef.current = Date.now()
  }, [])

  const endTracking = useCallback(() => {
    if (startTimeRef.current) {
      const duration = Date.now() - startTimeRef.current
      metricsRef.current = {
        label,
        duration,
        timestamp: new Date().toISOString()
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`[API Performance] ${label}: ${duration}ms`)
      }
    }
  }, [label])

  return {
    startTracking,
    endTracking,
    metrics: metricsRef.current
  }
}

/**
 * Hook to prevent unnecessary re-renders
 * Memoizes values and callbacks
 *
 * @param {function} callback - Function to memoize
 * @param {array} deps - Dependencies array
 * @returns {function} Memoized callback
 */
export const useMemoizedCallback = (callback, deps = []) => {
  return useCallback(callback, deps)
}

/**
 * Hook to manage component error state
 * Provides error handling utilities
 *
 * @param {string} componentName - Name of component
 * @returns {object} Error state and handlers
 */
export const useErrorHandler = (componentName = 'Component') => {
  const [error, setError] = React.useState(null)
  const [errorCount, setErrorCount] = React.useState(0)

  const handleError = useCallback(
    (err, context = '') => {
      const errorMessage = err?.message || err?.toString() || 'Unknown error'

      console.error(`[Error] ${componentName} - ${context}:`, errorMessage)

      setError({
        message: errorMessage,
        context,
        timestamp: new Date().toISOString()
      })

      setErrorCount(prev => prev + 1)
    },
    [componentName]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    errorCount,
    handleError,
    clearError,
    hasError: !!error
  }
}

/**
 * Hook to debounce state updates
 * Prevents rapid state changes
 *
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} Debounced value
 */
export const useDebouncedValue = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook to throttle function calls
 * Limits function execution frequency
 *
 * @param {function} callback - Function to throttle
 * @param {number} delay - Delay between calls in milliseconds
 * @returns {function} Throttled function
 */
export const useThrottledCallback = (callback, delay = 1000) => {
  const lastRunRef = useRef(Date.now())

  return useCallback(
    (...args) => {
      const now = Date.now()
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now
        callback(...args)
      }
    },
    [callback, delay]
  )
}

/**
 * Hook to track component mount/unmount
 * Useful for debugging component lifecycle
 *
 * @param {string} componentName - Name of component
 */
export const useComponentLifecycle = (componentName = 'Component') => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Lifecycle] ${componentName} mounted`)
    }

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Lifecycle] ${componentName} unmounted`)
      }
    }
  }, [componentName])
}

/**
 * Hook to monitor component re-renders
 * Logs why component re-renders
 *
 * @param {string} componentName - Name of component
 * @param {object} dependencies - Dependencies object to track
 */
export const useRenderTracker = (componentName = 'Component', dependencies = {}) => {
  const prevDepsRef = useRef()

  useEffect(() => {
    if (prevDepsRef.current) {
      const changed = Object.keys(dependencies).filter(key => dependencies[key] !== prevDepsRef.current[key])

      if (changed.length > 0 && process.env.NODE_ENV === 'development') {
        console.log(`[Render] ${componentName} re-rendered due to:`, changed)
      }
    }

    prevDepsRef.current = dependencies
  }, [componentName, dependencies])
}

/**
 * Hook to manage async data loading
 * Handles loading, error, and success states
 *
 * @param {function} asyncFunction - Async function to execute
 * @param {array} deps - Dependencies array
 * @returns {object} Loading state, data, error, and refetch function
 */
export const useAsync = (asyncFunction, deps = []) => {
  const [state, setState] = React.useState({
    loading: false,
    data: null,
    error: null
  })

  const refetch = useCallback(async () => {
    setState({ loading: true, data: null, error: null })
    try {
      const result = await asyncFunction()
      setState({ loading: false, data: result, error: null })
    } catch (error) {
      setState({ loading: false, data: null, error: error.message })
    }
  }, [asyncFunction])

  useEffect(() => {
    refetch()
  }, deps)

  return { ...state, refetch }
}

/**
 * Hook to manage localStorage persistence
 *
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value if not in storage
 * @returns {array} [value, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    value => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error)
      }
    },
    [key, storedValue]
  )

  return [storedValue, setValue]
}

// Add React import for hooks
import React from 'react'
