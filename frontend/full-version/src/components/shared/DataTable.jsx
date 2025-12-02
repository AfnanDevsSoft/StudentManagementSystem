'use client'

import { useMemo } from 'react'

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  TableSortLabel,
  Paper,
  Box,
  CircularProgress,
  Typography,
  Checkbox
} from '@mui/material'

/**
 * Reusable DataTable Component
 * Supports pagination, sorting, selection, and custom rendering
 */
export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  onSort = null,
  onPageChange = null,
  onRowsPerPageChange = null,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onSelectionChange = null,
  selectedRows = [],
  isSelectable = false,
  striped = true,
  hover = true,
  dense = false
}) {
  const handleSort = columnId => {
    if (onSort) {
      onSort(columnId)
    }
  }

  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage)
    }
  }

  const handleChangeRowsPerPage = event => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(event.target.value, 10))
    }
  }

  const handleSelectAll = event => {
    if (onSelectionChange) {
      if (event.target.checked) {
        onSelectionChange(rows.map(row => row.id))
      } else {
        onSelectionChange([])
      }
    }
  }

  const handleSelectRow = rowId => {
    if (onSelectionChange) {
      const newSelected = selectedRows.includes(rowId)
        ? selectedRows.filter(id => id !== rowId)
        : [...selectedRows, rowId]

      onSelectionChange(newSelected)
    }
  }

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='300px'>
        <CircularProgress />
      </Box>
    )
  }

  if (!rows || rows.length === 0) {
    return (
      <Paper>
        <Box p={3} textAlign='center'>
          <Typography variant='body2' color='textSecondary'>
            No data available
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper>
      <TableContainer>
        <Table size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              {isSelectable && (
                <TableCell padding='checkbox'>
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                    checked={rows.length > 0 && selectedRows.length === rows.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sortDirection={column.sortDirection || false}
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    minWidth: column.minWidth || 'auto'
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={column.sortActive || false}
                      direction={column.sortDirection || 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={row.id || index}
                hover={hover}
                selected={selectedRows.includes(row.id)}
                sx={{
                  backgroundColor: striped && index % 2 !== 0 ? '#fafafa' : 'white',
                  '&:hover': hover ? { backgroundColor: '#f0f0f0' } : {}
                }}
              >
                {isSelectable && (
                  <TableCell padding='checkbox'>
                    <Checkbox checked={selectedRows.includes(row.id)} onChange={() => handleSelectRow(row.id)} />
                  </TableCell>
                )}
                {columns.map(column => (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    {column.render ? column.render(row[column.id], row) : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {totalRows > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component='div'
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  )
}
