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

const AddTeacherDrawer = ({ open, onClose, onSuccess }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      designation: '',
      qualification: '',
      years_experience: 0,
      personal_address: '',
      employment_type: 'full-time',
      hire_date: new Date().toISOString().split('T')[0],
      branch_id: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await apiService.createTeacher(data)
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create teacher:', error)
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
            Add New Teacher
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
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
                rules={{ required: 'Email is required' }}
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
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="designation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Designation"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="qualification"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Qualification"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="years_experience"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Years of Experience"
                    fullWidth
                    size="small"
                    type="number"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="personal_address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="employment_type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Employment Type"
                    select
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="full-time">Full-time</MenuItem>
                    <MenuItem value="part-time">Part-time</MenuItem>
                    <MenuItem value="contract">Contract</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="hire_date"
                control={control}
                rules={{ required: 'Hire date is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hire Date"
                    type="date"
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.hire_date}
                    helperText={errors.hire_date?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button fullWidth onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button fullWidth type="submit" variant="contained">
              Create Teacher
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddTeacherDrawer
