'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'

const FeeCollectionCard = ({ data }) => {
  if (!data) return null

  const totalFeeCollected = data.totalFeeCollected || 0
  const totalFeeDue = data.totalFeeDue || 0
  const totalFeeExpected = totalFeeCollected + totalFeeDue
  const collectionRate = totalFeeExpected > 0 ? (totalFeeCollected / totalFeeExpected) * 100 : 0
  const pendingAmount = totalFeeDue || 0

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Box>
            <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1 }}>
              Fee Collection
            </Typography>
            <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
              ₹{(totalFeeCollected / 100000).toFixed(1)}L
            </Typography>
          </Box>
          <Chip
            label={`${collectionRate.toFixed(1)}%`}
            color={collectionRate >= 80 ? 'success' : 'warning'}
            size='small'
            variant='outlined'
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant='caption'>Collection Rate</Typography>
            <Typography variant='caption' sx={{ fontWeight: 600 }}>
              {collectionRate.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={collectionRate}
            sx={{
              height: 6,
              borderRadius: 1,
              backgroundColor: '#f0f0f0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: collectionRate >= 80 ? '#4caf50' : '#ff9800'
              }
            }}
          />
        </Box>

        <Box>
          <Typography variant='caption' color='textSecondary' display='block'>
            Pending: ₹{(pendingAmount / 100000).toFixed(1)}L
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default FeeCollectionCard
