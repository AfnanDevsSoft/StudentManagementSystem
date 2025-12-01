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
  Chip,
  CircularProgress,
  Box,
  TextField,
  Stack,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import VisibilityIcon from '@mui/icons-material/Visibility'
import apiService from '@/services/api'
import TeacherForm from './TeacherForm'

const TeacherListTable = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [formMode, setFormMode] = useState('view')
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [teacherToDelete, setTeacherToDelete] = useState(null)

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true)
        const response = await apiService.getTeachers(page, 20, searchTerm)
        setTeachers(response.data || [])
      } catch (error) {
        console.error('Failed to fetch teachers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeachers()
  }, [page, searchTerm])

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setFormMode('view')
    setOpenDialog(true)
  }

  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setFormMode('edit')
    setOpenFormDialog(true)
  }

  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (teacherToDelete) {
      try {
        await apiService.deleteTeacher(teacherToDelete.id)
        setTeachers(teachers.filter(t => t.id !== teacherToDelete.id))
        setDeleteConfirmOpen(false)
        setTeacherToDelete(null)
      } catch (error) {
        console.error('Failed to delete teacher:', error)
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'edit' && selectedTeacher) {
        await apiService.updateTeacher(selectedTeacher.id, formData)
        setTeachers(teachers.map(t => (t.id === selectedTeacher.id ? { ...t, ...formData } : t)))
      }
      setOpenFormDialog(false)
      setSelectedTeacher(null)
    } catch (error) {
      console.error('Failed to update teacher:', error)
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
            placeholder="Search teachers..."
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
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <TableRow key={teacher.id} hover>
                      <TableCell>{`${teacher.first_name} ${teacher.last_name}`}</TableCell>
                      <TableCell>{teacher.email || 'N/A'}</TableCell>
                      <TableCell>{teacher.phone || 'N/A'}</TableCell>
                      <TableCell>{teacher.designation || 'N/A'}</TableCell>
                      <TableCell>{teacher.years_experience || 0} years</TableCell>
                      <TableCell>{teacher.personal_address || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleViewTeacher(teacher)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditTeacher(teacher)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(teacher)}
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
                      No teachers found
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
        <DialogTitle>Teacher Details</DialogTitle>
        <DialogContent>
          {selectedTeacher && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <div>
                <strong>Name:</strong> {selectedTeacher.first_name} {selectedTeacher.last_name}
              </div>
              <div>
                <strong>Email:</strong> {selectedTeacher.email || 'N/A'}
              </div>
              <div>
                <strong>Phone:</strong> {selectedTeacher.phone || 'N/A'}
              </div>
              <div>
                <strong>Designation:</strong> {selectedTeacher.designation || 'N/A'}
              </div>
              <div>
                <strong>Qualification:</strong> {selectedTeacher.qualification || 'N/A'}
              </div>
              <div>
                <strong>Experience:</strong> {selectedTeacher.years_experience || 0} years
              </div>
              <div>
                <strong>Address:</strong> {selectedTeacher.personal_address || 'N/A'}
              </div>
              <div>
                <strong>Employment Type:</strong> {selectedTeacher.employment_type || 'N/A'}
              </div>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form Dialog */}
      <TeacherForm
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        teacher={selectedTeacher}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this teacher?
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

export default TeacherListTable
