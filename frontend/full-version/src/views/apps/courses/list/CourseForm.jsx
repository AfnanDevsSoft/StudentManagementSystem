'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material'

const CourseForm = ({ open, onClose, course, onSubmit }) => {
  const [formData, setFormData] = useState({
    course_name: '',
    course_code: '',
    credit_hours: 0,
    description: '',
    start_date: '',
    end_date: '',
  })

  useEffect(() => {
    if (course) {
      setFormData({
        course_name: course.course_name || '',
        course_code: course.course_code || '',
        credit_hours: course.credit_hours || 0,
        description: course.description || '',
        start_date: course.start_date || '',
        end_date: course.end_date || '',
      })
    }
  }, [course, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Course</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Course Name"
            name="course_name"
            value={formData.course_name}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Course Code"
            name="course_code"
            value={formData.course_code}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Credit Hours"
            name="credit_hours"
            type="number"
            value={formData.credit_hours}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
          <TextField
            label="Start Date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CourseForm
