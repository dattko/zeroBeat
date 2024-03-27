import { configureStore } from '@reduxjs/toolkit'
import modalSlice from '@redux/slice/modalSlice'

export const store = configureStore({
  reducer: {
    modal : modalSlice,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch