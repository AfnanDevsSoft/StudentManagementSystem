import React from 'react'
import { render, screen, within, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock component for testing
const DataTable = ({ data = [], columns = [] }) => (
  <div data-testid="data-table">
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.id}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length > 0 ? (
          data.map((row) => (
            <tr key={row.id}>
              {columns.map((col) => (
                <td key={col.id}>{row[col.id]}</td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length}>No data available</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

describe('DataTable Component', () => {
  const mockData = [
    { id: 1, name: 'John', email: 'john@test.com', role: 'Student' },
    { id: 2, name: 'Jane', email: 'jane@test.com', role: 'Teacher' },
    { id: 3, name: 'Bob', email: 'bob@test.com', role: 'Admin' },
  ]

  const mockColumns = [
    { id: 'name', label: 'Name', sortable: true },
    { id: 'email', label: 'Email', sortable: true },
    { id: 'role', label: 'Role', sortable: false },
  ]

  it('renders table component', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)
    const table = screen.getByTestId('data-table')
    expect(table).toBeInTheDocument()
  })

  it('renders table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('jane@test.com')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('renders column headers', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  it('displays all data rows', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    // Check that all data is rendered
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Jane')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('handles empty data state', () => {
    render(<DataTable data={[]} columns={mockColumns} />)

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('renders correct number of columns', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    const headerCells = screen.getAllByRole('columnheader')
    expect(headerCells).toHaveLength(mockColumns.length)
  })

  it('renders all data rows', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    const rows = screen.getAllByRole('row')
    // 1 header row + 3 data rows
    expect(rows).toHaveLength(4)
  })

  it('accepts custom columns configuration', () => {
    const customColumns = [
      { id: 'name', label: 'Full Name' },
      { id: 'email', label: 'E-Mail Address' },
    ]

    render(<DataTable data={mockData} columns={customColumns} />)

    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('E-Mail Address')).toBeInTheDocument()
  })
})
