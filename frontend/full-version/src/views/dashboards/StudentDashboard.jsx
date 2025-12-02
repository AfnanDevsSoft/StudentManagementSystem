'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

// Icon Imports
import { Icon } from '@iconify/react'

/**
 * Student Dashboard Component
 * Shows student-specific information from SOW:
 * - Personalized timetable
 * - Upcoming assignments & deadlines
 * - Attendance summary
 * - Fee status & notifications
 * - Academic progress
 */
const StudentDashboard = () => {
  // Mock data - replace with actual API calls
  const [studentData] = useState({
    name: 'Ahmed Hassan',
    rollNumber: 'STU-2025-001',
    class: 'Grade 10-A',
    gpa: 3.8,
    attendancePercentage: 94,
    feeStatus: 'Paid',
    feeDue: 0
  })

  const [upcomingAssignments] = useState([
    { id: 1, title: 'Mathematics Project', dueDate: '2025-12-10', subject: 'Math', status: 'pending' },
    { id: 2, title: 'English Essay', dueDate: '2025-12-15', subject: 'English', status: 'pending' },
    { id: 3, title: 'Science Lab Report', dueDate: '2025-12-20', subject: 'Science', status: 'submitted' }
  ])

  const [timetable] = useState([
    { day: 'Monday', periods: ['Math', 'English', 'Science', 'History', 'PE'] },
    { day: 'Tuesday', periods: ['English', 'Math', 'Computer', 'Science', 'Art'] },
    { day: 'Wednesday', periods: ['Science', 'History', 'Math', 'English', 'Music'] },
    { day: 'Thursday', periods: ['Math', 'Science', 'PE', 'Computer', 'English'] },
    { day: 'Friday', periods: ['Assembly', 'Math', 'English', 'Science', 'Project'] }
  ])

  return (
    <Grid container spacing={4}>
      {/* Header Card */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant='h5' gutterBottom>
                    Welcome, {studentData.name}!
                  </Typography>
                  <Typography color='textSecondary'>Roll Number: {studentData.rollNumber}</Typography>
                  <Typography color='textSecondary'>Class: {studentData.class}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h6'>GPA</Typography>
                    <Typography variant='h5' color='primary'>
                      {studentData.gpa}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h6'>Attendance</Typography>
                    <Typography variant='h5' color='success.main'>
                      {studentData.attendancePercentage}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Stats */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color='textSecondary' variant='body2'>
                Attendance
              </Typography>
              <Typography variant='h6'>{studentData.attendancePercentage}%</Typography>
            </Box>
            <Icon icon='ri-checkbox-circle-line' fontSize={32} color='#28A745' />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color='textSecondary' variant='body2'>
                Fee Status
              </Typography>
              <Typography variant='h6'>{studentData.feeStatus}</Typography>
            </Box>
            <Icon icon='ri-wallet-line' fontSize={32} color='#007BFF' />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color='textSecondary' variant='body2'>
                Pending Assignments
              </Typography>
              <Typography variant='h6'>{upcomingAssignments.filter(a => a.status === 'pending').length}</Typography>
            </Box>
            <Icon icon='ri-task-2-line' fontSize={32} color='#FFC107' />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color='textSecondary' variant='body2'>
                GPA
              </Typography>
              <Typography variant='h6'>{studentData.gpa}</Typography>
            </Box>
            <Icon icon='ri-bar-chart-box-line' fontSize={32} color='#DC3545' />
          </CardContent>
        </Card>
      </Grid>

      {/* Upcoming Assignments */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Upcoming Assignments' />
          <CardContent>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Assignment</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingAssignments.map(assignment => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{assignment.subject}</TableCell>
                      <TableCell>{assignment.dueDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.status}
                          color={assignment.status === 'submitted' ? 'success' : 'warning'}
                          size='small'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Timetable */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Weekly Timetable' />
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Day</TableCell>
                    {[1, 2, 3, 4, 5].map(period => (
                      <TableCell key={period} align='center'>
                        Period {period}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timetable.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <strong>{day.day}</strong>
                      </TableCell>
                      {day.periods.map((period, periodIndex) => (
                        <TableCell key={periodIndex} align='center' sx={{ fontSize: '0.85rem' }}>
                          {period}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Academic Progress */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Academic Progress' />
          <CardContent>
            <Grid container spacing={2}>
              {['Mathematics', 'English', 'Science', 'History'].map((subject, index) => {
                const score = [92, 88, 95, 85][index]
                return (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant='body2'>{subject}</Typography>
                        <Typography variant='body2' color='primary'>
                          {score}%
                        </Typography>
                      </Box>
                      <LinearProgress variant='determinate' value={score} />
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default StudentDashboard
