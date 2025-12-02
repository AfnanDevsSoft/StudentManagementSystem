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
import ImageIcon from '@mui/icons-material/Image'
import VideocamIcon from '@mui/icons-material/Videocam'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import AudioFileIcon from '@mui/icons-material/AudioFile'

// Redux Actions
import { uploadContent, fetchCourseContent } from '@/redux-store/slices/courseContent'

// Local Imports
import { useAuth } from '@/contexts/AuthContext'
import { courseContentValidation } from '@/utils/validationSchemas'
import { useToast, ToastContainer } from '@/utils/toastNotification'

// Content type icons mapping
const CONTENT_TYPE_ICONS = {
  video: <VideocamIcon />,
  pdf: <PictureAsPdfIcon />,
  image: <ImageIcon />,
  document: <DescriptionIcon />,
  audio: <AudioFileIcon />
}

const CourseContentManagementWithValidation = () => {
  // Hooks
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { success, error: showError } = useToast()

  // Redux State
  const courseContentState = useSelector(state => state.courseContentReducer)
  const { contents, loading, error } = courseContentState || {}

  // Local State
  const [openUpload, setOpenUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [contents_data, setContentsData] = useState([])

  // Form Hook
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    watch
  } = useForm({
    defaultValues: {
      courseId: '',
      lessonId: '',
      title: '',
      description: '',
      contentType: '',
      file: null
    },
    mode: 'onBlur'
  })

  const contentType = watch('contentType')

  // Fetch content on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchCourseContent(user.id))
    }
  }, [dispatch, user])

  // Handle file selection
  const handleFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (50MB max)
    const maxSizeMB = 50
    const fileSizeMB = file.size / 1024 / 1024

    if (fileSizeMB > maxSizeMB) {
      showError(`File size must be less than ${maxSizeMB}MB`)
      return
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]

    if (!allowedTypes.includes(file.type)) {
      showError('File type is not allowed')
      return
    }

    setSelectedFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }

    success(`File selected: ${file.name}`)
  }

  // Handle upload submit
  const onUploadSubmit = async data => {
    if (!selectedFile) {
      showError('Please select a file')
      return
    }

    if (!user?.id) {
      showError('User not authenticated')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('courseId', data.courseId)
      formData.append('lessonId', data.lessonId)
      formData.append('title', data.title)
      formData.append('description', data.description)
      formData.append('contentType', data.contentType)
      formData.append('uploadedBy', user.id)

      const result = await dispatch(uploadContent(formData))

      if (result.payload && result.payload.success) {
        success('Content uploaded successfully!')
        reset()
        setSelectedFile(null)
        setFilePreview(null)
        setOpenUpload(false)
        dispatch(fetchCourseContent(user.id))
      } else {
        showError(result.payload?.message || 'Failed to upload content')
      }
    } catch (err) {
      showError('Error uploading content. Please try again.')
      console.error('Upload error:', err)
    }
  }

  // Handle close upload dialog
  const handleCloseUpload = () => {
    reset()
    setSelectedFile(null)
    setFilePreview(null)
    setOpenUpload(false)
  }

  const getFileIcon = contentType => {
    return CONTENT_TYPE_ICONS[contentType] || <DescriptionIcon />
  }

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Toast Container */}
      <ToastContainer />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 600, mb: 0.5 }}>
            Course Content Management
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            Upload and manage course materials
          </Typography>
        </Box>
        <Button
          variant='contained'
          onClick={() => setOpenUpload(true)}
        >
          Upload Content
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Content Grid */}
      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : contents && contents.length > 0 ? (
          contents.map((content, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* File Icon/Preview */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 150,
                    fontSize: 60,
                    color: 'primary.main',
                    overflow: 'hidden'
                  }}
                >
                  {content.contentType === 'image' && filePreview ? (
                    <img src={filePreview} alt={content.title} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                  ) : (
                    getFileIcon(content.contentType)
                  )}
                </Box>

                {/* Content Details */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }} noWrap>
                    {content.title}
                  </Typography>

                  <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }} noWrap>
                    {content.description}
                  </Typography>

                  {/* Chips */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label={content.contentType}
                      size='small'
                      variant='outlined'
                      icon={getFileIcon(content.contentType)}
                    />
                    <Chip
                      label={`${Math.round(content.fileSize / 1024)}KB`}
                      size='small'
                      variant='outlined'
                    />
                  </Box>

                  {/* Meta Info */}
                  <Typography variant='caption' color='textSecondary' display='block'>
                    Uploaded: {new Date(content.uploadedAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant='caption' color='textSecondary'>
                    Views: {content.views || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <DescriptionIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
              <Typography variant='body2' color='textSecondary'>
                No content uploaded yet
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Upload Dialog */}
      <Dialog
        open={openUpload}
        onClose={handleCloseUpload}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Upload Course Content</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <form>
              {/* Course ID */}
              <Controller
                name='courseId'
                control={control}
                rules={courseContentValidation.courseId}
                render={({ field }) => (
                  <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.courseId}>
                    <InputLabel>Course</InputLabel>
                    <Select
                      {...field}
                      label='Course'
                      disabled={isSubmitting}
                    >
                      <MenuItem value='course-001'>Course 001</MenuItem>
                      <MenuItem value='course-002'>Course 002</MenuItem>
                      <MenuItem value='course-003'>Course 003</MenuItem>
                    </Select>
                    {errors.courseId && (
                      <FormHelperText>{errors.courseId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* Lesson ID */}
              <Controller
                name='lessonId'
                control={control}
                rules={courseContentValidation.lessonId}
                render={({ field }) => (
                  <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.lessonId}>
                    <InputLabel>Lesson</InputLabel>
                    <Select
                      {...field}
                      label='Lesson'
                      disabled={isSubmitting}
                    >
                      <MenuItem value='lesson-001'>Lesson 001</MenuItem>
                      <MenuItem value='lesson-002'>Lesson 002</MenuItem>
                      <MenuItem value='lesson-003'>Lesson 003</MenuItem>
                    </Select>
                    {errors.lessonId && (
                      <FormHelperText>{errors.lessonId.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* Title */}
              <Controller
                name='title'
                control={control}
                rules={courseContentValidation.title}
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

              {/* Description */}
              <Controller
                name='description'
                control={control}
                rules={courseContentValidation.description}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Description'
                    fullWidth
                    multiline
                    rows={3}
                    size='small'
                    sx={{ mb: 2 }}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={isSubmitting}
                  />
                )}
              />

              {/* Content Type */}
              <Controller
                name='contentType'
                control={control}
                rules={courseContentValidation.contentType}
                render={({ field }) => (
                  <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.contentType}>
                    <InputLabel>Content Type</InputLabel>
                    <Select
                      {...field}
                      label='Content Type'
                      disabled={isSubmitting}
                    >
                      <MenuItem value='video'>Video</MenuItem>
                      <MenuItem value='pdf'>PDF Document</MenuItem>
                      <MenuItem value='image'>Image</MenuItem>
                      <MenuItem value='document'>Document</MenuItem>
                      <MenuItem value='audio'>Audio</MenuItem>
                    </Select>
                    {errors.contentType && (
                      <FormHelperText>{errors.contentType.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              {/* File Input */}
              <Box sx={{ mb: 2 }}>
                <input
                  type='file'
                  accept='.pdf,.mp4,.mov,.mp3,.wav,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx'
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id='file-input'
                  disabled={isSubmitting}
                />
                <label htmlFor='file-input' style={{ width: '100%' }}>
                  <Button
                    variant='outlined'
                    component='span'
                    fullWidth
                    disabled={isSubmitting}
                    sx={{ textTransform: 'none' }}
                  >
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose File'}
                  </Button>
                </label>
                {selectedFile && (
                  <FormHelperText sx={{ mt: 1 }}>
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
                  </FormHelperText>
                )}
              </Box>

              {/* File Preview */}
              {filePreview && (
                <Paper sx={{ p: 1, mb: 2, textAlign: 'center' }}>
                  <img src={filePreview} alt='Preview' style={{ maxWidth: '100%', maxHeight: 200 }} />
                </Paper>
              )}
            </form>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpload} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onUploadSubmit)}
            variant='contained'
            disabled={isSubmitting || !selectedFile}
          >
            {isSubmitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CourseContentManagementWithValidation
