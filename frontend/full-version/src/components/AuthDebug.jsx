'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'

export const AuthDebug = () => {
  const { data: session, status } = useSession()
  const [tokenData, setTokenData] = useState(null)
  const [storageData, setStorageData] = useState(null)

  useEffect(() => {
    // Get token from localStorage and decode it
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      setStorageData({
        access_token: token ? token.substring(0, 20) + '...' : 'Not found',
        refresh_token: localStorage.getItem('refresh_token') ? 'Stored' : 'Not found',
        user_role: localStorage.getItem('user_role'),
        user_id: localStorage.getItem('user_id'),
        username: localStorage.getItem('username')
      })
    }

    if (session?.user) {
      setTokenData({
        id: session.user.id,
        username: session.user.username,
        role: session.user.role,
        email: session.user.email,
        accessToken: session.user.accessToken ? 'Stored' : 'Not found',
        refreshToken: session.user.refreshToken ? 'Stored' : 'Not found'
      })
    }
  }, [session])

  return (
    <Box sx={{ display: 'none' }}>
      {/* Hidden debug component - shows in browser console */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            console.group('🔐 Authentication Debug Info');
            console.log('Status:', '${status}');
            console.log('Session:', ${JSON.stringify(session)});
            console.log('Token Data:', ${JSON.stringify(tokenData)});
            console.log('Storage Data:', ${JSON.stringify(storageData)});
            console.groupEnd();
          `
        }}
      />
    </Box>
  )
}

export default AuthDebug
