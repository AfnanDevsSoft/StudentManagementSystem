'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from '@mui/material'

const TeacherForm = ({ open, onClose, teacher, onSubmit }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    designation: '',
    qualification: '',
    years_experience: 0,
    personal_address: '',
    employment_type: '',
  })

  useEffect(() => {
    if (teacher) {
      setFormData({
        first_name: teacher.first_name || '',
        last_name: teacher.last_name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        designation: teacher.designation || '',
        qualification: teacher.qualification || '',
        years_experience: teacher.years_experience || 0,
        personal_address: teacher.personal_address || '',
        employment_type: teacher.employment_type || '',
      })
    }
  }, [teacher])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'years_experience' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Teacher</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Years of Experience"
            name="years_experience"
            type="number"
            value={formData.years_experience}
            onChange={handleChange}
            fullWidth
            size="small"
          />
          <TextField
            label="Address"
            name="personal_address"
            value={formData.personal_address}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
            size="small"
          />
          <TextField
            label="Employment Type"
            name="employment_type"
            value={formData.employment_type}
            onChange={handleChange}
            fullWidth
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TeacherForm
