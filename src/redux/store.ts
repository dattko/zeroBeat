import { combineReducers,configureStore } from '@reduxjs/toolkit'
import modalSlice from '@redux/slice/modalSlice'
import playerSlice from '@redux/slice/playerSlice'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const rootReducer = combineReducers({
  modal: modalSlice,
  player: playerSlice,
});


export const store = configureStore({
  reducer: rootReducer,
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;