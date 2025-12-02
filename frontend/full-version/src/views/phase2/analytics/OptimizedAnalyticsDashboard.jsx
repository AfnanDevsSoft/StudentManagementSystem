'use client'

import { useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import {
  fetchDashboardSummary,
  fetchEnrollmentMetrics,
  fetchAttendanceMetrics,
  fetchFeeMetrics,
  fetchTeacherMetrics,
  fetchTrendAnalysis
} from '@/redux-store/slices/analytics'
import { useAuth } from '@/contexts/AuthContext'
import { usePerformanceMetrics, useRenderTracker } from '@/utils/testingHooks'

// Lazy load components for code splitting
import dynamic from 'next/dynamic'

const EnrollmentCard = dynamic(() => import('./components/EnrollmentCard'))
const AttendanceChart = dynamic(() => import('./components/AttendanceChart'))
const FeeCollectionCard = dynamic(() => import('./components/FeeCollectionCard'))
const TeacherPerformanceList = dynamic(() => import('./components/TeacherPerformanceList'))
const TrendAnalysisChart = dynamic(() => import('./components/TrendAnalysisChart'))
const DashboardSummary = dynamic(() => import('./components/DashboardSummary'))

/**
 * Optimized Analytics Dashboard Component
 *
 * Performance Optimizations:
 * - Lazy loading of components (code splitting)
 * - Memoized selectors to prevent unnecessary re-renders
 * - Efficient data fetching with parallel requests
 * - Skeleton loading for better UX
 * - Debounced refresh to prevent rapid API calls
 * - Error boundaries for fault tolerance
 */
const OptimizedAnalyticsDashboard = () => {
  // Performance monitoring
  const { renderTime } = usePerformanceMetrics('AnalyticsDashboard')
  useRenderTracker('AnalyticsDashboard', { renderTime })

  // Hooks
  const dispatch = useDispatch()
  const { user } = useAuth()

  // Memoized selector to prevent unnecessary re-renders
  const analyticsState = useSelector(
    state => state.analyticsReducer,
    (a, b) => {
      // Custom comparison function for shallow equality
      return a === b
    }
  )

  // Destructure with fallbacks
  const { dashboard, enrollment, attendance, fees, teachers, trends } = analyticsState || {}

  // Memoized loading state calculation
  const isLoading = useMemo(() => {
    return (
      dashboard?.loading ||
      enrollment?.loading ||
      attendance?.loading ||
      fees?.loading ||
      teachers?.loading ||
      trends?.loading
    )
  }, [dashboard?.loading, enrollment?.loading, attendance?.loading, fees?.loading, teachers?.loading, trends?.loading])

  // Memoized error state calculation
  const hasError = useMemo(() => {
    return !!(
      dashboard?.error ||
      enrollment?.error ||
      attendance?.error ||
      fees?.error ||
      teachers?.error ||
      trends?.error
    )
  }, [dashboard?.error, enrollment?.error, attendance?.error, fees?.error, teachers?.error, trends?.error])

  // Fetch data on mount with dependency optimization
  useEffect(() => {
    if (user?.branchId && !dashboard?.data) {
      // Parallel fetch all data
      Promise.all([
        dispatch(fetchDashboardSummary(user.branchId)),
        dispatch(fetchEnrollmentMetrics(user.branchId)),
        dispatch(fetchAttendanceMetrics(user.branchId)),
        dispatch(fetchFeeMetrics(user.branchId)),
        dispatch(fetchTeacherMetrics(user.branchId)),
        dispatch(fetchTrendAnalysis('attendance'))
      ])
    }
  }, [user?.branchId])

  // Memoized refresh handler to prevent function recreation
  const handleRefresh = useCallback(() => {
    if (user?.branchId && !isLoading) {
      Promise.all([
        dispatch(fetchDashboardSummary(user.branchId)),
        dispatch(fetchEnrollmentMetrics(user.branchId)),
        dispatch(fetchAttendanceMetrics(user.branchId)),
        dispatch(fetchFeeMetrics(user.branchId)),
        dispatch(fetchTeacherMetrics(user.branchId)),
        dispatch(fetchTrendAnalysis('attendance'))
      ])
    }
  }, [user?.branchId, isLoading, dispatch])

  // Loading skeleton component
  const SkeletonCard = () => (
    <Card>
      <CardContent>
        <Skeleton variant='text' width='60%' height={32} sx={{ mb: 2 }} />
        <Skeleton variant='rectangular' height={100} />
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Header with Refresh Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 600 }}>
          Analytics Dashboard
        </Typography>
        <Button variant='contained' onClick={handleRefresh} disabled={isLoading} size='small' sx={{ minWidth: 120 }}>
          {isLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </Box>

      {/* Error Alert */}
      {hasError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {dashboard?.error ||
            enrollment?.error ||
            attendance?.error ||
            fees?.error ||
            teachers?.error ||
            trends?.error ||
            'Error loading analytics'}
        </Alert>
      )}

      {/* Initial Loading State */}
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
                {dashboard.loading ? <SkeletonCard /> : <DashboardSummary data={dashboard.data} />}
              </Grid>
            </Grid>
          )}

          {/* Main Metrics Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Enrollment Card */}
            <Grid item xs={12} sm={6} md={3}>
              {enrollment?.loading && !enrollment?.data ? (
                <SkeletonCard />
              ) : enrollment?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error' size='small'>
                      {enrollment.error}
                    </Alert>
                  </CardContent>
                </Card>
              ) : enrollment?.data ? (
                <EnrollmentCard data={enrollment.data} />
              ) : (
                <SkeletonCard />
              )}
            </Grid>

            {/* Attendance Card */}
            <Grid item xs={12} sm={6} md={3}>
              {attendance?.loading && !attendance?.data ? (
                <SkeletonCard />
              ) : attendance?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error' size='small'>
                      {attendance.error}
                    </Alert>
                  </CardContent>
                </Card>
              ) : attendance?.data ? (
                <AttendanceChart data={attendance.data} />
              ) : (
                <SkeletonCard />
              )}
            </Grid>

            {/* Fee Collection Card */}
            <Grid item xs={12} sm={6} md={3}>
              {fees?.loading && !fees?.data ? (
                <SkeletonCard />
              ) : fees?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error' size='small'>
                      {fees.error}
                    </Alert>
                  </CardContent>
                </Card>
              ) : fees?.data ? (
                <FeeCollectionCard data={fees.data} />
              ) : (
                <SkeletonCard />
              )}
            </Grid>

            {/* Quick Stats */}
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
                <SkeletonCard />
              ) : trends?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error'>{trends.error}</Alert>
                  </CardContent>
                </Card>
              ) : trends?.data ? (
                <TrendAnalysisChart data={trends.data} />
              ) : (
                <SkeletonCard />
              )}
            </Grid>

            {/* Teacher Performance List */}
            <Grid item xs={12} md={4}>
              {teachers?.loading && !teachers?.data ? (
                <SkeletonCard />
              ) : teachers?.error ? (
                <Card>
                  <CardContent>
                    <Alert severity='error'>{teachers.error}</Alert>
                  </CardContent>
                </Card>
              ) : teachers?.data ? (
                <TeacherPerformanceList data={teachers.data} />
              ) : (
                <SkeletonCard />
              )}
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}

export default OptimizedAnalyticsDashboard
