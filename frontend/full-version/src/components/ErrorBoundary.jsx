'use client'

import React from 'react'
import { Box, Card, CardContent, Typography, Button, Alert, Stack } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

/**
 * ErrorBoundary Component
 * Catches errors in child components and displays a fallback UI
 * Prevents entire app from crashing due to component errors
 *
 * @param {React.ReactNode} children - Child components to render
 * @param {string} fallback - Custom fallback message (optional)
 * @param {function} onError - Callback when error occurs (optional)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }))

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service (e.g., Sentry) in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Error logged to monitoring service:', error.message)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ErrorOutlineIcon sx={{ fontSize: 32, color: 'error.main', mr: 2 }} />
                <Typography variant='h5' color='error.main' sx={{ fontWeight: 600 }}>
                  Something Went Wrong
                </Typography>
              </Box>

              {/* Error Message */}
              <Alert severity='error' sx={{ mb: 2 }}>
                {this.props.fallback || 'An unexpected error occurred while loading this component.'}
              </Alert>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace' }}>
                    <Typography variant='caption' component='div' sx={{ color: 'error.main', mb: 1 }}>
                      Error: {this.state.error.toString()}
                    </Typography>
                    <Typography
                      variant='caption'
                      component='div'
                      sx={{
                        color: 'text.secondary',
                        maxHeight: '150px',
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {this.state.errorInfo?.componentStack}
                    </Typography>
                  </Box>
                  <Typography variant='caption' color='warning.main'>
                    Error Count: {this.state.errorCount}
                  </Typography>
                </Stack>
              )}

              {/* Action Buttons */}
              <Stack direction='row' spacing={1}>
                <Button variant='contained' color='primary' onClick={this.handleReset} fullWidth>
                  Try Again
                </Button>
                <Button variant='outlined' color='primary' onClick={() => (window.location.href = '/')} fullWidth>
                  Go Home
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
