import { combineReducers,configureStore } from '@reduxjs/toolkit'
import modalSlice from '@redux/slice/modalSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Combine reducers if you have multiple slices
const rootReducer = combineReducers({
  modal: modalSlice,
});


export const store = configureStore({
  reducer: rootReducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;