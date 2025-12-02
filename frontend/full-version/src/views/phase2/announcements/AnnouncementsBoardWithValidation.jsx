'use client'

// React Imports
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import FormHelperText from '@mui/material/FormHelperText'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import PushPinIcon from '@mui/icons-material/PushPin'
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'

// Redux Actions
import { createAnnouncement, fetchAnnouncements } from '@/redux-store/slices/announcements'

// Local Imports
import { useAuth } from '@/contexts/AuthContext'
import { announcementsValidation } from '@/utils/validationSchemas'
import { useToast, ToastContainer } from '@/utils/toastNotification'

// Priority colors
const PRIORITY_COLORS = {
  low: 'info',
  medium: 'warning',
  high: 'error'
}

const AnnouncementsBoardWithValidation = () => {
  // Hooks
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { success, error: showError } = useToast()

  // Redux State
  const announcementsState = useSelector(state => state.announcementsReducer)
  const { announcements, loading, error } = announcementsState || {}

  // Local State
  const [openCreate, setOpenCreate] = useState(false)
  const [pinnedIds, setPinnedIds] = useState(new Set())
  const [filterPriority, setFilterPriority] = useState('all')

  // Form Hook
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      courseId: '',
      priority: 'medium',
      expiryDate: ''
    },
    mode: 'onBlur'
  })

  // Fetch announcements on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAnnouncements(user.id))
    }
  }, [dispatch, user])

  // Handle create submit
  const onCreateSubmit = async data => {
    if (!user?.id) {
      showError('User not authenticated')
      return
    }

    try {
      const result = await dispatch(
        createAnnouncement({
          ...data,
          createdBy: user.id,
          createdAt: new Date()
        })
      )

      if (result.payload && result.payload.success) {
        success('Announcement created successfully!')
        reset()
        setOpenCreate(false)
        dispatch(fetchAnnouncements(user.id))
      } else {
        showError(result.payload?.message || 'Failed to create announcement')
      }
    } catch (err) {
      showError('Error creating announcement. Please try again.')
      console.error('Create error:', err)
    }
  }

  // Handle close create dialog
  const handleCloseCreate = () => {
    reset()
    setOpenCreate(false)
  }

  // Handle pin announcement
  const handlePinToggle = announcementId => {
    const newPinned = new Set(pinnedIds)
    if (newPinned.has(announcementId)) {
      newPinned.delete(announcementId)
    } else {
      newPinned.add(announcementId)
    }
    setPinnedIds(newPinned)
    success(newPinned.has(announcementId) ? 'Announcement pinned' : 'Announcement unpinned')
  }

  // Filter announcements
  const filteredAnnouncements =
    announcements?.filter(ann => filterPriority === 'all' || ann.priority === filterPriority) || []

  // Sort announcements (pinned first)
  const sortedAnnouncements = [
    ...filteredAnnouncements.filter(ann => pinnedIds.has(ann.id)),
    ...filteredAnnouncements.filter(ann => !pinnedIds.has(ann.id))
  ]

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Toast Container */}
      <ToastContainer />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 600, mb: 0.5 }}>
            Announcements Board
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            {sortedAnnouncements.length} announcements
          </Typography>
        </Box>
        <Button variant='contained' onClick={() => setOpenCreate(true)}>
          New Announcement
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>Priority</InputLabel>
          <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} label='Priority'>
            <MenuItem value='all'>All Priorities</MenuItem>
            <MenuItem value='low'>Low</MenuItem>
            <MenuItem value='medium'>Medium</MenuItem>
            <MenuItem value='high'>High</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Announcements List */}
      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : sortedAnnouncements.length > 0 ? (
          sortedAnnouncements.map((announcement, index) => (
            <Grid item xs={12} key={index}>
              <Card
                sx={{
                  borderLeft: 4,
                  borderLeftColor: `${PRIORITY_COLORS[announcement.priority]}.main`,
                  position: 'relative'
                }}
              >
                {/* Pinned Badge */}
                {pinnedIds.has(announcement.id) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    PINNED
                  </Box>
                )}

                <CardContent>
                  {/* Title and Date */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 600,
                        flex: 1,
                        pr: 2
                      }}
                    >
                      {announcement.title}
                    </Typography>
                    <Typography variant='caption' color='textSecondary' sx={{ whiteSpace: 'nowrap' }}>
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Content */}
                  <Typography
                    variant='body2'
                    color='textSecondary'
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      overflow: 'hidden',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2
                    }}
                  >
                    {announcement.content}
                  </Typography>

                  {/* Meta Information */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={announcement.priority?.toUpperCase() || 'MEDIUM'}
                      size='small'
                      color={PRIORITY_COLORS[announcement.priority] || 'default'}
                      variant='outlined'
                    />
                    {announcement.courseId && (
                      <Chip label={`Course: ${announcement.courseId}`} size='small' variant='outlined' />
                    )}
                    {announcement.expiryDate && (
                      <Typography variant='caption' color='textSecondary'>
                        Expires: {new Date(announcement.expiryDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton
                      size='small'
                      onClick={() => handlePinToggle(announcement.id)}
                      title={pinnedIds.has(announcement.id) ? 'Unpin' : 'Pin'}
                    >
                      {pinnedIds.has(announcement.id) ? (
                        <PushPinIcon fontSize='small' />
                      ) : (
                        <PushPinOutlinedIcon fontSize='small' />
                      )}
                    </IconButton>
                    <IconButton size='small' title='Edit'>
                      <EditIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' title='Delete'>
                      <DeleteIcon fontSize='small' />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant='body2' color='textSecondary'>
                {filterPriority === 'all' ? 'No announcements yet' : `No ${filterPriority} priority announcements`}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={handleCloseCreate} maxWidth='sm' fullWidth>
        <DialogTitle>Create New Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <form>
              {/* Title */}
              <Controller
                name='title'
                control={control}
                rules={announcementsValidation.title}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Title'
                    fullWidth
                    size='small'
                    sx={{ mb: 2 }}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              {/* Content */}
              <Controller
                name='content'
                control={control}
                rules={announcementsValidation.content}
                render={({ field }) => (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      {...field}
                      label='Content'
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.content}
                      helperText={errors.content?.message}
                      disabled={isSubmitting}
                    />
                    <FormHelperText>{getValues('content').length}/3000 characters</FormHelperText>
                  </Box>
                )}
              />

              {/* Course ID */}
              <Controller
                name='courseId'
                control={control}
                rules={announcementsValidation.courseId}
                render={({ field }) => (
                  <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.courseId}>
                    <InputLabel>Course</InputLabel>
                    <Select {...field} label='Course' disabled={isSubmitting}>
                      <MenuItem value='course-001'>Course 001</MenuItem>
                      <MenuItem value='course-002'>Course 002</MenuItem>
                      <MenuItem value='course-003'>Course 003</MenuItem>
                    </Select>
                    {errors.courseId && <FormHelperText>{errors.courseId.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              {/* Priority */}
              <Controller
                name='priority'
                control={control}
                rules={announcementsValidation.priority}
                render={({ field }) => (
                  <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.priority}>
                    <InputLabel>Priority</InputLabel>
                    <Select {...field} label='Priority' disabled={isSubmitting}>
                      <MenuItem value='low'>Low</MenuItem>
                      <MenuItem value='medium'>Medium</MenuItem>
                      <MenuItem value='high'>High</MenuItem>
                    </Select>
                    {errors.priority && <FormHelperText>{errors.priority.message}</FormHelperText>}
                  </FormControl>
                )}
              />

              {/* Expiry Date */}
              <Controller
                name='expiryDate'
                control={control}
                rules={announcementsValidation.expiryDate}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Expiry Date'
                    type='datetime-local'
                    fullWidth
                    size='small'
                    sx={{ mb: 2 }}
                    error={!!errors.expiryDate}
                    helperText={errors.expiryDate?.message}
                    disabled={isSubmitting}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </form>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onCreateSubmit)} variant='contained' disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AnnouncementsBoardWithValidation
