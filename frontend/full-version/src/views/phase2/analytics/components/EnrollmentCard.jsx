'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'

const EnrollmentCard = ({ data }) => {
  if (!data) return null

  const totalEnrollments = data.totalEnrollments || 0
  const activeEnrollments = data.activeEnrollments || 0
  const inactiveEnrollments = data.inactiveEnrollments || 0
  const enrollmentGrowth = data.enrollmentGrowth || 0

  const progressValue = totalEnrollments > 0 ? (activeEnrollments / totalEnrollments) * 100 : 0
  const isPositiveGrowth = enrollmentGrowth >= 0

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1 }}>
              Total Enrollments
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
              {totalEnrollments.toLocaleString()}
            </Typography>
          </Box>
          <Chip
            label={`${isPositiveGrowth ? '+' : ''}${enrollmentGrowth.toFixed(1)}%`}
            color={isPositiveGrowth ? 'success' : 'error'}
            size='small'
            variant='outlined'
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='caption'>Active Students</Typography>
            <Typography variant='caption' sx={{ fontWeight: 600 }}>
              {activeEnrollments.toLocaleString()}
            </Typography>
          </Box>
          <LinearProgress variant='determinate' value={progressValue} sx={{ height: 6, borderRadius: 1 }} />
        </Box>

        <Box>
          <Typography variant='caption' color='textSecondary' display='block'>
            Inactive: {inactiveEnrollments.toLocaleString()}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default EnrollmentCard
