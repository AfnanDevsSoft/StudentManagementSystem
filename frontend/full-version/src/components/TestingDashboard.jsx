'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  LinearProgress,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import HourglassTopIcon from '@mui/icons-material/HourglassTop'
import InfoIcon from '@mui/icons-material/Info'

/**
 * Visual Testing Dashboard
 * Provides UI for running and monitoring all tests
 */
export default function TestingDashboard() {
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const handleRunTests = async () => {
    setIsRunning(true)
    try {
      const { runComprehensiveTests } = await import('@/tests/integrationTests')
      const results = await runComprehensiveTests()
      setTestResults(results)
    } catch (error) {
      console.error('Test execution failed:', error)
      alert('Tests failed. Check console for details.')
    } finally {
      setIsRunning(false)
    }
  }

  const getTestStats = results => {
    if (!results) return null

    let total = 0
    let passed = 0

    Object.values(results).forEach(categoryResults => {
      if (Array.isArray(categoryResults)) {
        categoryResults.forEach(test => {
          total++
          if (test.passed) passed++
        })
      }
    })

    return { total, passed, failed: total - passed, percentage: ((passed / total) * 100).toFixed(2) }
  }

  const stats = getTestStats(testResults)

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
          🧪 Phase 2 Integration Testing Dashboard
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          Test all Phase 2 components with comprehensive integration tests
        </Typography>
      </Box>

      {/* Alert */}
      <Alert severity='info' icon={<InfoIcon />} sx={{ mb: 3 }}>
        Run comprehensive tests to verify all Phase 2 components (Analytics, Messaging, Announcements, Course Content,
        Reporting). Tests will run in parallel for optimal performance.
      </Alert>

      {/* Main Controls */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction='row' spacing={2}>
            <Button
              variant='contained'
              size='large'
              onClick={handleRunTests}
              disabled={isRunning}
              sx={{ minWidth: 200 }}
            >
              {isRunning ? '⏳ Running Tests...' : '▶ Run All Tests'}
            </Button>

            {testResults && (
              <Button
                variant='outlined'
                size='large'
                onClick={() => {
                  setTestResults(null)
                  setSelectedCategory(null)
                  console.clear()
                }}
              >
                ↻ Clear Results
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color='textSecondary' gutterBottom>
                  Total Tests
                </Typography>
                <Typography variant='h4'>{stats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color='textSecondary' gutterBottom>
                  Passed
                </Typography>
                <Typography variant='h4' color='success.main'>
                  ✅ {stats.passed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: stats.failed > 0 ? 'error.light' : 'success.light' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color='textSecondary' gutterBottom>
                  Failed
                </Typography>
                <Typography variant='h4' color={stats.failed > 0 ? 'error.main' : 'success.main'}>
                  {stats.failed > 0 ? `❌ ${stats.failed}` : `✅ 0`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color='textSecondary' gutterBottom>
                  Success Rate
                </Typography>
                <Typography variant='h4'>{stats.percentage}%</Typography>
                <LinearProgress variant='determinate' value={parseFloat(stats.percentage)} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Detailed Results */}
      {testResults && (
        <>
          <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
            📋 Test Results by Category
          </Typography>

          <Grid container spacing={2}>
            {Object.entries(testResults)
              .filter(([key]) => key !== 'summary' && Array.isArray(testResults[key]))
              .map(([category, results]) => {
                const passed = results.filter(r => r.passed).length
                const failed = results.filter(r => !r.passed).length
                const categoryStats = {
                  total: results.length,
                  passed,
                  failed,
                  percentage: ((passed / results.length) * 100).toFixed(2)
                }

                return (
                  <Grid item xs={12} md={6} key={category}>
                    <Card>
                      <CardContent>
                        {/* Category Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant='h6' sx={{ textTransform: 'capitalize' }}>
                            {category.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </Typography>
                          <Chip
                            label={`${categoryStats.passed}/${categoryStats.total}`}
                            color={categoryStats.failed === 0 ? 'success' : 'error'}
                            variant='outlined'
                          />
                        </Box>

                        {/* Progress Bar */}
                        <LinearProgress
                          variant='determinate'
                          value={parseFloat(categoryStats.percentage)}
                          sx={{ mb: 2 }}
                        />

                        {/* Test Details */}
                        <List dense>
                          {results.map((test, idx) => (
                            <ListItem key={idx} disableGutters>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                {test.passed ? (
                                  <CheckCircleIcon sx={{ color: 'success.main' }} />
                                ) : (
                                  <ErrorIcon sx={{ color: 'error.main' }} />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={test.name
                                  .replace(/test|async|await/gi, '')
                                  .replace(/([A-Z])/g, ' $1')
                                  .trim()}
                                secondary={test.error ? `Error: ${test.error}` : 'Passed'}
                                primaryTypographyProps={{ variant: 'caption' }}
                                secondaryTypographyProps={{
                                  variant: 'caption',
                                  color: test.error ? 'error' : 'textSecondary'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>

                        {/* Category Result */}
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography
                            variant='caption'
                            color={categoryStats.failed === 0 ? 'success.main' : 'error.main'}
                          >
                            {categoryStats.failed === 0
                              ? `✅ All ${categoryStats.total} tests passed`
                              : `❌ ${categoryStats.failed} of ${categoryStats.total} tests failed`}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )
              })}
          </Grid>

          {/* Overall Result */}
          <Paper sx={{ p: 3, mt: 4, bgcolor: stats.failed === 0 ? 'success.light' : 'error.light' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {stats.failed === 0 ? (
                <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
              ) : (
                <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
              )}
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                  {stats.failed === 0 ? '🎉 All Tests Passed!' : '⚠️ Some Tests Failed'}
                </Typography>
                <Typography variant='body2'>
                  {stats.failed === 0
                    ? `All ${stats.total} tests executed successfully. Your Phase 2 components are ready for production.`
                    : `${stats.failed} test(s) failed. Review the details above and check the browser console for more information.`}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Console Output */}
          <Box sx={{ mt: 4 }}>
            <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
              📊 Check Console for Detailed Logs
            </Typography>
            <Paper
              sx={{
                p: 2,
                bgcolor: '#1e1e1e',
                color: '#d4d4d4',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                overflow: 'auto',
                maxHeight: '300px',
                border: '1px solid #404040'
              }}
            >
              <Typography component='div' sx={{ color: '#4ec9b0' }}>
                {'> Open DevTools (F12) → Console tab'}
              </Typography>
              <Typography component='div' sx={{ color: '#4ec9b0' }}>
                {'> Run: await runComprehensiveTests()'}
              </Typography>
              <Typography component='div' sx={{ color: '#6a9955', mt: 1 }}>
                {'// Detailed test output will appear here'}
              </Typography>
            </Paper>
          </Box>

          {/* Next Steps */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
            <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
              ✅ Next Steps
            </Typography>
            <List>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Typography>1.</Typography>
                </ListItemIcon>
                <ListItemText
                  primary='Performance Optimization'
                  secondary='Review the optimization guide and implement code splitting'
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Typography>2.</Typography>
                </ListItemIcon>
                <ListItemText
                  primary='API Integration Testing'
                  secondary='Test with real backend APIs instead of mock data'
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Typography>3.</Typography>
                </ListItemIcon>
                <ListItemText
                  primary='User Acceptance Testing'
                  secondary='Have stakeholders test all features and collect feedback'
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Typography>4.</Typography>
                </ListItemIcon>
                <ListItemText
                  primary='Production Deployment'
                  secondary='Deploy to production with monitoring and rollback plan'
                />
              </ListItem>
            </List>
          </Box>
        </>
      )}

      {/* No Results State */}
      {!testResults && !isRunning && (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover' }}>
          <HourglassTopIcon sx={{ fontSize: 64, color: 'textSecondary', mb: 2 }} />
          <Typography variant='h6' sx={{ mb: 1 }}>
            Ready to Test
          </Typography>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 3 }}>
            Click the "Run All Tests" button above to start comprehensive testing of all Phase 2 components.
          </Typography>
          <Button variant='contained' size='large' onClick={handleRunTests}>
            Start Testing
          </Button>
        </Card>
      )}
    </Box>
  )
}
