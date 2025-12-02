// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

// Components Imports
import CardStatVertical from '@components/card-statistics/Vertical'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

const StudentDashboard = async () => {
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      {/* Welcome Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Welcome to Student Portal' />
          <CardContent>
            <Typography>
              This is your personal learning dashboard. Here you can view your courses, assignments, grades, and track
              your academic progress.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='5'
          title='Active Courses'
          trendNumber='0%'
          chipText='This Semester'
          avatarColor='primary'
          avatarIcon='ri-book-open-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='12'
          title='Pending Assignments'
          trendNumber='5%'
          chipText='This Month'
          avatarColor='warning'
          avatarIcon='ri-task-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='85.5%'
          title='Current GPA'
          trendNumber='2.3%'
          chipText='Last Semester'
          avatarColor='success'
          avatarIcon='ri-award-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='95%'
          title='Attendance'
          trendNumber='1.2%'
          chipText='This Semester'
          avatarColor='info'
          avatarIcon='ri-calendar-check-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>

      {/* Info Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Quick Links' />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label='View Courses' color='primary' variant='outlined' />
              <Chip label='My Assignments' color='primary' variant='outlined' />
              <Chip label='Grade Report' color='primary' variant='outlined' />
              <Chip label='Attendance' color='primary' variant='outlined' />
              <Chip label='Messages' color='primary' variant='outlined' />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StudentDashboard
