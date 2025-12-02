'use client'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const AttendanceChart = ({ data }) => {
  const theme = useTheme()

  if (!data) return null

  // Prepare data for chart
  const attendancePercentage = data.averageAttendance || 0
  const daysPresent = data.totalDaysPresent || 0
  const daysAbsent = data.totalDaysAbsent || 0
  const daysLeave = data.totalDaysLeave || 0

  const series = [daysPresent, daysAbsent, daysLeave]

  const options = {
    labels: ['Present', 'Absent', 'Leave'],
    chart: {
      type: 'donut'
    },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.warning.main],
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            name: {
              offsetY: 20
            },
            value: {
              offsetY: -20
            },
            total: {
              show: true,
              label: 'Attendance',
              fontSize: '16px',
              fontFamily: theme.typography.fontFamily,
              color: theme.palette.text.primary,
              formatter: () => `${attendancePercentage.toFixed(1)}%`
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px'
      }
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
          Attendance Overview
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <AppReactApexCharts type='donut' height={240} width='100%' options={options} series={series} />
        </Box>
      </CardContent>
    </Card>
  )
}

export default AttendanceChart
