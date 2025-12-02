'use client'

import { Card, CardHeader, CardContent, Box, Button, Stack, CircularProgress } from '@mui/material'

/**
 * Reusable FormCard Component
 * Wraps form content with header and action buttons
 */
export default function FormCard({
  title = 'Form Title',
  subtitle = '',
  children = null,
  onSubmit = null,
  onCancel = null,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  loading = false,
  showActions = true,
  actionAlign = 'right',
  variant = 'outlined',
  elevation = 0,
  maxWidth = 'md',
  sx = {}
}) {
  const widthMap = {
    xs: '100%',
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px'
  }

  return (
    <Card
      variant={variant}
      elevation={elevation}
      sx={{
        maxWidth: widthMap[maxWidth] || maxWidth,
        width: '100%',
        ...sx
      }}
    >
      {(title || subtitle) && (
        <CardHeader
          title={title}
          subheader={subtitle}
          sx={{
            backgroundColor: '#f9f9f9',
            borderBottom: '1px solid #e0e0e0'
          }}
        />
      )}
      <CardContent>
        <Box component='form' onSubmit={onSubmit} noValidate>
          <Box sx={{ mb: showActions ? 3 : 0 }}>{children}</Box>

          {showActions && (
            <Stack
              direction='row'
              spacing={2}
              justifyContent={actionAlign === 'center' ? 'center' : actionAlign === 'left' ? 'flex-start' : 'flex-end'}
              sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}
            >
              {onCancel && (
                <Button
                  variant='outlined'
                  onClick={onCancel}
                  disabled={loading}
                  sx={{
                    minWidth: '100px'
                  }}
                >
                  {cancelLabel}
                </Button>
              )}
              {onSubmit && (
                <Button
                  variant='contained'
                  type='submit'
                  disabled={loading}
                  sx={{
                    minWidth: '100px',
                    position: 'relative'
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color='inherit' />
                      Loading...
                    </Box>
                  ) : (
                    submitLabel
                  )}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
