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
  queue: MusicList[];  // 재생목록 상태 추가
  isSDKLoaded: boolean;
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
  queue: [],  // 초기값으로 빈 배열 추가
  isSDKLoaded: false,
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
    setDeviceId: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload;
    },
    addToQueue: (state, action: PayloadAction<MusicList>) => {
      state.queue.push(action.payload);  // 재생목록에 트랙 추가
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(track => track.uri !== action.payload); 
    },
    clearQueue: (state) => {
      state.queue = [];  
    },
    setIsSDKLoaded: (state, action: PayloadAction<boolean>) => {
      state.isSDKLoaded = action.payload;
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
  addToQueue,
  removeFromQueue,
  clearQueue,
  setIsSDKLoaded
} = playerSlice.actions;

export default playerSlice.reducer;
