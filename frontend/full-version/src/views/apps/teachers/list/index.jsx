'use client'

import { useState } from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import TeacherListTable from './TeacherListTable'
import AddTeacherDrawer from './AddTeacherDrawer'

const TeachersList = () => {
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
            Teachers Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage teacher information and records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Teacher
        </Button>
      </Stack>

      <TeacherListTable key={refreshKey} />
      
      <AddTeacherDrawer
        open={openDrawer}
        onClose={handleDrawerClose}
        onSuccess={handleAddSuccess}
      />
    </Box>
  )
}

export default TeachersList
