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
  transformTrack,
  transformAlbum,
} from '@/lib/spotify';
import { MusicList, SpotifyTrack, SpotifyAlbum } from '@/types/spotify';

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
            const transformedTracks: MusicList[] = recentlyPlayedData.items.map((item: { track: SpotifyTrack }) => transformTrack(item.track));
            const uniqueTracksMap = new Map(transformedTracks.map((track: MusicList) => [track.id, track]));
            dispatch(setRecentlyPlayed(Array.from(uniqueTracksMap.values())));
          }

          if (newReleasesData && newReleasesData.albums && Array.isArray(newReleasesData.albums.items)) {
            dispatch(setNewReleases(newReleasesData.albums.items.map((item: SpotifyAlbum) => transformAlbum(item))));
          }

          if (popularTracksData && popularTracksData.tracks && Array.isArray(popularTracksData.tracks.items)) {
            dispatch(setPopularTracks(popularTracksData.tracks.items.map((item: { track: SpotifyTrack }) => transformTrack(item.track))));
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