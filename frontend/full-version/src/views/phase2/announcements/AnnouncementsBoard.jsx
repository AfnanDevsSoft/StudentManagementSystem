'use client'

// React Imports
import { useEffect, useState } from 'react'

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
import Chip from '@mui/material/Chip'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Stack from '@mui/material/Stack'
import {
  fetchAnnouncements,
  fetchPinnedAnnouncements,
  fetchAnnouncementStatistics,
  createAnnouncement,
  searchAnnouncements,
  fetchAnnouncementsByPriority
} from '@/redux-store/slices/announcements'

// Icon Imports
import { Bell, Pin, Trash2, Plus, MessageCircle } from 'lucide-react'

// Local Imports
import { useAuth } from '@/contexts/AuthContext'

const AnnouncementsBoard = () => {
  // Hooks
  const dispatch = useDispatch()
  const { user } = useAuth()

  // Redux State
  const announcementsState = useSelector(state => state.announcementsReducer)
  const { announcements, pinned, statistics, searchResults, loading, error } = announcementsState || {}

  // Local State
  const [tabValue, setTabValue] = useState(0)
  const [openCreate, setOpenCreate] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    description: '',
    priority: 'normal',
    type: 'general',
    attachments: ''
  })

  // Fetch data on mount
  useEffect(() => {
    if (user?.courseId) {
      dispatch(fetchAnnouncements(user.courseId))
      dispatch(fetchPinnedAnnouncements(user.courseId))
      dispatch(fetchAnnouncementStatistics(user.courseId))
    }
  }, [dispatch, user])

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Handle search
  const handleSearch = () => {
    if (searchTerm && user?.courseId) {
      dispatch(searchAnnouncements({ courseId: user.courseId, searchTerm }))
    }
  }

  // Handle priority filter
  const handlePriorityFilter = priority => {
    setPriorityFilter(priority)
    if (priority !== 'all' && user?.courseId) {
      dispatch(fetchAnnouncementsByPriority({ courseId: user.courseId, priority }))
    }
  }

  // Handle create announcement
  const handleCreateAnnouncement = () => {
    if (newAnnouncement.title && newAnnouncement.description && user?.courseId) {
      dispatch(
        createAnnouncement({
          courseId: user.courseId,
          ...newAnnouncement
        })
      )
      setNewAnnouncement({ title: '', description: '', priority: 'normal', type: 'general', attachments: '' })
      setOpenCreate(false)
    }
  }

  // Get priority color
  const getPriorityColor = priority => {
    switch (priority) {
      case 'urgent':
        return 'error'
      case 'high':
        return 'warning'
      case 'normal':
        return 'info'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  const displayAnnouncements =
    searchResults && searchResults.length > 0 ? searchResults : (tabValue === 0 ? announcements : pinned) || []

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 600, mb: 0.5 }}>
            Announcements Board
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            <Bell size={16} style={{ display: 'inline', marginRight: 4 }} />
            {statistics?.totalAnnouncements || 0} Total Announcements
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<Plus size={18} />} onClick={() => setOpenCreate(true)}>
          New Announcement
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2' color='textSecondary'>
                Urgent
              </Typography>
              <Typography variant='h6' color='error'>
                {statistics.priorityCounts?.urgent || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2' color='textSecondary'>
                High
              </Typography>
              <Typography variant='h6' sx={{ color: 'warning.main' }}>
                {statistics.priorityCounts?.high || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2' color='textSecondary'>
                Normal
              </Typography>
              <Typography variant='h6' sx={{ color: 'info.main' }}>
                {statistics.priorityCounts?.normal || 0}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant='body2' color='textSecondary'>
                Pinned
              </Typography>
              <Typography variant='h6' color='primary'>
                {statistics.pinnedCount || 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Main Content */}
      <Card>
        {/* Search and Filter */}
        <CardContent sx={{ pb: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder='Search announcements...'
              size='small'
              fullWidth
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
            <Button variant='outlined' size='small' onClick={handleSearch} disabled={loading} sx={{ minWidth: 100 }}>
              Search
            </Button>
          </Stack>

          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} label='Priority' onChange={e => handlePriorityFilter(e.target.value)}>
              <MenuItem value='all'>All Priorities</MenuItem>
              <MenuItem value='urgent'>Urgent</MenuItem>
              <MenuItem value='high'>High</MenuItem>
              <MenuItem value='normal'>Normal</MenuItem>
              <MenuItem value='low'>Low</MenuItem>
            </Select>
          </FormControl>
        </CardContent>

        {/* Tabs */}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`All (${announcements?.length || 0})`} />
          <Tab label={`Pinned (${pinned?.length || 0})`} />
        </Tabs>

        {/* Announcements List */}
        <CardContent>
          {loading && !displayAnnouncements?.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : displayAnnouncements && displayAnnouncements.length > 0 ? (
            <Stack spacing={2}>
              {displayAnnouncements.map((announcement, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 1,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                        <Typography variant='h6' sx={{ fontWeight: 600 }}>
                          {announcement.title}
                        </Typography>
                        {announcement.isPinned && <Pin size={16} style={{ color: 'var(--color-primary)' }} />}
                        <Chip
                          label={announcement.priority || 'normal'}
                          size='small'
                          color={getPriorityColor(announcement.priority)}
                          variant='outlined'
                        />
                      </Box>

                      <Typography variant='body2' color='textSecondary' sx={{ mb: 1 }}>
                        {announcement.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                        <Typography variant='caption' color='textSecondary'>
                          {new Date(announcement.createdAt || Date.now()).toLocaleDateString()}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='textSecondary'
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <MessageCircle size={14} />
                          {announcement.viewCount || 0} views
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size='small' variant='text' startIcon={<Pin size={16} />}>
                        {announcement.isPinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button size='small' variant='text' color='error' startIcon={<Trash2 size={16} />}>
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Bell size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
              <Typography variant='body2' color='textSecondary'>
                No announcements yet
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Announcement Modal */}
      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openCreate}>
          <Card
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <CardContent>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
                Create New Announcement
              </Typography>

              <TextField
                label='Title'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                value={newAnnouncement.title}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />

              <TextField
                label='Description'
                fullWidth
                multiline
                rows={4}
                sx={{ mb: 2 }}
                value={newAnnouncement.description}
                onChange={e => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
              />

              <FormControl fullWidth size='small' sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newAnnouncement.priority}
                  label='Priority'
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                >
                  <MenuItem value='low'>Low</MenuItem>
                  <MenuItem value='normal'>Normal</MenuItem>
                  <MenuItem value='high'>High</MenuItem>
                  <MenuItem value='urgent'>Urgent</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size='small' sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newAnnouncement.type}
                  label='Type'
                  onChange={e => setNewAnnouncement({ ...newAnnouncement, type: e.target.value })}
                >
                  <MenuItem value='general'>General</MenuItem>
                  <MenuItem value='exam'>Exam</MenuItem>
                  <MenuItem value='event'>Event</MenuItem>
                  <MenuItem value='assignment'>Assignment</MenuItem>
                  <MenuItem value='holiday'>Holiday</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant='contained' fullWidth onClick={handleCreateAnnouncement} disabled={loading}>
                  {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Create
                </Button>
                <Button variant='outlined' fullWidth onClick={() => setOpenCreate(false)} disabled={loading}>
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Modal>
    </Box>
  )
}

export default AnnouncementsBoard
