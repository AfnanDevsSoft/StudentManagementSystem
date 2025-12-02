'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'

const TeacherPerformanceList = ({ data }) => {
  if (!data || !Array.isArray(data)) return null

  const topTeachers = Array.isArray(data) ? data.slice(0, 5) : []

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
          Top Teachers
        </Typography>

        {topTeachers.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ py: 1.5 }}>Teacher</TableCell>
                  <TableCell align='right' sx={{ py: 1.5 }}>
                    Rating
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topTeachers.map((teacher, index) => (
                  <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                    <TableCell sx={{ py: 1.5, maxWidth: 150 }}>
                      <Typography variant='body2' sx={{ fontWeight: 500, noWrap: true }}>
                        {teacher.name || `Teacher ${index + 1}`}
                      </Typography>
                    </TableCell>
                    <TableCell align='right' sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <LinearProgress
                          variant='determinate'
                          value={teacher.performanceRating || 0}
                          sx={{
                            width: 50,
                            height: 4,
                            borderRadius: 2
                          }}
                        />
                        <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 35 }}>
                          {teacher.performanceRating?.toFixed(0) || '0'}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Typography variant='body2' color='textSecondary' sx={{ textAlign: 'center', py: 3 }}>
            No teacher data available
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default TeacherPerformanceList
