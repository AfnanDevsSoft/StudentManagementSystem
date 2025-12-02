// Redux Slice for Reporting
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import reportingService from '@/services/reportingService'

const initialState = {
  reports: { data: [], pagination: null, loading: false, error: null },
  currentReport: { data: null, loading: false, error: null },
  generatedReports: {
    studentProgress: { data: null, loading: false, error: null },
    teacherPerformance: { data: null, loading: false, error: null },
    feeCollection: { data: null, loading: false, error: null },
    attendance: { data: null, loading: false, error: null }
  }
}

// Async Thunks
export const fetchAllReports = createAsyncThunk(
  'reporting/fetchAllReports',
  async ({ branchId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await reportingService.getAllReports(branchId, limit, offset)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch reports')
    }
  }
)

export const generateStudentProgressReport = createAsyncThunk(
  'reporting/generateStudentProgressReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await reportingService.generateStudentProgressReport(payload)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate student progress report')
    }
  }
)

export const generateTeacherPerformanceReport = createAsyncThunk(
  'reporting/generateTeacherPerformanceReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await reportingService.generateTeacherPerformanceReport(payload)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate teacher performance report')
    }
  }
)

export const generateFeeCollectionReport = createAsyncThunk(
  'reporting/generateFeeCollectionReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await reportingService.generateFeeCollectionReport(payload)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate fee collection report')
    }
  }
)

export const generateAttendanceReport = createAsyncThunk(
  'reporting/generateAttendanceReport',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await reportingService.generateAttendanceReport(payload)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate attendance report')
    }
  }
)

export const fetchReport = createAsyncThunk('reporting/fetchReport', async (reportId, { rejectWithValue }) => {
  try {
    const response = await reportingService.getReport(reportId)
    return response.data || response
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch report')
  }
})

export const deleteReport = createAsyncThunk('reporting/deleteReport', async (reportId, { rejectWithValue }) => {
  try {
    const response = await reportingService.deleteReport(reportId)
    return response
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to delete report')
  }
})

const reportingSlice = createSlice({
  name: 'reporting',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // Fetch All Reports
    builder
      .addCase(fetchAllReports.pending, state => {
        state.reports.loading = true
        state.reports.error = null
      })
      .addCase(fetchAllReports.fulfilled, (state, action) => {
        state.reports.loading = false
        state.reports.data = action.payload.data || []
        state.reports.pagination = action.payload.pagination || null
      })
      .addCase(fetchAllReports.rejected, (state, action) => {
        state.reports.loading = false
        state.reports.error = action.payload
      })

    // Generate Student Progress Report
    builder
      .addCase(generateStudentProgressReport.pending, state => {
        state.generatedReports.studentProgress.loading = true
        state.generatedReports.studentProgress.error = null
      })
      .addCase(generateStudentProgressReport.fulfilled, (state, action) => {
        state.generatedReports.studentProgress.loading = false
        state.generatedReports.studentProgress.data = action.payload.data || action.payload
      })
      .addCase(generateStudentProgressReport.rejected, (state, action) => {
        state.generatedReports.studentProgress.loading = false
        state.generatedReports.studentProgress.error = action.payload
      })

    // Generate Teacher Performance Report
    builder
      .addCase(generateTeacherPerformanceReport.pending, state => {
        state.generatedReports.teacherPerformance.loading = true
        state.generatedReports.teacherPerformance.error = null
      })
      .addCase(generateTeacherPerformanceReport.fulfilled, (state, action) => {
        state.generatedReports.teacherPerformance.loading = false
        state.generatedReports.teacherPerformance.data = action.payload.data || action.payload
      })
      .addCase(generateTeacherPerformanceReport.rejected, (state, action) => {
        state.generatedReports.teacherPerformance.loading = false
        state.generatedReports.teacherPerformance.error = action.payload
      })

    // Generate Fee Collection Report
    builder
      .addCase(generateFeeCollectionReport.pending, state => {
        state.generatedReports.feeCollection.loading = true
        state.generatedReports.feeCollection.error = null
      })
      .addCase(generateFeeCollectionReport.fulfilled, (state, action) => {
        state.generatedReports.feeCollection.loading = false
        state.generatedReports.feeCollection.data = action.payload.data || action.payload
      })
      .addCase(generateFeeCollectionReport.rejected, (state, action) => {
        state.generatedReports.feeCollection.loading = false
        state.generatedReports.feeCollection.error = action.payload
      })

    // Generate Attendance Report
    builder
      .addCase(generateAttendanceReport.pending, state => {
        state.generatedReports.attendance.loading = true
        state.generatedReports.attendance.error = null
      })
      .addCase(generateAttendanceReport.fulfilled, (state, action) => {
        state.generatedReports.attendance.loading = false
        state.generatedReports.attendance.data = action.payload.data || action.payload
      })
      .addCase(generateAttendanceReport.rejected, (state, action) => {
        state.generatedReports.attendance.loading = false
        state.generatedReports.attendance.error = action.payload
      })

    // Fetch Report
    builder
      .addCase(fetchReport.pending, state => {
        state.currentReport.loading = true
        state.currentReport.error = null
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.currentReport.loading = false
        state.currentReport.data = action.payload
      })
      .addCase(fetchReport.rejected, (state, action) => {
        state.currentReport.loading = false
        state.currentReport.error = action.payload
      })

    // Delete Report
    builder.addCase(deleteReport.fulfilled, (state, action) => {
      state.reports.data = state.reports.data.filter(report => report.reportId !== action.meta.arg)
    })
  }
})

export default reportingSlice.reducer
