import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MusicList } from '@/types/spotify';

interface SpotifyState {
  recentlyPlayed: MusicList[];
  newReleases: MusicList[];
  popularTracks: MusicList[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SpotifyState = {
  recentlyPlayed: [],
  newReleases: [],
  popularTracks: [],
  isLoading: false,
  error: null,
};

const spotifySlice = createSlice({
  name: 'spotify',
  initialState,
  reducers: {
    setRecentlyPlayed: (state, action: PayloadAction<MusicList[]>) => {
      state.recentlyPlayed = action.payload;
    },
    setNewReleases: (state, action: PayloadAction<MusicList[]>) => {
      state.newReleases = action.payload;
    },
    setPopularTracks: (state, action: PayloadAction<MusicList[]>) => {
      state.popularTracks = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRecentlyPlayed,
  setNewReleases,
  setPopularTracks,
  setIsLoading,
  setError,
} = spotifySlice.actions;

export default spotifySlice.reducer;

// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import spotifyReducer from './spotifySlice';

export const store = configureStore({
  reducer: {
    spotify: spotifyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;