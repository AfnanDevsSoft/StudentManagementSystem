// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Slice Imports
import chatReducer from '@/redux-store/slices/chat'
import calendarReducer from '@/redux-store/slices/calendar'
import kanbanReducer from '@/redux-store/slices/kanban'
import emailReducer from '@/redux-store/slices/email'
import analyticsReducer from '@/redux-store/slices/analytics'
import messagingReducer from '@/redux-store/slices/messaging'
import announcementsReducer from '@/redux-store/slices/announcements'
import courseContentReducer from '@/redux-store/slices/courseContent'
import reportingReducer from '@/redux-store/slices/reporting'

export const store = configureStore({
  reducer: {
    chatReducer,
    calendarReducer,
    kanbanReducer,
    emailReducer,
    analyticsReducer,
    messagingReducer,
    announcementsReducer,
    courseContentReducer,
    reportingReducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})
