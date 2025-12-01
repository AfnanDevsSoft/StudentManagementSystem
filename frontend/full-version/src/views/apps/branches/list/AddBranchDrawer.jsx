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

const AddBranchDrawer = ({ open, onClose, onSuccess }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      address: '',
      city: '',
      state: '',
      country: '',
      phone: '',
      email: '',
      principal_name: '',
      principal_email: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      await apiService.createBranch(data)
      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create branch:', error)
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
            Add New Branch
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="code"
                control={control}
                rules={{ required: 'Branch code is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Branch Code"
                    fullWidth
                    size="small"
                    error={!!errors.code}
                    helperText={errors.code?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Branch name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Branch Name"
                    fullWidth
                    size="small"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
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
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Country"
                    fullWidth
                    size="small"
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
            <Grid item xs={12}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    size="small"
                    type="email"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="principal_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Principal Name"
                    fullWidth
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="principal_email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Principal Email"
                    fullWidth
                    size="small"
                    type="email"
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
              Create Branch
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

export default AddBranchDrawer
