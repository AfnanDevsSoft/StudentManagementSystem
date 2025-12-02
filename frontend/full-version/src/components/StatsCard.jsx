/**
 * StatsCard Component
 * Reusable statistics card for dashboard metrics
 * Displays KPI with title, value, change, and icon
 */

'use client'

import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Card, CardContent, Box, Typography, Stack, Chip } from '@mui/material'

/**
 * StatsCard Component
 * @param {string} title - Card title
 * @param {number} value - Main metric value
 * @param {number} change - Percentage change
 * @param {string} icon - Material-UI icon component
 * @param {string} color - Chip color (primary, success, warning, error)
 * @param {string} subtitle - Additional description
 */
export default function StatsCard({
  title = 'Metric',
  value = 0,
  change = 0,
  icon: Icon = null,
  color = 'primary',
  subtitle = '',
  format = val => val.toString()
}) {
  const isPositive = change >= 0
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon

  return (
    <Card sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Header with Icon and Title */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="textSecondary" display="block">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {Icon && <Icon sx={{ fontSize: 28, color: `${color}.main` }} />}
          </Box>

          {/* Main Value */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {format(value)}
            </Typography>
          </Box>

          {/* Change Indicator */}
          {change !== undefined && (
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                icon={<TrendIcon sx={{ fontSize: 16 }} />}
                label={`${isPositive ? '+' : ''}${change}%`}
                size="small"
                color={isPositive ? 'success' : 'error'}
                variant="outlined"
              />
              <Typography variant="caption" color="textSecondary">
                from last month
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
