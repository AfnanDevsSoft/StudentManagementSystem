'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  MenuItem,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'

const StudentForm = ({ open, onClose, student, onSubmit }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      student_code: '',
      first_name: '',
      last_name: '',
      email: '',
      date_of_birth: '',
      gender: '',
      admission_date: '',
      admission_status: 'pending',
    },
  })

  useEffect(() => {
    if (student && open) {
      reset({
        student_code: student.student_code || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        email: student.email || '',
        date_of_birth: student.date_of_birth || '',
        gender: student.gender || '',
        admission_date: student.admission_date || '',
        admission_status: student.admission_status || 'pending',
      })
    }
  }, [student, open, reset])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Student</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ pt: 2 }}>
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
                    disabled
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default StudentForm
