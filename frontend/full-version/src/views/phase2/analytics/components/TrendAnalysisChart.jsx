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

const TrendAnalysisChart = ({ data }) => {
  const theme = useTheme()

  if (!data) return null

  // Prepare data for line chart - last 30 days trend
  const trendData = data.trends || []
  const days = trendData.slice(0, 30).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const attendanceValues = trendData.slice(0, 30).map(t => t.attendancePercentage || 0)

  const series = [
    {
      name: 'Attendance %',
      data: attendanceValues
    }
  ]

  const options = {
    chart: {
      type: 'line',
      toolbar: { show: true },
      sparkline: { enabled: false }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: [theme.palette.primary.main],
    xaxis: {
      categories: days,
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Attendance %',
        style: {
          fontSize: '14px',
          fontWeight: 600
        }
      },
      min: 0,
      max: 100
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 5
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: theme.palette.mode
    },
    plotOptions: {
      area: {
        fillTo: 'origin'
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1
      }
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
          Attendance Trends (Last 30 Days)
        </Typography>
        <Box sx={{ width: '100%' }}>
          <AppReactApexCharts type='line' height={320} width='100%' options={options} series={series} />
        </Box>
      </CardContent>
    </Card>
  )
}

export default TrendAnalysisChart
