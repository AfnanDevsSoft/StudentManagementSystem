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

const AdminDashboard = async () => {
  const serverMode = await getServerMode()

  return (
    <Grid container spacing={6}>
      {/* Welcome Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Welcome to Admin Panel' />
          <CardContent>
            <Typography>
              Monitor system performance, manage users, oversee academic operations, and access comprehensive reports and
              analytics.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats Cards */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='1,250'
          title='Total Students'
          trendNumber='12%'
          chipText='This Year'
          avatarColor='primary'
          avatarIcon='ri-user-multiple-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='85'
          title='Teachers'
          trendNumber='5%'
          chipText='This Year'
          avatarColor='success'
          avatarIcon='ri-team-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='45'
          title='Classes'
          trendNumber='8%'
          chipText='This Year'
          avatarColor='warning'
          avatarIcon='ri-building-2-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <CardStatVertical
          stats='98.5%'
          title='System Health'
          trendNumber='0.3%'
          chipText='Current'
          avatarColor='info'
          avatarIcon='ri-pulse-line'
          avatarSkin='light'
          chipColor='secondary'
        />
      </Grid>

      {/* Info Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Administrative Tools' />
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip label='Manage Users' color='primary' variant='outlined' />
              <Chip label='View Reports' color='primary' variant='outlined' />
              <Chip label='System Settings' color='primary' variant='outlined' />
              <Chip label='Academic Config' color='primary' variant='outlined' />
              <Chip label='Activity Logs' color='primary' variant='outlined' />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AdminDashboard
