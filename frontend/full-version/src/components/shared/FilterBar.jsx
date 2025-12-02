'use client'

import { useState } from 'react'

import { Box, TextField, Button, Stack, MenuItem, CircularProgress } from '@mui/material'

/**
 * Reusable FilterBar Component
 * Provides filter inputs and search functionality
 */
export default function FilterBar({
  filters = [],
  onFilterChange = null,
  onSearch = null,
  onReset = null,
  loading = false,
  compact = false,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showReset = true
}) {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState({})

  const handleSearchChange = event => {
    const value = event.target.value

    setSearchValue(value)

    if (onSearch) {
      onSearch(value)
    }
  }

  const handleFilterChange = (filterId, value) => {
    const newFilterValues = {
      ...filterValues,
      [filterId]: value
    }

    setFilterValues(newFilterValues)

    if (onFilterChange) {
      onFilterChange(filterId, value)
    }
  }

  const handleReset = () => {
    setSearchValue('')
    setFilterValues({})

    if (onReset) {
      onReset()
    }
  }

  const hasActiveFilters = searchValue || Object.values(filterValues).some(v => v !== '' && v !== null)

  return (
    <Box
      sx={{
        p: compact ? 1.5 : 2,
        backgroundColor: '#fafafa',
        borderRadius: 1,
        border: '1px solid #e0e0e0'
      }}
    >
      <Stack spacing={compact ? 1 : 2}>
        {showSearch && (
          <TextField
            size={compact ? 'small' : 'medium'}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            disabled={loading}
            fullWidth
            variant='outlined'
            sx={{
              backgroundColor: 'white'
            }}
          />
        )}

        {filters.length > 0 && (
          <Stack
            direction='row'
            spacing={compact ? 1 : 2}
            sx={{
              flexWrap: 'wrap',
              gap: compact ? 1 : 2
            }}
          >
            {filters.map(filter => (
              <TextField
                key={filter.id}
                size={compact ? 'small' : 'medium'}
                label={filter.label}
                type={filter.type || 'text'}
                value={filterValues[filter.id] || ''}
                onChange={e => handleFilterChange(filter.id, e.target.value)}
                disabled={loading}
                select={filter.options !== undefined}
                variant='outlined'
                sx={{
                  minWidth: filter.minWidth || '150px',
                  backgroundColor: 'white'
                }}
              >
                {filter.options &&
                  filter.options.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
              </TextField>
            ))}
          </Stack>
        )}

        {(showReset || loading) && (
          <Stack direction='row' spacing={1} justifyContent='flex-end'>
            {hasActiveFilters && showReset && (
              <Button size='small' variant='outlined' onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            )}
            {loading && <CircularProgress size={24} />}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
