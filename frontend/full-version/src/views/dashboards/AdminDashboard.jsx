'use client'

import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'

// Icon Imports
import { Icon } from '@iconify/react'

/**
 * Admin Dashboard Component
 * Shows admin-specific information from SOW:
 * - Key metrics (students, teachers, fee collection)
 * - System alerts and notifications
 * - Branch-wise performance comparison
 * - Financial overview
 * - Recent activities
 */
const AdminDashboard = () => {
  const [adminData] = useState({
    totalStudents: 450,
    totalTeachers: 35,
    totalStaff: 12,
    branches: 3
  })

  const [keyMetrics] = useState([
    {
      label: 'Total Revenue (This Month)',
      value: 'PKR 450,000',
      trend: 'up',
      percentage: 12.5,
      icon: 'ri-money-pound-circle-line',
      color: '#28A745'
    },
    {
      label: 'Fee Collection Rate',
      value: '94%',
      trend: 'up',
      percentage: 5.2,
      icon: 'ri-percent-line',
      color: '#007BFF'
    },
    {
      label: 'Attendance Average',
      value: '92%',
      trend: 'stable',
      percentage: 0,
      icon: 'ri-checkbox-circle-line',
      color: '#FFC107'
    },
    { label: 'New Admissions', value: '18', trend: 'up', percentage: 23.4, icon: 'ri-user-add-line', color: '#6F42C1' }
  ])

  const [branchPerformance] = useState([
    {
      id: 1,
      name: 'Main Campus',
      students: 200,
      teachers: 16,
      feeCollected: 320000,
      attendance: 94,
      status: 'Excellent'
    },
    {
      id: 2,
      name: 'North Branch',
      students: 150,
      teachers: 12,
      feeCollected: 85000,
      attendance: 89,
      status: 'Good'
    },
    {
      id: 3,
      name: 'South Branch',
      students: 100,
      teachers: 7,
      feeCollected: 45000,
      attendance: 91,
      status: 'Good'
    }
  ])

  const [recentActivities] = useState([
    { id: 1, activity: 'New student enrolled', timestamp: '2 hours ago', category: 'Admission' },
    { id: 2, activity: 'Fee payment received from 45 students', timestamp: '4 hours ago', category: 'Finance' },
    { id: 3, activity: 'Attendance marked for all classes', timestamp: 'Today 10:30 AM', category: 'Academic' },
    {
      id: 4,
      activity: 'New teacher added to Mathematics department',
      timestamp: 'Yesterday 3:45 PM',
      category: 'Staff'
    },
    { id: 5, activity: 'Annual exam schedule published', timestamp: '2 days ago', category: 'Academic' }
  ])

  const [systemAlerts] = useState([
    { severity: 'warning', message: '15 students have pending fee payments for December' },
    { severity: 'info', message: 'Monthly inventory review scheduled for tomorrow' }
  ])

  const [academicOverview] = useState([
    { grade: 'Grade 9', totalStudents: 120, averageScore: 78, passRate: 94 },
    { grade: 'Grade 10', totalStudents: 130, averageScore: 81, passRate: 96 },
    { grade: 'Grade 11', totalStudents: 100, averageScore: 84, passRate: 97 },
    { grade: 'Grade 12', totalStudents: 100, averageScore: 82, passRate: 95 }
  ])

  return (
    <Grid container spacing={4}>
      {/* Admin Header */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant='h5' gutterBottom>
                    Admin Dashboard
                  </Typography>
                  <Typography color='textSecondary'>Welcome back! System operational status: All OK ✓</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h6'>Total Students</Typography>
                    <Typography variant='h5' color='primary'>
                      {adminData.totalStudents}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h6'>Teachers</Typography>
                    <Typography variant='h5' color='primary'>
                      {adminData.totalTeachers}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant='h6'>Branches</Typography>
                    <Typography variant='h5' color='primary'>
                      {adminData.branches}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* System Alerts */}
      {systemAlerts.map((alert, index) => (
        <Grid item xs={12} key={index}>
          <Alert severity={alert.severity}>{alert.message}</Alert>
        </Grid>
      ))}

      {/* Key Metrics */}
      {keyMetrics.map((metric, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color='textSecondary' variant='body2'>
                  {metric.label}
                </Typography>
                <Typography variant='h6' sx={{ mt: 1 }}>
                  {metric.value}
                </Typography>
                {metric.percentage > 0 && (
                  <Typography
                    variant='body2'
                    color={metric.trend === 'up' ? 'success.main' : 'warning.main'}
                    sx={{ mt: 1 }}
                  >
                    {metric.trend === 'up' ? '↑' : '→'} {metric.percentage}%
                  </Typography>
                )}
              </Box>
              <Icon icon={metric.icon} fontSize={32} color={metric.color} />
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Branch Performance Comparison */}
      <Grid item xs={12} lg={8}>
        <Card>
          <CardHeader
            title='Branch-wise Performance'
            action={
              <Button size='small' variant='outlined'>
                View Detailed Report
              </Button>
            }
          />
          <CardContent>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Branch Name</TableCell>
                    <TableCell align='center'>Students</TableCell>
                    <TableCell align='center'>Teachers</TableCell>
                    <TableCell align='center'>Fee Collected</TableCell>
                    <TableCell align='center'>Attendance %</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {branchPerformance.map(branch => (
                    <TableRow key={branch.id}>
                      <TableCell>{branch.name}</TableCell>
                      <TableCell align='center'>{branch.students}</TableCell>
                      <TableCell align='center'>{branch.teachers}</TableCell>
                      <TableCell align='center'>PKR {branch.feeCollected.toLocaleString()}</TableCell>
                      <TableCell align='center'>
                        <Box>
                          <Typography variant='body2'>{branch.attendance}%</Typography>
                          <LinearProgress variant='determinate' value={branch.attendance} sx={{ mt: 0.5 }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant='body2'
                          sx={{
                            color: branch.status === 'Excellent' ? '#28A745' : '#FFC107',
                            fontWeight: 600
                          }}
                        >
                          {branch.status}
                        </Typography>
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
      <Grid item xs={12} lg={4}>
        <Card>
          <CardHeader title='Quick Management Actions' />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button fullWidth variant='contained' startIcon={<Icon icon='ri-user-add-line' />}>
                Add New User
              </Button>
              <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-file-pdf-line' />}>
                Generate Report
              </Button>
              <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-settings-line' />}>
                System Settings
              </Button>
              <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-database-line' />}>
                Backup Database
              </Button>
              <Button fullWidth variant='outlined' startIcon={<Icon icon='ri-mail-open-line' />}>
                Send Announcement
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Academic Overview */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader title='Academic Performance Overview' />
          <CardContent>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>Grade</TableCell>
                    <TableCell align='center'>Students</TableCell>
                    <TableCell align='center'>Avg Score</TableCell>
                    <TableCell align='center'>Pass Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {academicOverview.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.grade}</TableCell>
                      <TableCell align='center'>{row.totalStudents}</TableCell>
                      <TableCell align='center'>
                        <Typography color='primary'>{row.averageScore}%</Typography>
                      </TableCell>
                      <TableCell align='center'>
                        <Box>
                          <Typography variant='body2'>{row.passRate}%</Typography>
                          <LinearProgress variant='determinate' value={row.passRate} sx={{ mt: 0.5 }} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activities */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title='Recent Activities'
            action={
              <Button size='small' variant='outlined'>
                View All
              </Button>
            }
          />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentActivities.map(activity => (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 2,
                    borderBottom: '1px solid #e0e0e0',
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <Box>
                    <Typography variant='body2'>{activity.activity}</Typography>
                    <Typography variant='caption' color='textSecondary'>
                      {activity.timestamp}
                    </Typography>
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor:
                        activity.category === 'Finance'
                          ? '#fff3cd'
                          : activity.category === 'Admission'
                            ? '#d1ecf1'
                            : '#d4edda',
                      color:
                        activity.category === 'Finance'
                          ? '#856404'
                          : activity.category === 'Admission'
                            ? '#0c5460'
                            : '#155724'
                    }}
                  >
                    {activity.category}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Financial Summary */}
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Financial Summary' />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Icon icon='ri-money-pound-circle-line' fontSize={32} color='#28A745' />
                  <Typography variant='h6' sx={{ mt: 2 }}>
                    PKR 450,000
                  </Typography>
                  <Typography color='textSecondary' variant='body2'>
                    Total Revenue (Dec)
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Icon icon='ri-percent-line' fontSize={32} color='#007BFF' />
                  <Typography variant='h6' sx={{ mt: 2 }}>
                    94%
                  </Typography>
                  <Typography color='textSecondary' variant='body2'>
                    Fee Collection Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Icon icon='ri-wallet-line' fontSize={32} color='#FFC107' />
                  <Typography variant='h6' sx={{ mt: 2 }}>
                    PKR 27,000
                  </Typography>
                  <Typography color='textSecondary' variant='body2'>
                    Pending Dues
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Icon icon='ri-building-line' fontSize={32} color='#6F42C1' />
                  <Typography variant='h6' sx={{ mt: 2 }}>
                    PKR 1.2M
                  </Typography>
                  <Typography color='textSecondary' variant='body2'>
                    Annual Budget
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default AdminDashboard
