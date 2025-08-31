import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './blogSlice'
import authReducer from './authSlice'
import commentReducer from './commentSlice'
import themeReducer from './themeSlice'

const store = configureStore({
  reducer: {
    blog: blogReducer,
    auth: authReducer,
    comment: commentReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export { store }
