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
import TextField from '@mui/material/TextField'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Modal from '@mui/material/Modal'
import Backdrop from '@mui/material/Backdrop'
import Fade from '@mui/material/Fade'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Divider from '@mui/material/Divider'
import {
  fetchInbox,
  fetchSentMessages,
  fetchUnreadCount,
  sendMessage,
  searchMessages,
  setSelectedMessage
} from '@/redux-store/slices/messaging'

// Icon Imports
import { Mail, MailOpen, Send, Search, Plus } from 'lucide-react'

// Local Imports
import { useAuth } from '@/contexts/AuthContext'

const MessagingSystem = () => {
  // Hooks
  const dispatch = useDispatch()
  const { user } = useAuth()

  // Redux State
  const messagingState = useSelector(state => state.messagingReducer)
  const { inbox, sent, unreadCount, selectedMessage, searchResults, loading, error } = messagingState || {}

  // Local State
  const [tabValue, setTabValue] = useState(0)
  const [openCompose, setOpenCompose] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [composeData, setComposeData] = useState({
    recipientId: '',
    subject: '',
    messageBody: ''
  })

  // Fetch data on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchInbox(user.id))
      dispatch(fetchUnreadCount(user.id))
    }
  }, [dispatch, user])

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    if (newValue === 1 && user?.id) {
      dispatch(fetchSentMessages(user.id))
    }
  }

  // Handle search
  const handleSearch = () => {
    if (searchTerm && user?.id) {
      dispatch(searchMessages({ userId: user.id, searchTerm }))
    }
  }

  // Handle compose
  const handleCompose = () => {
    if (composeData.recipientId && composeData.subject && composeData.messageBody && user?.id) {
      dispatch(
        sendMessage({
          senderId: user.id,
          recipientId: composeData.recipientId,
          subject: composeData.subject,
          messageBody: composeData.messageBody
        })
      )
      setComposeData({ recipientId: '', subject: '', messageBody: '' })
      setOpenCompose(false)
    }
  }

  const displayMessages = searchResults && searchResults.length > 0 ? searchResults : (tabValue === 0 ? inbox : sent) || []

  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 600, mb: 0.5 }}>
            Messaging System
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            {tabValue === 0 ? (
              <>
                <MailOpen size={16} style={{ display: 'inline', marginRight: 4 }} />
                Unread: {unreadCount || 0}
              </>
            ) : (
              <>
                <Send size={16} style={{ display: 'inline', marginRight: 4 }} />
                Sent Messages
              </>
            )}
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<Plus size={18} />}
          onClick={() => setOpenCompose(true)}
        >
          New Message
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Message List */}
        <Grid item xs={12} md={8}>
          <Card>
            {/* Search Bar */}
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  placeholder='Search messages...'
                  size='small'
                  fullWidth
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  variant='outlined'
                  size='small'
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <Search size={18} />
                </Button>
              </Box>
            </CardContent>

            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`Inbox (${unreadCount || 0})`} />
              <Tab label='Sent' />
            </Tabs>

            {/* Message List */}
            <CardContent sx={{ p: 0 }}>
              {loading && !displayMessages?.length ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : displayMessages && displayMessages.length > 0 ? (
                <List disablePadding>
                  {displayMessages.map((message, index) => (
                    <Box key={index}>
                      <ListItemButton
                        sx={{
                          px: 2,
                          py: 1.5,
                          backgroundColor: message.isRead === false ? '#f5f5f5' : 'transparent',
                          '&:hover': { backgroundColor: '#fafafa' }
                        }}
                        onClick={() => dispatch(setSelectedMessage(message))}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                            {message.senderName?.[0] || 'U'}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography
                                variant='body2'
                                sx={{ fontWeight: message.isRead === false ? 700 : 500 }}
                              >
                                {message.subject || 'No Subject'}
                              </Typography>
                              {message.isRead === false && (
                                <Chip label='New' size='small' color='primary' variant='outlined' />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography variant='caption' color='textSecondary' noWrap>
                              {message.messageBody || 'No content'}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                      {index < displayMessages.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Mail size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
                  <Typography variant='body2' color='textSecondary'>
                    No messages yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Message Details */}
        <Grid item xs={12} md={4}>
          {selectedMessage ? (
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
                  {selectedMessage.subject || 'No Subject'}
                </Typography>

                <Box sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1 }}>
                    From
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {selectedMessage.senderName || 'Unknown'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1 }}>
                    Date
                  </Typography>
                  <Typography variant='body2'>
                    {new Date(selectedMessage.createdAt || Date.now()).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant='caption' color='textSecondary' display='block' sx={{ mb: 1 }}>
                    Message
                  </Typography>
                  <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.messageBody || 'No content'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Mail size={40} style={{ opacity: 0.5, marginBottom: 16 }} />
                <Typography variant='body2' color='textSecondary'>
                  Select a message to view details
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Compose Modal */}
      <Modal
        open={openCompose}
        onClose={() => setOpenCompose(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openCompose}>
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
                Compose Message
              </Typography>

              <TextField
                label='Recipient ID'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                value={composeData.recipientId}
                onChange={e => setComposeData({ ...composeData, recipientId: e.target.value })}
              />

              <TextField
                label='Subject'
                fullWidth
                size='small'
                sx={{ mb: 2 }}
                value={composeData.subject}
                onChange={e => setComposeData({ ...composeData, subject: e.target.value })}
              />

              <TextField
                label='Message'
                fullWidth
                multiline
                rows={4}
                sx={{ mb: 2 }}
                value={composeData.messageBody}
                onChange={e => setComposeData({ ...composeData, messageBody: e.target.value })}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant='contained'
                  fullWidth
                  onClick={handleCompose}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                  Send
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={() => setOpenCompose(false)}
                  disabled={loading}
                >
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

export default MessagingSystem
