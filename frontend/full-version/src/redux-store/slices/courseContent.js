// Redux Slice for Course Content
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import courseContentService from '@/services/courseContentService'

const initialState = {
  content: { data: [], pagination: null, loading: false, error: null },
  published: { data: [], pagination: null, loading: false, error: null },
  popular: { data: [], loading: false, error: null },
  byType: { data: [], pagination: null, loading: false, error: null },
  searchResults: { data: [], loading: false, error: null },
  selectedContent: null
}

// Async Thunks
export const fetchCourseContent = createAsyncThunk(
  'courseContent/fetchCourseContent',
  async ({ courseId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await courseContentService.getCourseContent(courseId, limit, offset)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch course content')
    }
  }
)

export const fetchPublishedContent = createAsyncThunk(
  'courseContent/fetchPublishedContent',
  async ({ courseId, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await courseContentService.getPublishedContent(courseId, limit, offset)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch published content')
    }
  }
)

export const fetchPopularContent = createAsyncThunk(
  'courseContent/fetchPopularContent',
  async ({ courseId, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await courseContentService.getPopularContent(courseId, limit)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch popular content')
    }
  }
)

export const fetchContentByType = createAsyncThunk(
  'courseContent/fetchContentByType',
  async ({ courseId, contentType, limit = 20, offset = 0 }, { rejectWithValue }) => {
    try {
      const response = await courseContentService.getContentByType(courseId, contentType, limit, offset)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch content by type')
    }
  }
)

export const uploadContent = createAsyncThunk('courseContent/uploadContent', async (payload, { rejectWithValue }) => {
  try {
    const response = await courseContentService.uploadContent(payload)
    return response
  } catch (error) {
    return rejectWithValue(error.message || 'Failed to upload content')
  }
})

export const searchContent = createAsyncThunk(
  'courseContent/searchContent',
  async ({ courseId, searchTerm, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await courseContentService.searchContent(courseId, searchTerm, limit)
      return response.data || response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search content')
    }
  }
)

export const trackContentView = createAsyncThunk(
  'courseContent/trackContentView',
  async (contentId, { rejectWithValue }) => {
    try {
      const response = await courseContentService.trackView(contentId)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to track view')
    }
  }
)

export const setPinned = createAsyncThunk(
  'courseContent/setPinned',
  async ({ contentId, isPinned }, { rejectWithValue }) => {
    try {
      const response = await courseContentService.setPinned(contentId, isPinned)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to pin/unpin content')
    }
  }
)

const courseContentSlice = createSlice({
  name: 'courseContent',
  initialState,
  reducers: {
    setSelectedContent: (state, action) => {
      state.selectedContent = action.payload
    },
    clearSelectedContent: state => {
      state.selectedContent = null
    }
  },
  extraReducers: builder => {
    // Fetch Course Content
    builder
      .addCase(fetchCourseContent.pending, state => {
        state.content.loading = true
        state.content.error = null
      })
      .addCase(fetchCourseContent.fulfilled, (state, action) => {
        state.content.loading = false
        state.content.data = action.payload.data || []
        state.content.pagination = action.payload.pagination || null
      })
      .addCase(fetchCourseContent.rejected, (state, action) => {
        state.content.loading = false
        state.content.error = action.payload
      })

    // Fetch Published Content
    builder
      .addCase(fetchPublishedContent.pending, state => {
        state.published.loading = true
        state.published.error = null
      })
      .addCase(fetchPublishedContent.fulfilled, (state, action) => {
        state.published.loading = false
        state.published.data = action.payload.data || []
        state.published.pagination = action.payload.pagination || null
      })
      .addCase(fetchPublishedContent.rejected, (state, action) => {
        state.published.loading = false
        state.published.error = action.payload
      })

    // Fetch Popular Content
    builder
      .addCase(fetchPopularContent.pending, state => {
        state.popular.loading = true
        state.popular.error = null
      })
      .addCase(fetchPopularContent.fulfilled, (state, action) => {
        state.popular.loading = false
        state.popular.data = Array.isArray(action.payload) ? action.payload : action.payload?.data || []
      })
      .addCase(fetchPopularContent.rejected, (state, action) => {
        state.popular.loading = false
        state.popular.error = action.payload
      })

    // Fetch Content by Type
    builder
      .addCase(fetchContentByType.pending, state => {
        state.byType.loading = true
        state.byType.error = null
      })
      .addCase(fetchContentByType.fulfilled, (state, action) => {
        state.byType.loading = false
        state.byType.data = action.payload.data || []
        state.byType.pagination = action.payload.pagination || null
      })
      .addCase(fetchContentByType.rejected, (state, action) => {
        state.byType.loading = false
        state.byType.error = action.payload
      })

    // Upload Content
    builder.addCase(uploadContent.fulfilled, (state, action) => {
      if (action.payload.data) {
        state.content.data.unshift(action.payload.data)
      }
    })

    // Search Content
    builder
      .addCase(searchContent.pending, state => {
        state.searchResults.loading = true
        state.searchResults.error = null
      })
      .addCase(searchContent.fulfilled, (state, action) => {
        state.searchResults.loading = false
        state.searchResults.data = Array.isArray(action.payload) ? action.payload : action.payload?.data || []
      })
      .addCase(searchContent.rejected, (state, action) => {
        state.searchResults.loading = false
        state.searchResults.error = action.payload
      })
  }
})

export const { setSelectedContent, clearSelectedContent } = courseContentSlice.actions
export default courseContentSlice.reducer
