'use client'

// React Imports
import { useEffect } from 'react'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import {
  fetchDashboardSummary,
  fetchEnrollmentMetrics,
  fetchAttendanceMetrics,
  fetchFeeMetrics,
  fetchTeacherMetrics,
  fetchTrendAnalysis
} from '@/redux-store/slices/analytics'

// Local Imports
import { useAuth } from '@/contexts/AuthContext'
import EnrollmentCard from './components/EnrollmentCard'
import AttendanceChart from './components/AttendanceChart'
import FeeCollectionCard from './components/FeeCollectionCard'
import TeacherPerformanceList from './components/TeacherPerformanceList'
import TrendAnalysisChart from './components/TrendAnalysisChart'
import DashboardSummary from './components/DashboardSummary'

const AnalyticsDashboard = () => {
  // Hooks
  const dispatch = useDispatch()
  const { user } = useAuth()

  // Redux State
  const analyticsState = useSelector(state => state.analyticsReducer)
  const { dashboard, enrollment, attendance, fees, teachers, trends } = analyticsState || {}

  // Fetch data on mount
  useEffect(() => {
    if (user?.branchId) {
      dispatch(fetchDashboardSummary(user.branchId))
      dispatch(fetchEnrollmentMetrics(user.branchId))
      dispatch(fetchAttendanceMetrics(user.branchId))
      dispatch(fetchFeeMetrics(user.branchId))
      dispatch(fetchTeacherMetrics(user.branchId))
      dispatch(fetchTrendAnalysis('attendance'))
    }
  }, [dispatch, user])

  // Handle refresh
  const handleRefresh = () => {
    if (user?.branchId) {
      dispatch(fetchDashboardSummary(user.branchId))
      dispatch(fetchEnrollmentMetrics(user.branchId))
      dispatch(fetchAttendanceMetrics(user.branchId))
      dispatch(fetchFeeMetrics(user.branchId))
      dispatch(fetchTeacherMetrics(user.branchId))
      dispatch(fetchTrendAnalysis('attendance'))
    }
  }

  // Check for errors
  const hasError = dashboard?.error || enrollment?.error || attendance?.error || fees?.error || teachers?.error
  const isLoading = dashboard?.loading || enrollment?.loading || attendance?.loading

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Analytics Dashboard
        </Typography>
        <Button variant='contained' onClick={handleRefresh} disabled={isLoading} size='small'>
          {isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {hasError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {dashboard?.error || enrollment?.error || attendance?.error || 'Error loading analytics'}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !dashboard?.data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Dashboard Summary */}
          {dashboard?.data && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <DashboardSummary data={dashboard.data} />
              </Grid>
            </Grid>
          )}

          {/* Main Metrics Row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Enrollment Card */}
            <Grid item xs={12} sm={6} md={3}>
              {enrollment?.loading && !enrollment?.data ? (
                <Card>
                  <CardContent
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}
                  >
                    <CircularProgress />
                  </CardContent>
                </Card>
              ) : enrollment?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error'>{enrollment.error}</Alert>
                  </CardContent>
                </Card>
              ) : (
                <EnrollmentCard data={enrollment?.data} />
              )}
            </Grid>

            {/* Attendance Card */}
            <Grid item xs={12} sm={6} md={3}>
              {attendance?.loading && !attendance?.data ? (
                <Card>
                  <CardContent
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}
                  >
                    <CircularProgress />
                  </CardContent>
                </Card>
              ) : attendance?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error'>{attendance.error}</Alert>
                  </CardContent>
                </Card>
              ) : (
                <AttendanceChart data={attendance?.data} />
              )}
            </Grid>

            {/* Fee Collection Card */}
            <Grid item xs={12} sm={6} md={3}>
              {fees?.loading && !fees?.data ? (
                <Card>
                  <CardContent
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}
                  >
                    <CircularProgress />
                  </CardContent>
                </Card>
              ) : fees?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error'>{fees.error}</Alert>
                  </CardContent>
                </Card>
              ) : (
                <FeeCollectionCard data={fees?.data} />
              )}
            </Grid>

            {/* Metrics Summary */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant='subtitle2' color='textSecondary' sx={{ mb: 2 }}>
                    Quick Stats
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant='caption' color='textSecondary'>
                        Total Students
                      </Typography>
                      <Typography variant='h6'>{enrollment?.data?.totalEnrollments || '0'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='textSecondary'>
                        Avg. Attendance
                      </Typography>
                      <Typography variant='h6' color='success.main'>
                        {attendance?.data?.averageAttendance
                          ? `${attendance.data.averageAttendance.toFixed(1)}%`
                          : '0%'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant='caption' color='textSecondary'>
                        Total Revenue
                      </Typography>
                      <Typography variant='h6'>
                        {fees?.data?.totalFeeCollected ? `₹${fees.data.totalFeeCollected.toLocaleString()}` : '₹0'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Trends and Performance Row */}
          <Grid container spacing={3}>
            {/* Trend Analysis Chart */}
            <Grid item xs={12} md={8}>
              {trends?.loading && !trends?.data ? (
                <Card>
                  <CardContent
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
                  >
                    <CircularProgress />
                  </CardContent>
                </Card>
              ) : trends?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error'>{trends.error}</Alert>
                  </CardContent>
                </Card>
              ) : (
                <TrendAnalysisChart data={trends?.data} />
              )}
            </Grid>

            {/* Teacher Performance List */}
            <Grid item xs={12} md={4}>
              {teachers?.loading && !teachers?.data ? (
                <Card>
                  <CardContent
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
                  >
                    <CircularProgress />
                  </CardContent>
                </Card>
              ) : teachers?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error'>{teachers.error}</Alert>
                  </CardContent>
                </Card>
              ) : (
                <TeacherPerformanceList data={teachers?.data} />
              )}
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default AnalyticsDashboard
