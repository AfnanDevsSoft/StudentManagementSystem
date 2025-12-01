// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import SchoolStatsCard from '@/views/apps/academy/dashboard/SchoolStatsCard'
import WelcomeCard from '@views/apps/academy/dashboard/WelcomeCard'

const AcademyDashboard = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <WelcomeCard />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SchoolStatsCard />
      </Grid>
    </Grid>
  )
}

export default AcademyDashboard
