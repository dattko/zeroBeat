import { useEffect, useState } from 'react';
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
} from '@/lib/spotify/api';
import { SpotifyTrack } from '@/types/spotify';
import { useSession } from 'next-auth/react';

export const useSpotifyData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { recentlyPlayed, newReleases, popularTracks, isLoading, error } = useSelector(
    (state: RootState) => state.spotify
  );

  useEffect(() => {
    setIsAuthenticated(!!session);
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setIsLoading(true));
      dispatch(setError(null));
      try {
        const [newReleasesData, popularTracksData] = await Promise.all([
          getNewReleases(),
          getPopularTracks(),
        ]);

        let recentlyPlayedData;
        if (isAuthenticated) {
          recentlyPlayedData = await getRecentlyPlayed();
        }

        if (isAuthenticated && recentlyPlayedData && Array.isArray(recentlyPlayedData.items)) {
          const tracks: SpotifyTrack[] = recentlyPlayedData.items.map((item: { track: SpotifyTrack }) => item.track);
          const uniqueTracksMap = new Map(tracks.map((track: SpotifyTrack) => [track.id, track]));
          dispatch(setRecentlyPlayed(Array.from(uniqueTracksMap.values())));
        } else {
          dispatch(setRecentlyPlayed([]));
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
  }, [dispatch, isAuthenticated]);

  return { recentlyPlayed, newReleases, popularTracks, isLoading, error, isAuthenticated };
};