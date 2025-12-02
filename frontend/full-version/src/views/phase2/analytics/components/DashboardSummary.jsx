'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'

const DashboardSummary = ({ data }) => {
  if (!data) return null

  const summaryCards = [
    {
      label: 'Total Students',
      value: data.totalStudents || 0,
      change: data.studentGrowth || 0,
      icon: '👥'
    },
    {
      label: 'Active Courses',
      value: data.activeCourses || 0,
      change: data.courseGrowth || 0,
      icon: '📚'
    },
    {
      label: 'Teachers',
      value: data.totalTeachers || 0,
      change: data.teacherGrowth || 0,
      icon: '👨‍🏫'
    },
    {
      label: 'Avg Attendance',
      value: `${(data.averageAttendance || 0).toFixed(1)}%`,
      change: data.attendanceChange || 0,
      icon: '📊'
    },
    {
      label: 'Pending Fees',
      value: `₹${((data.pendingFees || 0) / 100000).toFixed(1)}L`,
      change: -Math.abs(data.feeGrowth || 0),
      icon: '💰'
    },
    {
      label: 'Total Revenue',
      value: `₹${((data.totalRevenue || 0) / 100000).toFixed(1)}L`,
      change: data.revenueGrowth || 0,
      icon: '📈'
    }
  ]

  return (
    <Grid container spacing={2}>
      {summaryCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant='caption' color='textSecondary' sx={{ fontWeight: 500 }}>
                  {card.label}
                </Typography>
                <Typography variant='h5'>{card.icon}</Typography>
              </Box>

              <Typography variant='h6' sx={{ fontWeight: 700, mb: 1.5 }}>
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </Typography>

              <Chip
                label={`${card.change >= 0 ? '+' : ''}${card.change.toFixed(1)}%`}
                color={card.change >= 0 ? 'success' : 'error'}
                size='small'
                variant='outlined'
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default DashboardSummary
