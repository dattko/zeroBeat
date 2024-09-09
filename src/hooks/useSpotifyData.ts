import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@redux/store';
import {
  setRecentlyPlayed,
  setNewReleases,
  setPopularTracks,
  setFeaturedPlaylists,
  setRandomGenreRecommendations,
  setIsLoading,
  setError,
} from '@redux/slice/spotifySlice';
import {
  getRecentlyPlayed,
  getNewReleases,
  getPopularTracks,
  getFeaturedPlaylists,
  getRandomGenreRecommendations,
} from '@/lib/spotify/api';
import { SpotifyTrack } from '@/types/spotify';
import { useSession } from 'next-auth/react';

export const useSpotifyData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { recentlyPlayed, newReleases, popularTracks, featuredPlaylists, randomGenreRecommendations, isLoading, error } = useSelector((state: RootState) => state.spotify);

  // 인증 여부 체크
  useEffect(() => {
    setIsAuthenticated(!!session);
  }, [session]);

  // 신곡 및 인기 곡 데이터 로딩
  useEffect(() => {
    const fetchMainData = async () => {
      dispatch(setIsLoading(true));
      dispatch(setError(null));

      try {
        const [newReleasesData, popularTracksData, featuredPlaylistsData, randomGenreRecommendationsDtata] = await Promise.all([
          getNewReleases(20, 0, 'KR'),
          getPopularTracks(),
          getFeaturedPlaylists(),
          getRandomGenreRecommendations(),

        ]);

        if (newReleasesData?.albums?.items) {
          dispatch(setNewReleases(newReleasesData.albums.items));
        }

        if (featuredPlaylistsData?.playlists?.items) {
          dispatch(setFeaturedPlaylists(featuredPlaylistsData.playlists.items));
        } 

        if (popularTracksData?.tracks?.items) {
          const tracks: SpotifyTrack[] = popularTracksData.tracks.items.map((item: any) => item.track);
          dispatch(setPopularTracks(tracks));
        }

        if (randomGenreRecommendationsDtata?.tracks) {
          dispatch(setRandomGenreRecommendations(randomGenreRecommendationsDtata.tracks));
        }

      } catch (error) {
        console.error('Error fetching main data:', error);
        dispatch(setError('Failed to fetch data. Please try again.'));
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    fetchMainData();
  }, [dispatch]);

  // 최근 재생 목록 로딩 (인증된 경우)
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(setRecentlyPlayed([]));
      return;
    }

    const fetchRecentlyPlayed = async () => {
      try {
        const recentlyPlayedData = await getRecentlyPlayed();
        if (recentlyPlayedData?.items) {
          const tracks: SpotifyTrack[] = recentlyPlayedData.items.map((item: { track: SpotifyTrack }) => item.track);
          const uniqueTracksMap = new Map(tracks.map((track: SpotifyTrack) => [track.id, track]));
          dispatch(setRecentlyPlayed(Array.from(uniqueTracksMap.values())));
        }
      } catch (error) {
        console.error('Error fetching recently played:', error);
        dispatch(setError('Failed to fetch recently played data.'));
      }
    };

    fetchRecentlyPlayed();
  }, [dispatch, isAuthenticated]);

  return { recentlyPlayed, newReleases, popularTracks, isLoading, error, isAuthenticated, featuredPlaylists, randomGenreRecommendations }; 
};