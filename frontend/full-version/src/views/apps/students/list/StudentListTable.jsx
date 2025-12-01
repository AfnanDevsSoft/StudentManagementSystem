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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from '@mui/material'
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material'
import apiService from '@/services/api'
import StudentForm from './StudentForm'

const StudentListTable = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      const response = await apiService.getAllStudents({ page: 1, limit: 100 })
      setStudents(response.data || [])
    } catch (error) {
      console.error('Failed to load students:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (student) => {
    setSelectedStudent(student)
    setViewOpen(true)
  }

  const handleEdit = (student) => {
    setSelectedStudent(student)
    setEditOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await apiService.deleteStudent(id)
        loadStudents()
      } catch (error) {
        console.error('Failed to delete student:', error)
      }
    }
  }

  const handleEditSuccess = () => {
    setEditOpen(false)
    loadStudents()
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Code</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Gender</strong></TableCell>
              <TableCell><strong>Admission Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.student_code}</TableCell>
                <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.gender}</TableCell>
                <TableCell>{student.admission_status}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <IconButton
                      size="small"
                      onClick={() => handleView(student)}
                      title="View"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(student)}
                      title="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(student.id)}
                      title="Delete"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <div style={{ marginTop: '16px' }}>
              <p><strong>Code:</strong> {selectedStudent.student_code}</p>
              <p><strong>Name:</strong> {selectedStudent.first_name} {selectedStudent.last_name}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              <p><strong>Gender:</strong> {selectedStudent.gender}</p>
              <p><strong>Date of Birth:</strong> {selectedStudent.date_of_birth}</p>
              <p><strong>Admission Date:</strong> {selectedStudent.admission_date}</p>
              <p><strong>Admission Status:</strong> {selectedStudent.admission_status}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      {editOpen && selectedStudent && (
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogContent>
            <StudentForm
              student={selectedStudent}
              onSuccess={handleEditSuccess}
              isEdit={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

export default StudentListTable
