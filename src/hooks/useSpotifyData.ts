import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import {
  setRecentlyPlayed,
  setNewReleases,
  setPopularTracks,
  setIsLoading,
  setError,
} from '@redux/slice/spotifySlice';
import {
  getRecentlyPlayed,
  getNewReleases,
  getPopularTracks,
} from '@/lib/spotify';
import { SpotifyTrack } from '@/types/spotify';

export const useSpotifyData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { recentlyPlayed, newReleases, popularTracks, isLoading, error } = useSelector(
    (state: RootState) => state.spotify
  );

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setIsLoading(true));
      dispatch(setError(null));
      try {
        const [recentlyPlayedData, newReleasesData, popularTracksData] = await Promise.all([
          getRecentlyPlayed(),
          getNewReleases(),
          getPopularTracks(),
        ]);

      
        if (recentlyPlayedData && Array.isArray(recentlyPlayedData.items)) {
          const tracks: SpotifyTrack[] = recentlyPlayedData.items.map((item: { track: SpotifyTrack }) => item.track);
          const uniqueTracksMap = new Map(tracks.map((track: SpotifyTrack) => [track.id, track]));
          dispatch(setRecentlyPlayed(Array.from(uniqueTracksMap.values())));
        }


        if (newReleasesData && newReleasesData.albums && Array.isArray(newReleasesData.albums.items)) {
          dispatch(setNewReleases(newReleasesData.albums.items));
        }

       
        if (popularTracksData && popularTracksData.tracks && Array.isArray(popularTracksData.tracks.items)) {
          const tracks: SpotifyTrack[] = popularTracksData.tracks.items.map((item: any) => item.track);
          dispatch(setPopularTracks(tracks));
        } 

      } catch (error) {
        console.error('Error fetching data:', error);
        dispatch(setError('Failed to fetch data. Please try again.'));
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    fetchData();
  }, [dispatch]);

  return { recentlyPlayed, newReleases, popularTracks, isLoading, error };
};