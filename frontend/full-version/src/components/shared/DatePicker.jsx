'use client'

import { useState } from 'react'

import { Box, TextField, Button, Stack } from '@mui/material'

/**
 * Reusable DatePicker Component
 * Handles date selection with range support
 */
export default function DatePicker({
  value = null,
  onChange = null,
  label = 'Select Date',
  disabled = false,
  variant = 'outlined',
  size = 'medium',
  type = 'date',
  minDate = null,
  maxDate = null,
  required = false,
  error = false,
  helperText = '',
  fullWidth = true,
  clearable = true
}) {
  const handleChange = event => {
    const newValue = event.target.value

    if (onChange) {
      onChange(newValue)
    }
  }

  const handleClear = () => {
    if (onChange) {
      onChange(null)
    }
  }

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Stack direction='row' spacing={1} alignItems='flex-start'>
        <TextField
          type={type}
          label={label}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          variant={variant}
          size={size}
          required={required}
          error={error}
          helperText={helperText}
          fullWidth={fullWidth}
          inputProps={{
            min: minDate,
            max: maxDate
          }}
          sx={{
            flex: 1
          }}
        />
        {clearable && value && (
          <Button
            size={size}
            variant='outlined'
            onClick={handleClear}
            disabled={disabled}
            sx={{
              mt: 1
            }}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Box>
  )
}
