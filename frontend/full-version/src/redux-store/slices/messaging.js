// Redux Slice for Messaging
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import messagingService from '@/services/messagingService'

const initialState = {
  inbox: { data: [], pagination: null, loading: false, error: null },
  sent: { data: [], pagination: null, loading: false, error: null },
  conversation: { data: [], loading: false, error: null },
  unreadCount: { data: 0, loading: false, error: null },
  searchResults: { data: [], loading: false, error: null },
  selectedMessage: null
}

// Async Thunks
export const fetchInbox = createAsyncThunk(
  'messaging/fetchInbox',
  async ({ userId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await messagingService.getInbox(userId, limit, offset)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch inbox')
    }
  }
)

export const fetchSentMessages = createAsyncThunk(
  'messaging/fetchSentMessages',
  async ({ userId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await messagingService.getSentMessages(userId, limit, offset)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch sent messages')
    }
  }
)

export const fetchConversation = createAsyncThunk(
  'messaging/fetchConversation',
  async ({ userId, otherUserId, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await messagingService.getConversation(userId, otherUserId, limit)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch conversation')
    }
  }
)

export const fetchUnreadCount = createAsyncThunk('messaging/fetchUnreadCount', async (userId, { rejectWithValue }) => {
  try {
    const response = await messagingService.getUnreadCount(userId)
    return response.data || response
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to fetch unread count')
  }
})

export const sendMessage = createAsyncThunk('messaging/sendMessage', async (payload, { rejectWithValue }) => {
  try {
    const response = await messagingService.sendMessage(payload)
    return response
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to send message')
  }
})

export const markAsRead = createAsyncThunk('messaging/markAsRead', async (messageId, { rejectWithValue }) => {
  try {
    const response = await messagingService.markAsRead(messageId)
    return response
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to mark as read')
  }
})

export const searchMessages = createAsyncThunk(
  'messaging/searchMessages',
  async ({ userId, searchTerm, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await messagingService.searchMessages(userId, searchTerm, limit)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search messages')
    }
  }
)

const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setSelectedMessage: (state, action) => {
      state.selectedMessage = action.payload
    },
    clearSelectedMessage: state => {
      state.selectedMessage = null
    }
  },
  extraReducers: builder => {
    // Fetch Inbox
    builder
      .addCase(fetchInbox.pending, state => {
        state.inbox.loading = true
        state.inbox.error = null
      })
      .addCase(fetchInbox.fulfilled, (state, action) => {
        state.inbox.loading = false
        state.inbox.data = action.payload.data || []
        state.inbox.pagination = action.payload.pagination || null
      })
      .addCase(fetchInbox.rejected, (state, action) => {
        state.inbox.loading = false
        state.inbox.error = action.payload
      })

    // Fetch Sent Messages
    builder
      .addCase(fetchSentMessages.pending, state => {
        state.sent.loading = true
        state.sent.error = null
      })
      .addCase(fetchSentMessages.fulfilled, (state, action) => {
        state.sent.loading = false
        state.sent.data = action.payload.data || []
        state.sent.pagination = action.payload.pagination || null
      })
      .addCase(fetchSentMessages.rejected, (state, action) => {
        state.sent.loading = false
        state.sent.error = action.payload
      })

    // Fetch Conversation
    builder
      .addCase(fetchConversation.pending, state => {
        state.conversation.loading = true
        state.conversation.error = null
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.conversation.loading = false
        state.conversation.data = Array.isArray(action.payload) ? action.payload : action.payload?.data || []
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.conversation.loading = false
        state.conversation.error = action.payload
      })

    // Fetch Unread Count
    builder
      .addCase(fetchUnreadCount.pending, state => {
        state.unreadCount.loading = true
        state.unreadCount.error = null
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount.loading = false
        state.unreadCount.data = action.payload?.unreadCount || 0
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.unreadCount.loading = false
        state.unreadCount.error = action.payload
      })

    // Send Message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      // Message sent successfully
      if (action.payload.data) {
        state.inbox.data.unshift(action.payload.data)
      }
    })

    // Search Messages
    builder
      .addCase(searchMessages.pending, state => {
        state.searchResults.loading = true
        state.searchResults.error = null
      })
      .addCase(searchMessages.fulfilled, (state, action) => {
        state.searchResults.loading = false
        state.searchResults.data = Array.isArray(action.payload) ? action.payload : action.payload?.data || []
      })
      .addCase(searchMessages.rejected, (state, action) => {
        state.searchResults.loading = false
        state.searchResults.error = action.payload
      })
  }
})

export const { setSelectedMessage, clearSelectedMessage } = messagingSlice.actions
export default messagingSlice.reducer
