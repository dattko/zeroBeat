import { configureStore } from '@reduxjs/toolkit'
import modalSlice from '@redux/slice/modalSlice'
import authSlice from '@redux/slice/authSlice';
import { useSelector, TypedUseSelectorHook } from "react-redux";

export const store = configureStore({
  reducer: {
    modal : modalSlice,
    auth: authSlice,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
