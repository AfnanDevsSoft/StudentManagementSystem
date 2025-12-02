'use client'

// React Imports
import { useEffect, useState } from 'react'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
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
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import {
  fetchCourseContent,
  fetchPopularContent,
  fetchContentByType,
  uploadContent,
  searchContent,
  setPinned,
  trackContentView
} from '@/redux-store/slices/courseContent'

// Icon Imports
import { Upload, Pin, Eye, Download, Trash2, Plus, BookOpen } from 'lucide-react'

// Local Imports
import { useAuth } from '@/contexts/AuthContext'

const CourseContentManagement = () => {
  // Hooks
  const dispatch = useDispatch()
  const { user } = useAuth()

  // Redux State
  const courseContentState = useSelector(state => state.courseContentReducer)
  const { content, popular, byType, loading, error } = courseContentState || {}

  // Local State
  const [openUpload, setOpenUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState('all') // all, popular, by-type
  const [selectedType, setSelectedType] = useState('all')
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    contentType: 'video',
    duration: '',
    size: '',
    path: ''
  })

  // Content types
  const contentTypes = ['video', 'document', 'audio', 'image', 'presentation']

  // Fetch data on mount
  useEffect(() => {
    if (user?.courseId) {
      dispatch(fetchCourseContent(user.courseId))
      dispatch(fetchPopularContent(user.courseId))
    }
  }, [dispatch, user])

  // Handle type filter
  const handleTypeFilter = type => {
    setSelectedType(type)
    if (type !== 'all' && user?.courseId) {
      dispatch(fetchContentByType({ courseId: user.courseId, contentType: type }))
      setViewMode('by-type')
    } else {
      setViewMode('all')
    }
  }

  // Handle search
  const handleSearch = () => {
    if (searchTerm && user?.courseId) {
      dispatch(searchContent({ courseId: user.courseId, searchTerm }))
    }
  }

  // Handle upload
  const handleUploadContent = () => {
    if (uploadData.title && uploadData.description && user?.courseId) {
      dispatch(
        uploadContent({
          courseId: user.courseId,
          ...uploadData
        })
      )
      setUploadData({ title: '', description: '', contentType: 'video', duration: '', size: '', path: '' })
      setOpenUpload(false)
    }
  }

  // Handle pin
  const handlePinContent = (contentId, isPinned) => {
    dispatch(setPinned({ contentId, isPinned: !isPinned }))
  }

  // Handle view track
  const handleViewContent = contentId => {
    dispatch(trackContentView(contentId))
  }

  // Get content to display
  const getDisplayContent = () => {
    if (viewMode === 'popular') return popular
    if (viewMode === 'by-type') return byType
    return content
  }

  const displayContent = getDisplayContent() || []

  // Get type color
  const getTypeColor = type => {
    const colors = {
      video: 'primary',
      document: 'info',
      audio: 'warning',
      image: 'success',
      presentation: 'error'
    }
    return colors[type] || 'default'
  }

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 600, mb: 0.5 }}>
            Course Content Management
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            <BookOpen size={16} style={{ display: 'inline', marginRight: 4 }} />
            {content?.length || 0} Content Items
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<Plus size={18} />} onClick={() => setOpenUpload(true)}>
          Upload Content
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder='Search content...'
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

          {/* Type Filter Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label='All'
              onClick={() => handleTypeFilter('all')}
              color={selectedType === 'all' ? 'primary' : 'default'}
              variant={selectedType === 'all' ? 'filled' : 'outlined'}
            />
            {contentTypes.map(type => (
              <Chip
                key={type}
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                onClick={() => handleTypeFilter(type)}
                color={selectedType === type ? 'primary' : 'default'}
                variant={selectedType === type ? 'filled' : 'outlined'}
              />
            ))}
            <Chip
              label='Popular'
              onClick={() => setViewMode('popular')}
              color={viewMode === 'popular' ? 'success' : 'default'}
              variant={viewMode === 'popular' ? 'filled' : 'outlined'}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Content Grid */}
      {loading && !displayContent?.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : displayContent && displayContent.length > 0 ? (
        <Grid container spacing={3}>
          {displayContent.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3
                  }
                }}
              >
                {/* Media Placeholder */}
                <CardMedia
                  sx={{
                    height: 200,
                    backgroundColor: 'action.disabledBackground',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      backgroundColor: `${getTypeColor(item.contentType)}.main`,
                      color: 'white',
                      opacity: 0.2
                    }}
                  >
                    <BookOpen size={48} />
                  </Box>

                  {/* Pin Icon Overlay */}
                  <IconButton
                    onClick={() => handlePinContent(item.contentId, item.isPinned)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'background.paper',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                    size='small'
                  >
                    <Pin
                      size={18}
                      style={{
                        fill: item.isPinned ? 'var(--color-primary)' : 'none',
                        color: item.isPinned ? 'var(--color-primary)' : 'currentColor'
                      }}
                    />
                  </IconButton>
                </CardMedia>

                {/* Content */}
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Title and Type */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 600,
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Box>

                  {/* Type Chip */}
                  <Chip
                    label={item.contentType}
                    size='small'
                    color={getTypeColor(item.contentType)}
                    variant='outlined'
                    sx={{ mb: 1 }}
                  />

                  {/* Description */}
                  <Typography
                    variant='body2'
                    color='textSecondary'
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {item.description}
                  </Typography>

                  {/* Metadata */}
                  <Stack spacing={0.5} sx={{ mb: 2 }}>
                    {item.duration && (
                      <Typography variant='caption' color='textSecondary'>
                        Duration: {item.duration}
                      </Typography>
                    )}
                    {item.size && (
                      <Typography variant='caption' color='textSecondary'>
                        Size: {item.size}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Eye size={14} />
                      <Typography variant='caption' color='textSecondary'>
                        {item.viewCount || 0} views
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                {/* Actions */}
                <Box
                  sx={{
                    p: 1,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <Button
                    size='small'
                    variant='outlined'
                    fullWidth
                    startIcon={<Eye size={16} />}
                    onClick={() => handleViewContent(item.contentId)}
                  >
                    View
                  </Button>
                  <Button size='small' variant='text' color='error' startIcon={<Trash2 size={16} />}>
                    Delete
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <BookOpen size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Typography variant='body2' color='textSecondary'>
              No content available
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      <Modal
        open={openUpload}
        onClose={() => setOpenUpload(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openUpload}>
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
                Upload Content
              </Typography>

              <TextField
                label='Title'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                value={uploadData.title}
                onChange={e => setUploadData({ ...uploadData, title: e.target.value })}
              />

              <TextField
                label='Description'
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
                value={uploadData.description}
                onChange={e => setUploadData({ ...uploadData, description: e.target.value })}
              />

              <FormControl fullWidth size='small' sx={{ mb: 2 }}>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={uploadData.contentType}
                  label='Content Type'
                  onChange={e => setUploadData({ ...uploadData, contentType: e.target.value })}
                >
                  {contentTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label='Duration (optional)'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                placeholder='e.g., 45 minutes'
                value={uploadData.duration}
                onChange={e => setUploadData({ ...uploadData, duration: e.target.value })}
              />

              <TextField
                label='File Size (optional)'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                placeholder='e.g., 500 MB'
                value={uploadData.size}
                onChange={e => setUploadData({ ...uploadData, size: e.target.value })}
              />

              <TextField
                label='File Path'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                value={uploadData.path}
                onChange={e => setUploadData({ ...uploadData, path: e.target.value })}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant='contained'
                  fullWidth
                  startIcon={<Upload size={18} />}
                  onClick={handleUploadContent}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Upload
                </Button>
                <Button variant='outlined' fullWidth onClick={() => setOpenUpload(false)} disabled={loading}>
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

export default CourseContentManagement
