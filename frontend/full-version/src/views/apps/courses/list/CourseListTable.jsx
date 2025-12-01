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
import CourseForm from './CourseForm'

const CourseListTable = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [openFormDialog, setOpenFormDialog] = useState(false)
  const [formMode, setFormMode] = useState('view')
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await apiService.getCourses(page, 20, searchTerm)
        setCourses(response.data || [])
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [page, searchTerm])

  const handleViewCourse = (course) => {
    setSelectedCourse(course)
    setFormMode('view')
    setOpenDialog(true)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setFormMode('edit')
    setOpenFormDialog(true)
  }

  const handleDeleteClick = (course) => {
    setCourseToDelete(course)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (courseToDelete) {
      try {
        await apiService.deleteCourse(courseToDelete.id)
        setCourses(courses.filter(c => c.id !== courseToDelete.id))
        setDeleteConfirmOpen(false)
        setCourseToDelete(null)
      } catch (error) {
        console.error('Failed to delete course:', error)
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (formMode === 'edit' && selectedCourse) {
        await apiService.updateCourse(selectedCourse.id, formData)
        setCourses(courses.map(c => (c.id === selectedCourse.id ? { ...c, ...formData } : c)))
      }
      setOpenFormDialog(false)
      setSelectedCourse(null)
    } catch (error) {
      console.error('Failed to update course:', error)
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
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
          />
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Course Name</TableCell>
                  <TableCell>Course Code</TableCell>
                  <TableCell>Credit Hours</TableCell>
                  <TableCell>Grade Level</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <TableRow key={course.id} hover>
                      <TableCell>{course.course_name}</TableCell>
                      <TableCell>{course.course_code || 'N/A'}</TableCell>
                      <TableCell>{course.credit_hours || 'N/A'}</TableCell>
                      <TableCell>{course.grade_level_id || 'N/A'}</TableCell>
                      <TableCell>{course.start_date ? new Date(course.start_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{course.end_date ? new Date(course.end_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleViewCourse(course)}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditCourse(course)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(course)}
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
                      No courses found
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
        <DialogTitle>Course Details</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <div>
                <strong>Course Name:</strong> {selectedCourse.course_name}
              </div>
              <div>
                <strong>Course Code:</strong> {selectedCourse.course_code || 'N/A'}
              </div>
              <div>
                <strong>Credit Hours:</strong> {selectedCourse.credit_hours || 'N/A'}
              </div>
              <div>
                <strong>Description:</strong> {selectedCourse.description || 'N/A'}
              </div>
              <div>
                <strong>Start Date:</strong> {selectedCourse.start_date ? new Date(selectedCourse.start_date).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <strong>End Date:</strong> {selectedCourse.end_date ? new Date(selectedCourse.end_date).toLocaleDateString() : 'N/A'}
              </div>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form Dialog */}
      <CourseForm
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        course={selectedCourse}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this course?
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

export default CourseListTable
