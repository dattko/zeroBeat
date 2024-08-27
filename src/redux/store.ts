import { combineReducers,configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import modalSlice from '@redux/slice/modalSlice'
import playerSlice from '@redux/slice/playerSlice'
import spotifySlice from '@redux/slice/spotifySlice';

const rootReducer = combineReducers({
  modal: modalSlice,
  player: playerSlice,
  spotify: spotifySlice,
});


export const store = configureStore({
  reducer: rootReducer,
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;