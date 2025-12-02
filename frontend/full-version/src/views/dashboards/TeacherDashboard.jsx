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
import Button from '@mui/material/Button'
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
 * Teacher Dashboard Component
 * Shows teacher-specific information from SOW:
 * - Daily class schedule
 * - Quick attendance marking
 * - Pending assignments to check
 * - Class performance insights
 */
const TeacherDashboard = () => {
  const [teacherData] = useState({
    name: 'Dr. Fatima Khan',
    department: 'Mathematics',
    classes: 2,
    students: 45,
    pendingGrades: 23
  })

  const [todayClasses] = useState([
    {
      id: 1,
      className: 'Grade 10-A',
      subject: 'Algebra',
      time: '09:00 AM - 10:00 AM',
      room: 'Room 101',
      status: 'completed'
    },
    {
      id: 2,
      className: 'Grade 10-B',
      subject: 'Geometry',
      time: '11:00 AM - 12:00 PM',
      room: 'Room 102',
      status: 'upcoming'
    },
    {
      id: 3,
      className: 'Grade 11-A',
      subject: 'Calculus',
      time: '01:00 PM - 02:00 PM',
      room: 'Room 103',
      status: 'upcoming'
    }
  ])

  const [pendingAssignments] = useState([
    { id: 1, class: 'Grade 10-A', topic: 'Algebra Assignment', submitted: 32, total: 35, dueDate: '2025-12-10' },
    { id: 2, class: 'Grade 10-B', topic: 'Geometry Project', submitted: 28, total: 35, dueDate: '2025-12-15' },
    { id: 3, class: 'Grade 11-A', topic: 'Calculus Quiz', submitted: 33, total: 40, dueDate: '2025-12-08' }
  ])

  const [classPerformance] = useState([
    { name: 'Grade 10-A', average: 82, trend: 'up', students: 35 },
    { name: 'Grade 10-B', average: 78, trend: 'stable', students: 35 },
    { name: 'Grade 11-A', average: 85, trend: 'up', students: 40 }
  ])

  return (
    <Grid container spacing={4}>
      {/* Header */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant='h5' gutterBottom>
                    Welcome, {teacherData.name}!
                  </Typography>
                  <Typography color='textSecondary'>Department: {teacherData.department}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h6'>Classes</Typography>
                    <Typography variant='h5' color='primary'>
                      {teacherData.classes}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h6'>Students</Typography>
                    <Typography variant='h5' color='primary'>
                      {teacherData.students}
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
                Classes Today
              </Typography>
              <Typography variant='h6'>{todayClasses.length}</Typography>
            </Box>
            <Icon icon='ri-calendar-line' fontSize={32} color='#28A745' />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color='textSecondary' variant='body2'>
                Pending Grades
              </Typography>
              <Typography variant='h6'>{teacherData.pendingGrades}</Typography>
            </Box>
            <Icon icon='ri-file-list-line' fontSize={32} color='#FFC107' />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color='textSecondary' variant='body2'>
                Total Students
              </Typography>
              <Typography variant='h6'>{teacherData.students}</Typography>
            </Box>
            <Icon icon='ri-user-3-line' fontSize={32} color='#007BFF' />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography color='textSecondary' variant='body2'>
                Classes
              </Typography>
              <Typography variant='h6'>{teacherData.classes}</Typography>
            </Box>
            <Icon icon='ri-book-open-line' fontSize={32} color='#DC3545' />
          </CardContent>
        </Card>
      </Grid>

      {/* Today's Classes */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Today's Classes"
            action={
              <Button size='small' variant='outlined'>
                View Schedule
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Class</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {todayClasses.map(classItem => (
                    <TableRow key={classItem.id}>
                      <TableCell>{classItem.className}</TableCell>
                      <TableCell>{classItem.subject}</TableCell>
                      <TableCell>{classItem.time}</TableCell>
                      <TableCell>
                        <Chip
                          label={classItem.status}
                          color={classItem.status === 'completed' ? 'success' : 'warning'}
                          size='small'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2 }}>
              <Button variant='contained' fullWidth>
                Quick Attendance Marking
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Class Performance */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Class Performance Overview' />
          <CardContent>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Class</TableCell>
                    <TableCell align='center'>Average</TableCell>
                    <TableCell align='center'>Trend</TableCell>
                    <TableCell align='center'>Students</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classPerformance.map((cls, index) => (
                    <TableRow key={index}>
                      <TableCell>{cls.name}</TableCell>
                      <TableCell align='center'>
                        <Typography color='primary' variant='body2'>
                          {cls.average}%
                        </Typography>
                      </TableCell>
                      <TableCell align='center'>
                        {cls.trend === 'up' ? (
                          <Icon icon='ri-arrow-up-line' color='green' />
                        ) : (
                          <Icon icon='ri-check-line' color='orange' />
                        )}
                      </TableCell>
                      <TableCell align='center'>{cls.students}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Pending Assignments Review */}
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title='Pending Assignments to Review'
            action={
              <Button size='small' variant='outlined'>
                View All
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Class</TableCell>
                    <TableCell>Topic</TableCell>
                    <TableCell align='center'>Submitted</TableCell>
                    <TableCell align='center'>Total</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align='center'>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingAssignments.map(assignment => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.class}</TableCell>
                      <TableCell>{assignment.topic}</TableCell>
                      <TableCell align='center'>{assignment.submitted}</TableCell>
                      <TableCell align='center'>{assignment.total}</TableCell>
                      <TableCell>{assignment.dueDate}</TableCell>
                      <TableCell align='center'>
                        <Button size='small' variant='contained'>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Quick Actions' />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-checkbox-circle-line' />}>
                  Mark Attendance
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-file-list-line' />}>
                  Enter Grades
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-video-upload-line' />}>
                  Upload Content
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-mail-open-line' />}>
                  Send Message
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-calendar-check-line' />}>
                  Request Leave
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default TeacherDashboard
