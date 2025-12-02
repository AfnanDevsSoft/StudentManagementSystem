'use client'

// React Imports
import { useEffect, useState } from 'react'

// Redux Imports
import { useDispatch, useSelector } from 'react-redux'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import {
  fetchAllReports,
  generateStudentProgressReport,
  generateTeacherPerformanceReport,
  generateFeeCollectionReport,
  generateAttendanceReport,
  deleteReport,
  fetchReport
} from '@/redux-store/slices/reporting'

// Icon Imports
import { FileText, Download, Trash2, Plus, Calendar, Clock } from 'lucide-react'

// Local Imports
import { useAuth } from '@/contexts/AuthContext'

const ReportingInterface = () => {
  // Hooks
  const dispatch = useDispatch()
  const { user } = useAuth()

  // Redux State
  const reportingState = useSelector(state => state.reportingReducer)
  const { reports, loading, error, studentProgress, teacherPerformance, feeCollection, attendance } =
    reportingState || {}

  // Local State
  const [openGenerateReport, setOpenGenerateReport] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('student-progress')
  const [reportParams, setReportParams] = useState({
    startDate: '',
    endDate: '',
    studentId: '',
    teacherId: '',
    branchId: ''
  })

  // Fetch reports on mount
  useEffect(() => {
    if (user?.branchId) {
      dispatch(fetchAllReports({ branchId: user.branchId }))
      setReportParams({ ...reportParams, branchId: user.branchId })
    }
  }, [dispatch, user])

  // Handle generate report
  const handleGenerateReport = () => {
    if (reportParams.startDate && reportParams.endDate) {
      const params = {
        branchId: user.branchId,
        startDate: reportParams.startDate,
        endDate: reportParams.endDate,
        ...(reportParams.studentId && { studentId: reportParams.studentId }),
        ...(reportParams.teacherId && { teacherId: reportParams.teacherId })
      }

      switch (selectedReportType) {
        case 'student-progress':
          dispatch(generateStudentProgressReport(params))
          break
        case 'teacher-performance':
          dispatch(generateTeacherPerformanceReport(params))
          break
        case 'fee-collection':
          dispatch(generateFeeCollectionReport(params))
          break
        case 'attendance':
          dispatch(generateAttendanceReport(params))
          break
        default:
          break
      }

      setOpenGenerateReport(false)
      setReportParams({ startDate: '', endDate: '', studentId: '', teacherId: '', branchId: user.branchId })
    }
  }

  // Handle delete report
  const handleDeleteReport = reportId => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      dispatch(deleteReport(reportId))
    }
  }

  // Handle download report
  const handleDownloadReport = report => {
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank')
    }
  }

  // Get status color
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  // Get report type label
  const getReportTypeLabel = type => {
    const labels = {
      'student-progress': 'Student Progress',
      'teacher-performance': 'Teacher Performance',
      'fee-collection': 'Fee Collection',
      attendance: 'Attendance'
    }
    return labels[type] || type
  }

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 600, mb: 0.5 }}>
            Reporting Interface
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            <FileText size={16} style={{ display: 'inline', marginRight: 4 }} />
            {reports?.length || 0} Total Reports
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<Plus size={18} />} onClick={() => setOpenGenerateReport(true)}>
          Generate Report
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant='body2' color='textSecondary' sx={{ mb: 1 }}>
              Generated
            </Typography>
            <Typography variant='h6'>{reports?.filter(r => r.status === 'completed').length || 0}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant='body2' color='textSecondary' sx={{ mb: 1 }}>
              Pending
            </Typography>
            <Typography variant='h6' sx={{ color: 'warning.main' }}>
              {reports?.filter(r => r.status === 'pending').length || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant='body2' color='textSecondary' sx={{ mb: 1 }}>
              Failed
            </Typography>
            <Typography variant='h6' color='error'>
              {reports?.filter(r => r.status === 'failed').length || 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant='body2' color='textSecondary' sx={{ mb: 1 }}>
              This Month
            </Typography>
            <Typography variant='h6' color='primary'>
              {reports?.filter(r => {
                const reportDate = new Date(r.createdAt)
                const today = new Date()
                return reportDate.getMonth() === today.getMonth() && reportDate.getFullYear() === today.getFullYear()
              }).length || 0}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <Card>
        <CardContent>
          {loading && !reports?.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : reports && reports.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Report Type
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Created
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Period
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((report, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Typography variant='body2'>{getReportTypeLabel(report.reportType)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{new Date(report.createdAt).toLocaleDateString()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {new Date(report.startDate).toLocaleDateString()} -{' '}
                          {new Date(report.endDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.status}
                          size='small'
                          color={getStatusColor(report.status)}
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell align='right'>
                        <Stack direction='row' spacing={1} justifyContent='flex-end'>
                          {report.status === 'completed' && (
                            <Button
                              size='small'
                              variant='text'
                              startIcon={<Download size={16} />}
                              onClick={() => handleDownloadReport(report)}
                            >
                              Download
                            </Button>
                          )}
                          <Button
                            size='small'
                            variant='text'
                            color='error'
                            startIcon={<Trash2 size={16} />}
                            onClick={() => handleDeleteReport(report.reportId)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <FileText size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
              <Typography variant='body2' color='textSecondary'>
                No reports generated yet
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Generate Report Modal */}
      <Modal
        open={openGenerateReport}
        onClose={() => setOpenGenerateReport(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openGenerateReport}>
          <Card
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <CardContent>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
                Generate Report
              </Typography>

              <FormControl fullWidth size='small' sx={{ mb: 2 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={selectedReportType}
                  label='Report Type'
                  onChange={e => setSelectedReportType(e.target.value)}
                >
                  <MenuItem value='student-progress'>Student Progress</MenuItem>
                  <MenuItem value='teacher-performance'>Teacher Performance</MenuItem>
                  <MenuItem value='fee-collection'>Fee Collection</MenuItem>
                  <MenuItem value='attendance'>Attendance</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label='Start Date'
                type='date'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                value={reportParams.startDate}
                onChange={e => setReportParams({ ...reportParams, startDate: e.target.value })}
              />

              <TextField
                label='End Date'
                type='date'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
                value={reportParams.endDate}
                onChange={e => setReportParams({ ...reportParams, endDate: e.target.value })}
              />

              {selectedReportType === 'student-progress' && (
                <TextField
                  label='Student ID (optional)'
                  fullWidth
                  size='small'
                  sx={{ mb: 2 }}
                  value={reportParams.studentId}
                  onChange={e => setReportParams({ ...reportParams, studentId: e.target.value })}
                />
              )}

              {selectedReportType === 'teacher-performance' && (
                <TextField
                  label='Teacher ID (optional)'
                  fullWidth
                  size='small'
                  sx={{ mb: 2 }}
                  value={reportParams.teacherId}
                  onChange={e => setReportParams({ ...reportParams, teacherId: e.target.value })}
                />
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleGenerateReport}
                  disabled={loading || !reportParams.startDate || !reportParams.endDate}
                >
                  {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Generate
                </Button>
                <Button variant='outlined' fullWidth onClick={() => setOpenGenerateReport(false)} disabled={loading}>
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Modal>
    </Box>
  )
}

export default ReportingInterface
