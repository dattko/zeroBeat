import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SpotifyTrack, SpotifyAlbum, SpotifyPlaylist } from '@/types/spotify';

interface SpotifyState {
  recentlyPlayed: SpotifyTrack[];
  newReleases: SpotifyAlbum[];
  popularTracks: SpotifyTrack[];
  recommendations: SpotifyTrack[];
  featuredPlaylists: SpotifyPlaylist[];
  isLoading: boolean;
  error: string | null;
}

const initialState: SpotifyState = {
  recentlyPlayed: [],
  newReleases: [],
  popularTracks: [],
  featuredPlaylists: [],
  recommendations: [],
  isLoading: false,
  error: null,
};

const spotifySlice = createSlice({
  name: 'spotify',
  initialState,
  reducers: {
    setRecentlyPlayed: (state, action: PayloadAction<SpotifyTrack[]>) => {
      state.recentlyPlayed = action.payload;
    },
    setNewReleases: (state, action: PayloadAction<SpotifyAlbum[]>) => {
      state.newReleases = action.payload;
    },
    setPopularTracks: (state, action: PayloadAction<SpotifyTrack[]>) => {
      state.popularTracks = action.payload;
    },
    setFeaturedPlaylists: (state, action: PayloadAction<SpotifyPlaylist[]>) => {
      state.featuredPlaylists = action.payload;
    },
    setRecommendations: (state, action: PayloadAction<SpotifyTrack[]>) => {
      state.recommendations = action.payload;
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
  setFeaturedPlaylists,
  setRecommendations,
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