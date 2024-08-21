import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MusicList } from '@/types/spotify';

interface PlayerState {
  currentTrack: MusicList | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  shuffleOn: boolean;
  repeatMode: number;
  isPlayerReady: boolean; 
  deviceId: string | null;
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 50,
  progress: 0,
  shuffleOn: false,
  repeatMode: 0,
  isPlayerReady: false, 
  deviceId: null,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentTrack: (state, action: PayloadAction<MusicList>) => {
      state.currentTrack = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setVolume: (state, action: PayloadAction<number>) => {
      state.volume = action.payload;
    },
    setProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
    },
    toggleShuffle: (state) => {
      state.shuffleOn = !state.shuffleOn;
    },
    setRepeatMode: (state, action: PayloadAction<number>) => {
      state.repeatMode = action.payload;
    },
    setIsPlayerReady: (state, action: PayloadAction<boolean>) => {
      state.isPlayerReady = action.payload;
    },
    setDeviceId: (state, action: PayloadAction<string>) => {  // 새로 추가된 액션
      state.deviceId = action.payload;
    },
  },
});

export const {
  setCurrentTrack,
  setIsPlaying,
  setVolume,
  setProgress,
  toggleShuffle,
  setRepeatMode,
  setIsPlayerReady,
  setDeviceId,
} = playerSlice.actions;

export default playerSlice.reducer;