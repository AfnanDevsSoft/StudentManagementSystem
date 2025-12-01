'use client'

import { useState } from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import CourseListTable from './CourseListTable'
import AddCourseDrawer from './AddCourseDrawer'

const CoursesList = () => {
  const [openDrawer, setOpenDrawer] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAddClick = () => {
    setOpenDrawer(true)
  }

  const handleDrawerClose = () => {
    setOpenDrawer(false)
  }

  const handleAddSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" mb={1}>
            Courses Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage course information and assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Course
        </Button>
      </Stack>

      <CourseListTable key={refreshKey} />
      
      <AddCourseDrawer
        open={openDrawer}
        onClose={handleDrawerClose}
        onSuccess={handleAddSuccess}
      />
    </Box>
  )
}

export default CoursesList
