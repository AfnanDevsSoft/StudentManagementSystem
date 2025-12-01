'use client'

import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
  TextField,
  Stack,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import apiService from '@/services/api'
import BranchForm from './BranchForm'

const BranchListTable = () => {
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [formMode, setFormMode] = useState('view')
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState(null)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true)
        const response = await apiService.getBranches(page, 20, searchTerm)
        setBranches(response.data || [])
      } catch (error) {
        console.error('Failed to fetch branches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [page, searchTerm])

  const handleViewBranch = (branch) => {
    setSelectedBranch(branch)
    setFormMode('view')
    setOpenDialog(true)
  }

  const handleEditBranch = (branch) => {
    setSelectedBranch(branch)
    setFormMode('edit')
    setOpenFormDialog(true)
  }

  const handleDeleteClick = (branch) => {
    setBranchToDelete(branch)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (branchToDelete) {
      try {
        await apiService.deleteBranch(branchToDelete.id)
        setBranches(branches.filter(b => b.id !== branchToDelete.id))
        setDeleteConfirmOpen(false)
        setBranchToDelete(null)
      } catch (error) {
        console.error('Failed to delete branch:', error)
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'edit' && selectedBranch) {
        await apiService.updateBranch(selectedBranch.id, formData)
        setBranches(branches.map(b => (b.id === selectedBranch.id ? { ...b, ...formData } : b)))
      }
      setOpenFormDialog(false)
      setSelectedBranch(null)
    } catch (error) {
      console.error('Failed to update branch:', error)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Paper>
        <Stack p={2} spacing={2}>
          <TextField
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
          />
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Principal</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches.length > 0 ? (
                  branches.map((branch) => (
                    <TableRow key={branch.id} hover>
                      <TableCell>{branch.name || 'N/A'}</TableCell>
                      <TableCell>{branch.code || 'N/A'}</TableCell>
                      <TableCell>{branch.city || 'N/A'}</TableCell>
                      <TableCell>{branch.phone || 'N/A'}</TableCell>
                      <TableCell>{branch.email || 'N/A'}</TableCell>
                      <TableCell>{branch.principal_name || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleViewBranch(branch)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditBranch(branch)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(branch)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No branches found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      {/* View Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Branch Details</DialogTitle>
        <DialogContent>
          {selectedBranch && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <div>
                <strong>Name:</strong> {selectedBranch.name || 'N/A'}
              </div>
              <div>
                <strong>Code:</strong> {selectedBranch.code || 'N/A'}
              </div>
              <div>
                <strong>Address:</strong> {selectedBranch.address || 'N/A'}
              </div>
              <div>
                <strong>City:</strong> {selectedBranch.city || 'N/A'}
              </div>
              <div>
                <strong>State:</strong> {selectedBranch.state || 'N/A'}
              </div>
              <div>
                <strong>Country:</strong> {selectedBranch.country || 'N/A'}
              </div>
              <div>
                <strong>Phone:</strong> {selectedBranch.phone || 'N/A'}
              </div>
              <div>
                <strong>Email:</strong> {selectedBranch.email || 'N/A'}
              </div>
              <div>
                <strong>Principal:</strong> {selectedBranch.principal_name || 'N/A'}
              </div>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form Dialog */}
      <BranchForm
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        branch={selectedBranch}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this branch?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default BranchListTable
