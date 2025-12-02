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

const TeacherDashboard = async () => {
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      {/* Welcome Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Welcome to Teacher Portal' />
          <CardContent>
            <Typography>
              Manage your classes, track student progress, create assignments, and monitor attendance all in one place.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='4'
          title='Classes Teaching'
          trendNumber='0%'
          chipText='This Semester'
          avatarColor='primary'
          avatarIcon='ri-group-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='120'
          title='Total Students'
          trendNumber='8%'
          chipText='This Semester'
          avatarColor='success'
          avatarIcon='ri-user-multiple-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='28'
          title='Assignments Given'
          trendNumber='3%'
          chipText='This Semester'
          avatarColor='warning'
          avatarIcon='ri-file-text-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='92%'
          title='Avg Attendance'
          trendNumber='1.5%'
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
          <CardHeader title='Quick Actions' />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label='My Classes' color='primary' variant='outlined' />
              <Chip label='Mark Attendance' color='primary' variant='outlined' />
              <Chip label='Create Assignment' color='primary' variant='outlined' />
              <Chip label='Grade Submissions' color='primary' variant='outlined' />
              <Chip label='Student Messages' color='primary' variant='outlined' />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TeacherDashboard
