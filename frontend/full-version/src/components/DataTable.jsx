/**
 * DataTable Component
 * Reusable data table with sorting, pagination, and filtering
 * Used across all portals for displaying tabular data
 */

'use client'

import { useState, useMemo } from 'react'

import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material'

/**
 * DataTable Component
 * @param {Array} columns - Column definitions [{ id, label, align, format }]
 * @param {Array} data - Table data
 * @param {Function} onRowClick - Row click handler
 * @param {boolean} loading - Loading state
 * @param {number} rowsPerPageOptions - Rows per page options
 * @param {string} emptyMessage - Empty state message
 */
export default function DataTable({
  columns = [],
  data = [],
  onRowClick = null,
  loading = false,
  rowsPerPageOptions = [5, 10, 25],
  emptyMessage = 'No data available',
  selectable = false,
  onSelectRows = null
}) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] || 10)
  const [orderBy, setOrderBy] = useState('')
  const [order, setOrder] = useState('asc')
  const [selectedRows, setSelectedRows] = useState([])

  // Handle sort
  const handleSort = columnId => {
    const isAsc = orderBy === columnId && order === 'asc'

    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(columnId)
  }

  // Sort and paginate data
  const processedData = useMemo(() => {
    let sorted = [...data]

    if (orderBy) {
      sorted.sort((a, b) => {
        const aValue = a[orderBy]
        const bValue = b[orderBy]

        if (aValue < bValue) {
          return order === 'asc' ? -1 : 1
        }

        if (aValue > bValue) {
          return order === 'asc' ? 1 : -1
        }

        return 0
      })
    }

    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  }, [data, page, rowsPerPage, orderBy, order])

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Handle row selection
  const handleSelectRow = (rowIndex, rowData) => {
    const newSelected = selectedRows.includes(rowIndex)
      ? selectedRows.filter(i => i !== rowIndex)
      : [...selectedRows, rowIndex]

    setSelectedRows(newSelected)
    onSelectRows?.(newSelected, data[rowIndex])
  }

  const handleSelectAll = event => {
    if (event.target.checked) {
      const newSelected = processedData.map((_, index) => page * rowsPerPage + index)

      setSelectedRows(newSelected)
    } else {
      setSelectedRows([])
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <Typography variant="body2" color="textSecondary">
          {emptyMessage}
        </Typography>
      </Box>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} stickyHeader>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            {selectable && (
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  indeterminate={selectedRows.length > 0 && selectedRows.length < processedData.length}
                  checked={selectedRows.length === processedData.length && processedData.length > 0}
                  onChange={handleSelectAll}
                />
              </TableCell>
            )}
            {columns.map(column => (
              <TableCell key={column.id} align={column.align || 'left'} sx={{ fontWeight: 600 }}>
                {column.sortable !== false ? (
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
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
          {processedData.map((row, index) => (
            <TableRow
              key={index}
              onClick={() => onRowClick?.(row)}
              sx={{
                cursor: onRowClick ? 'pointer' : 'default',
                '&:hover': onRowClick ? { backgroundColor: '#f9f9f9' } : {},
                backgroundColor:
                  selectable && selectedRows.includes(page * rowsPerPage + index) ? '#e3f2fd' : ''
              }}
            >
              {selectable && (
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(page * rowsPerPage + index)}
                    onChange={() => handleSelectRow(page * rowsPerPage + index, row)}
                    onClick={e => e.stopPropagation()}
                  />
                </TableCell>
              )}
              {columns.map(column => (
                <TableCell key={column.id} align={column.align || 'left'}>
                  {column.format ? column.format(row[column.id], row) : row[column.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  )
}
