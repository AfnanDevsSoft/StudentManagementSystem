'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import CircularProgress from '@mui/material/CircularProgress'

// Import API Service
import apiService from '@/services/api'

const SchoolStatsCard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    branches: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [studentsRes, teachersRes, coursesRes, branchesRes] = await Promise.all([
          apiService.getStudents(1, 1),
          apiService.getTeachers(1, 1),
          apiService.getCourses(1, 1),
          apiService.getBranches(1, 1)
        ])

        setStats({
          students: studentsRes?.pagination?.total || 0,
          teachers: teachersRes?.pagination?.total || 0,
          courses: coursesRes?.pagination?.total || 0,
          branches: branchesRes?.pagination?.total || 0
        })
        setLoading(false)
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatItem = ({ icon, label, value, color = 'primary' }) => (
    <Grid size={{ xs: 12, sm: 6, md: 3 }} display='flex' flexDirection='column' gap={2}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          borderRadius: 1,
          backgroundColor: `${color}.lighter` || 'action.hover'
        }}
      >
        <Box>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 1 }}>
            {label}
          </Typography>
          <Typography variant='h4' sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 50,
            height: 50,
            borderRadius: '50%',
            backgroundColor: `${color}.lighter`,
            color: `${color}.main`,
            fontSize: '1.5rem'
          }}
        >
          {icon}
        </Box>
      </Box>
    </Grid>
  )

  if (loading) {
    return (
      <Card>
        <CardHeader title='School Statistics' />
        <CardContent>
          <Box display='flex' justifyContent='center' alignItems='center' sx={{ p: 6 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader title='School Statistics' />
        <CardContent>
          <Typography color='error'>Error loading statistics: {error}</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='School Management System - Statistics'
        subheader='Overview of your institution'
        sx={{ mb: 2 }}
      />
      <CardContent>
        <Grid container spacing={3}>
          <StatItem icon='👥' label='Total Students' value={stats.students} color='info' />
          <StatItem icon='��‍🏫' label='Total Teachers' value={stats.teachers} color='success' />
          <StatItem icon='📚' label='Total Courses' value={stats.courses} color='warning' />
          <StatItem icon='🏢' label='Total Branches' value={stats.branches} color='error' />
        </Grid>
      </CardContent>
    </Card>
  )
}

export default SchoolStatsCard
