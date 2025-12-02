/**
 * CustomDatePicker Component
 * Reusable date picker component
 * Supports single date, date range, and custom formatting
 */

'use client'

import { Stack, TextField } from '@mui/material'

/**
 * CustomDatePicker Component
 * @param {string} label - Label text
 * @param {string} value - Selected date (YYYY-MM-DD format)
 * @param {Function} onChange - Change handler
 * @param {string} type - 'date', 'datetime-local', 'month', 'time'
 * @param {boolean} disabled - Disabled state
 * @param {string} minDate - Minimum date (YYYY-MM-DD)
 * @param {string} maxDate - Maximum date (YYYY-MM-DD)
 * @param {boolean} rangeMode - Enable date range mode
 */
export default function CustomDatePicker({
  label = 'Select Date',
  value = '',
  onChange = null,
  type = 'date',
  disabled = false,
  minDate = null,
  maxDate = null,
  rangeMode = false,
  startDate = '',
  endDate = '',
  onStartDateChange = null,
  onEndDateChange = null,
  required = false,
  error = false,
  helperText = '',
  format = null
}) {
  // Single date picker
  if (!rangeMode) {
    return (
      <TextField
        fullWidth
        label={label}
        type={type}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        error={error}
        helperText={helperText}
        inputProps={{
          min: minDate,
          max: maxDate
        }}
        InputLabelProps={{
          shrink: true
        }}
        variant="outlined"
      />
    )
  }

  // Date range picker
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="Start Date"
        type={type}
        value={startDate}
        onChange={e => onStartDateChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        error={error}
        inputProps={{
          min: minDate,
          max: endDate || maxDate
        }}
        InputLabelProps={{
          shrink: true
        }}
        variant="outlined"
      />
      <TextField
        fullWidth
        label="End Date"
        type={type}
        value={endDate}
        onChange={e => onEndDateChange?.(e.target.value)}
        disabled={disabled}
        required={required}
        error={error}
        helperText={helperText}
        inputProps={{
          min: startDate || minDate,
          max: maxDate
        }}
        InputLabelProps={{
          shrink: true
        }}
        variant="outlined"
      />
    </Stack>
  )
}
