/**
 * FormCard Component
 * Reusable card wrapper for forms
 * Provides consistent styling and layout for form sections
 */

'use client'

import { Card, CardContent, CardHeader, Divider, Stack } from '@mui/material'

/**
 * FormCard Component
 * @param {string} title - Card title
 * @param {string} subtitle - Card subtitle
 * @param {ReactNode} children - Form content
 * @param {Function} onSubmit - Form submit handler
 * @param {string} submitButtonText - Submit button text
 * @param {boolean} loading - Loading state
 */
export default function FormCard({
  title = '',
  subtitle = '',
  children,
  onSubmit = null,
  submitButtonText = 'Submit',
  loading = false,
  showDivider = true,
  sx = {}
}) {
  return (
    <Card sx={{ ...sx }}>
      {title && (
        <>
          <CardHeader
            title={title}
            subheader={subtitle}
            titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600 } }}
          />
          {showDivider && <Divider />}
        </>
      )}

      <CardContent>
        <Stack spacing={2}>{children}</Stack>
      </CardContent>
    </Card>
  )
}
