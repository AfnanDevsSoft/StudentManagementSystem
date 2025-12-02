/**
 * FilterBar Component
 * Reusable filter bar for data filtering
 * Supports text search, select filters, and date ranges
 */

'use client'

import { useState } from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, InputAdornment, MenuItem, Select, Stack, TextField } from '@mui/material'

/**
 * FilterBar Component
 * @param {Array} filters - Filter configuration
 * @param {Function} onFilter - Filter change handler
 * @param {Function} onClear - Clear filters handler
 * @param {string} searchPlaceholder - Search placeholder text
 */
export default function FilterBar({
  filters = [],
  onFilter = null,
  onClear = null,
  searchPlaceholder = 'Search...',
  showSearch = true,
  searchValue = '',
  onSearchChange = null
}) {
  const [filterValues, setFilterValues] = useState({})
  const [searchTerm, setSearchTerm] = useState(searchValue)

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    const newValues = { ...filterValues, [filterKey]: value }

    setFilterValues(newValues)
    onFilter?.(newValues)
  }

  // Handle search change
  const handleSearchChange = event => {
    const value = event.target.value

    setSearchTerm(value)
    onSearchChange?.(value)
  }

  // Handle clear all filters
  const handleClear = () => {
    setFilterValues({})
    setSearchTerm('')
    onClear?.()
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={2}>
        {/* Search Bar */}
        {showSearch && (
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            variant="outlined"
          />
        )}

        {/* Filter Fields */}
        {filters.length > 0 && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end" useFlexGap flexWrap="wrap">
            {filters.map(filter => (
              <Box key={filter.key} sx={{ minWidth: filter.width || 200 }}>
                {filter.type === 'select' ? (
                  <Select
                    fullWidth
                    size="small"
                    label={filter.label}
                    value={filterValues[filter.key] || ''}
                    onChange={e => handleFilterChange(filter.key, e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="">All {filter.label}</MenuItem>
                    {(filter.options || []).map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    label={filter.label}
                    type={filter.type || 'text'}
                    value={filterValues[filter.key] || ''}
                    onChange={e => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                  />
                )}
              </Box>
            ))}

            {/* Clear Button */}
            {(Object.keys(filterValues).length > 0 || searchTerm) && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon />}
                onClick={handleClear}
                sx={{ minWidth: 100 }}
              >
                Clear
              </Button>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
