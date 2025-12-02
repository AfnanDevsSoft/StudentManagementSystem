// Redux Slice for Announcements
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import announcementsService from '@/services/announcementsService'

const initialState = {
  announcements: { data: [], pagination: null, loading: false, error: null },
  pinned: { data: [], loading: false, error: null },
  upcoming: { data: [], loading: false, error: null },
  statistics: { data: null, loading: false, error: null },
  searchResults: { data: [], loading: false, error: null },
  selectedAnnouncement: null
}

// Async Thunks
export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async ({ courseId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await announcementsService.getAnnouncements(courseId, limit, offset)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch announcements')
    }
  }
)

export const fetchPinnedAnnouncements = createAsyncThunk(
  'announcements/fetchPinnedAnnouncements',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await announcementsService.getPinnedAnnouncements(courseId)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch pinned announcements')
    }
  }
)

export const fetchUpcomingAnnouncements = createAsyncThunk(
  'announcements/fetchUpcomingAnnouncements',
  async ({ courseId, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await announcementsService.getUpcomingAnnouncements(courseId, limit)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch upcoming announcements')
    }
  }
)

export const fetchAnnouncementStatistics = createAsyncThunk(
  'announcements/fetchAnnouncementStatistics',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await announcementsService.getAnnouncementStatistics(courseId)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch announcement statistics')
    }
  }
)

export const createAnnouncement = createAsyncThunk(
  'announcements/createAnnouncement',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await announcementsService.createAnnouncement(payload)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create announcement')
    }
  }
)

export const searchAnnouncements = createAsyncThunk(
  'announcements/searchAnnouncements',
  async ({ courseId, searchTerm, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await announcementsService.searchAnnouncements(courseId, searchTerm, limit)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search announcements')
    }
  }
)

export const fetchAnnouncementsByPriority = createAsyncThunk(
  'announcements/fetchAnnouncementsByPriority',
  async ({ courseId, priority, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await announcementsService.getAnnouncementsByPriority(courseId, priority, limit)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch announcements by priority')
    }
  }
)

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    setSelectedAnnouncement: (state, action) => {
      state.selectedAnnouncement = action.payload
    },
    clearSelectedAnnouncement: state => {
      state.selectedAnnouncement = null
    }
  },
  extraReducers: builder => {
    // Fetch Announcements
    builder
      .addCase(fetchAnnouncements.pending, state => {
        state.announcements.loading = true
        state.announcements.error = null
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements.loading = false
        state.announcements.data = action.payload.data || []
        state.announcements.pagination = action.payload.pagination || null
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.announcements.loading = false
        state.announcements.error = action.payload
      })

    // Fetch Pinned Announcements
    builder
      .addCase(fetchPinnedAnnouncements.pending, state => {
        state.pinned.loading = true
        state.pinned.error = null
      })
      .addCase(fetchPinnedAnnouncements.fulfilled, (state, action) => {
        state.pinned.loading = false
        state.pinned.data = Array.isArray(action.payload) ? action.payload : action.payload?.data || []
      })
      .addCase(fetchPinnedAnnouncements.rejected, (state, action) => {
        state.pinned.loading = false
        state.pinned.error = action.payload
      })

    // Fetch Upcoming Announcements
    builder
      .addCase(fetchUpcomingAnnouncements.pending, state => {
        state.upcoming.loading = true
        state.upcoming.error = null
      })
      .addCase(fetchUpcomingAnnouncements.fulfilled, (state, action) => {
        state.upcoming.loading = false
        state.upcoming.data = Array.isArray(action.payload) ? action.payload : action.payload?.data || []
      })
      .addCase(fetchUpcomingAnnouncements.rejected, (state, action) => {
        state.upcoming.loading = false
        state.upcoming.error = action.payload
      })

    // Fetch Announcement Statistics
    builder
      .addCase(fetchAnnouncementStatistics.pending, state => {
        state.statistics.loading = true
        state.statistics.error = null
      })
      .addCase(fetchAnnouncementStatistics.fulfilled, (state, action) => {
        state.statistics.loading = false
        state.statistics.data = action.payload
      })
      .addCase(fetchAnnouncementStatistics.rejected, (state, action) => {
        state.statistics.loading = false
        state.statistics.error = action.payload
      })

    // Create Announcement
    builder.addCase(createAnnouncement.fulfilled, (state, action) => {
      if (action.payload.data) {
        state.announcements.data.unshift(action.payload.data)
      }
    })

    // Search Announcements
    builder
      .addCase(searchAnnouncements.pending, state => {
        state.searchResults.loading = true
        state.searchResults.error = null
      })
      .addCase(searchAnnouncements.fulfilled, (state, action) => {
        state.searchResults.loading = false
        state.searchResults.data = Array.isArray(action.payload) ? action.payload : action.payload?.data || []
      })
      .addCase(searchAnnouncements.rejected, (state, action) => {
        state.searchResults.loading = false
        state.searchResults.error = action.payload
      })
  }
})

export const { setSelectedAnnouncement, clearSelectedAnnouncement } = announcementsSlice.actions
export default announcementsSlice.reducer
