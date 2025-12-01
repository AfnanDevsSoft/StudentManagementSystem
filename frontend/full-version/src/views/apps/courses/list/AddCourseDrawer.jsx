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

const AddCourseDrawer = ({ open, onClose, onSuccess }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      course_name: '',
      course_code: '',
      description: '',
      subject_id: '',
      grade_level_id: '',
      branch_id: '',
      teacher_id: '',
      max_students: 40,
      room_number: '',
      building: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await apiService.createCourse(data)
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create course:', error)
    }
  }

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ p: 2, width: 400, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Add New Course
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="course_code"
                control={control}
                rules={{ required: 'Course code is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Course Code"
                    fullWidth
                    size="small"
                    error={!!errors.course_code}
                    helperText={errors.course_code?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="max_students"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Max Students"
                    fullWidth
                    size="small"
                    type="number"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="course_name"
                control={control}
                rules={{ required: 'Course name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Course Name"
                    fullWidth
                    size="small"
                    error={!!errors.course_name}
                    helperText={errors.course_name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
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
                name="subject_id"
                control={control}
                rules={{ required: 'Subject is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Subject"
                    select
                    fullWidth
                    size="small"
                    error={!!errors.subject_id}
                    helperText={errors.subject_id?.message}
                  >
                    <MenuItem value="">Select Subject</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="grade_level_id"
                control={control}
                rules={{ required: 'Grade level is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Grade Level"
                    select
                    fullWidth
                    size="small"
                    error={!!errors.grade_level_id}
                    helperText={errors.grade_level_id?.message}
                  >
                    <MenuItem value="">Select Grade Level</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="branch_id"
                control={control}
                rules={{ required: 'Branch is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Branch"
                    select
                    fullWidth
                    size="small"
                    error={!!errors.branch_id}
                    helperText={errors.branch_id?.message}
                  >
                    <MenuItem value="">Select Branch</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="teacher_id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Teacher"
                    select
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="">Select Teacher</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="room_number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Room Number"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="building"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Building"
                    fullWidth
                    size="small"
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
              Create Course
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddCourseDrawer
