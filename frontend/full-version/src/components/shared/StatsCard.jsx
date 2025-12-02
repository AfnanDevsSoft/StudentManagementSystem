'use client'

import { Card, CardContent, Box, Typography, Grid } from '@mui/material'

/**
 * Reusable StatsCard Component
 * Displays statistics with title, value, icon, and optional trend
 */
export default function StatsCard({
  title = 'Stat Title',
  value = '0',
  icon = null,
  color = 'primary',
  trend = null,
  trendLabel = '',
  subtitle = '',
  onClick = null,
  variant = 'elevation'
}) {
  const colorMap = {
    primary: '#1976d2',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3'
  }

  const bgColorMap = {
    primary: '#e3f2fd',
    success: '#e8f5e9',
    warning: '#fff3e0',
    error: '#ffebee',
    info: '#e1f5fe'
  }

  const cardColor = colorMap[color] || color
  const bgColor = bgColorMap[color] || '#f5f5f5'

  return (
    <Card
      variant={variant}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: 3 } : {},
        height: '100%'
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box display='flex' alignItems='flex-start' justifyContent='space-between'>
          <Box flex={1}>
            <Typography variant='caption' color='textSecondary' sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Box display='flex' alignItems='baseline' gap={1} mt={1}>
              <Typography
                variant='h5'
                sx={{
                  fontWeight: 700,
                  color: cardColor
                }}
              >
                {value}
              </Typography>
              {trend && (
                <Typography
                  variant='caption'
                  sx={{
                    color: trend > 0 ? '#4caf50' : '#f44336',
                    fontWeight: 600
                  }}
                >
                  {trend > 0 ? '+' : ''}
                  {trend}% {trendLabel}
                </Typography>
              )}
            </Box>
            {subtitle && (
              <Typography variant='caption' color='textSecondary' sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                backgroundColor: bgColor,
                borderRadius: 1,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: cardColor
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
