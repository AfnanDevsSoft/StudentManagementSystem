'use client'

import { useEffect } from 'react'
import {
  Drawer,
  Button,
  TextField,
  Grid,
  Box,
  MenuItem,
  Typography,
  IconButton,
} from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import apiService from '@/services/api'

const AddStudentDrawer = ({ open, onClose, onSuccess }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      student_code: '',
      first_name: '',
      last_name: '',
      email: '',
      date_of_birth: '',
      gender: '',
      admission_date: new Date().toISOString().split('T')[0],
      admission_status: 'pending',
      branch_id: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await apiService.createStudent(data)
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create student:', error)
    }
  }

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ p: 2, width: 400 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Add New Student
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="student_code"
                control={control}
                rules={{ required: 'Student code is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Student Code"
                    fullWidth
                    size="small"
                    error={!!errors.student_code}
                    helperText={errors.student_code?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="gender"
                control={control}
                rules={{ required: 'Gender is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Gender"
                    select
                    fullWidth
                    size="small"
                    error={!!errors.gender}
                    helperText={errors.gender?.message}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="first_name"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    size="small"
                    error={!!errors.first_name}
                    helperText={errors.first_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="last_name"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    size="small"
                    error={!!errors.last_name}
                    helperText={errors.last_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    size="small"
                    type="email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="date_of_birth"
                control={control}
                rules={{ required: 'Date of birth is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.date_of_birth}
                    helperText={errors.date_of_birth?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="admission_date"
                control={control}
                rules={{ required: 'Admission date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Admission Date"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.admission_date}
                    helperText={errors.admission_date?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="admission_status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Admission Status"
                    select
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button fullWidth onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button fullWidth type="submit" variant="contained">
              Create Student
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddStudentDrawer
