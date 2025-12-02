// Redux Slice for Analytics
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import analyticsService from '@/services/analyticsService'

const initialState = {
  enrollment: { data: null, loading: false, error: null },
  attendance: { data: null, loading: false, error: null },
  fees: { data: null, loading: false, error: null },
  teachers: { data: null, loading: false, error: null },
  dashboard: { data: null, loading: false, error: null },
  trends: { data: null, loading: false, error: null }
}

// Async Thunks
export const fetchEnrollmentMetrics = createAsyncThunk(
  'analytics/fetchEnrollmentMetrics',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getEnrollmentMetrics(branchId)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch enrollment metrics')
    }
  }
)

export const fetchAttendanceMetrics = createAsyncThunk(
  'analytics/fetchAttendanceMetrics',
  async ({ branchId, startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getAttendanceMetrics(branchId, startDate, endDate)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attendance metrics')
    }
  }
)

export const fetchFeeMetrics = createAsyncThunk('analytics/fetchFeeMetrics', async (branchId, { rejectWithValue }) => {
  try {
    const response = await analyticsService.getFeeMetrics(branchId)
    return response.data || response
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch fee metrics')
  }
})

export const fetchTeacherMetrics = createAsyncThunk(
  'analytics/fetchTeacherMetrics',
  async ({ branchId, teacherId }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getTeacherMetrics(branchId, teacherId)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch teacher metrics')
    }
  }
)

export const fetchDashboardSummary = createAsyncThunk(
  'analytics/fetchDashboardSummary',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getDashboardSummary(branchId)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard summary')
    }
  }
)

export const fetchTrendAnalysis = createAsyncThunk(
  'analytics/fetchTrendAnalysis',
  async ({ metricType, branchId, days }, { rejectWithValue }) => {
    try {
      const response = await analyticsService.getTrendAnalysis(metricType, branchId, days)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch trend analysis')
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  extraReducers: builder => {
    // Enrollment Metrics
    builder
      .addCase(fetchEnrollmentMetrics.pending, state => {
        state.enrollment.loading = true
        state.enrollment.error = null
      })
      .addCase(fetchEnrollmentMetrics.fulfilled, (state, action) => {
        state.enrollment.loading = false
        state.enrollment.data = action.payload
      })
      .addCase(fetchEnrollmentMetrics.rejected, (state, action) => {
        state.enrollment.loading = false
        state.enrollment.error = action.payload
      })

    // Attendance Metrics
    builder
      .addCase(fetchAttendanceMetrics.pending, state => {
        state.attendance.loading = true
        state.attendance.error = null
      })
      .addCase(fetchAttendanceMetrics.fulfilled, (state, action) => {
        state.attendance.loading = false
        state.attendance.data = action.payload
      })
      .addCase(fetchAttendanceMetrics.rejected, (state, action) => {
        state.attendance.loading = false
        state.attendance.error = action.payload
      })

    // Fee Metrics
    builder
      .addCase(fetchFeeMetrics.pending, state => {
        state.fees.loading = true
        state.fees.error = null
      })
      .addCase(fetchFeeMetrics.fulfilled, (state, action) => {
        state.fees.loading = false
        state.fees.data = action.payload
      })
      .addCase(fetchFeeMetrics.rejected, (state, action) => {
        state.fees.loading = false
        state.fees.error = action.payload
      })

    // Teacher Metrics
    builder
      .addCase(fetchTeacherMetrics.pending, state => {
        state.teachers.loading = true
        state.teachers.error = null
      })
      .addCase(fetchTeacherMetrics.fulfilled, (state, action) => {
        state.teachers.loading = false
        state.teachers.data = action.payload
      })
      .addCase(fetchTeacherMetrics.rejected, (state, action) => {
        state.teachers.loading = false
        state.teachers.error = action.payload
      })

    // Dashboard Summary
    builder
      .addCase(fetchDashboardSummary.pending, state => {
        state.dashboard.loading = true
        state.dashboard.error = null
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.dashboard.loading = false
        state.dashboard.data = action.payload
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.dashboard.loading = false
        state.dashboard.error = action.payload
      })

    // Trend Analysis
    builder
      .addCase(fetchTrendAnalysis.pending, state => {
        state.trends.loading = true
        state.trends.error = null
      })
      .addCase(fetchTrendAnalysis.fulfilled, (state, action) => {
        state.trends.loading = false
        state.trends.data = action.payload
      })
      .addCase(fetchTrendAnalysis.rejected, (state, action) => {
        state.trends.loading = false
        state.trends.error = action.payload
      })
  }
})

export default analyticsSlice.reducer
