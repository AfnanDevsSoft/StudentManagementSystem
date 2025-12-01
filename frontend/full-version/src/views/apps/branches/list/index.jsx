'use client'

import { useState } from 'react'
import { Box, Button, Typography, Stack } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import BranchListTable from './BranchListTable'
import AddBranchDrawer from './AddBranchDrawer'

const BranchesList = () => {
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
            Branches Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage school branches and locations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
        >
          Add Branch
        </Button>
      </Stack>

      <BranchListTable key={refreshKey} />
      
      <AddBranchDrawer
        open={openDrawer}
        onClose={handleDrawerClose}
        onSuccess={handleAddSuccess}
      />
    </Box>
  )
}

export default BranchesList
