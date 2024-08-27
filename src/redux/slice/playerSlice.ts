import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MusicList } from '@/types/spotify';

interface PlayerState {
  currentTrack: MusicList | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  shuffleOn: boolean;
  isPlayerReady: boolean;
  deviceId: string | null;
  queue: MusicList[];  // 재생목록 상태 추가
  isSDKLoaded: boolean;
  repeatMode: number; 
  currentTrackIndex: number; 
  duration: number; 
  recommendations: { [key: string]: MusicList[] };
  currentTime: number;
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
  currentTrackIndex: -1,
  recommendations: {},
  duration: 0,
  currentTime: 0,
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
      state.queue.push(action.payload);
    },
    removeFromQueue: (state, action: PayloadAction<string>) => {
      state.queue = state.queue.filter(track => track.uri !== action.payload);
    },
    clearQueue: (state) => {
      state.queue = [];
    },
    setQueue: (state, action: PayloadAction<MusicList[]>) => {
      state.queue = action.payload;
    },
    setIsSDKLoaded: (state, action: PayloadAction<boolean>) => {
      state.isSDKLoaded = action.payload;
    },
    setCurrentTrackIndex: (state, action: PayloadAction<number>) => {
      state.currentTrackIndex = action.payload;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    nextTrack: (state) => {
      if (state.currentTrackIndex < state.queue.length - 1) {
        state.currentTrackIndex += 1;
        state.currentTrack = state.queue[state.currentTrackIndex];
      } else if (state.repeatMode === 2) {  // Repeat all
        state.currentTrackIndex = 0;
        state.currentTrack = state.queue[0];
      }
    },
    previousTrack: (state) => {
      if (state.currentTrackIndex > 0) {
        state.currentTrackIndex -= 1;
        state.currentTrack = state.queue[state.currentTrackIndex];
      } else if (state.repeatMode === 2) {  // Repeat all
        state.currentTrackIndex = state.queue.length - 1;
        state.currentTrack = state.queue[state.currentTrackIndex];
      }
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
  setQueue,
  setIsSDKLoaded,
  setCurrentTrackIndex,
  setDuration, 
  nextTrack,
  previousTrack,
  setCurrentTime
} = playerSlice.actions;

export default playerSlice.reducer;
