import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
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
  fetchSpotifyAPI,
} from '@/lib/spotify/api';
import { SpotifyTrack } from '@/types/spotify';

// 미리 정의된 인기 장르 목록
const POPULAR_GENRES = [
  'pop', 'rock', 'hip-hop', 'electronic', 'classical', 'jazz', 'r-n-b', 'country',
  'indie', 'alternative', 'dance', 'latin', 'metal', 'folk', 'blues'
];

export const useSpotifyData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { recentlyPlayed, newReleases, popularTracks, featuredPlaylists, randomGenreRecommendations, isLoading, error } = useSelector((state: RootState) => state.spotify);

  // 세션 상태에 따른 인증 여부 설정
  useEffect(() => {
    setIsAuthenticated(!!session);
  }, [session]);

  // 랜덤 장르 추천 가져오기
  const getRandomGenreRecommendations = useCallback(async (limit: number = 20) => {
    const randomGenre = POPULAR_GENRES[Math.floor(Math.random() * POPULAR_GENRES.length)];
    return fetchSpotifyAPI(`/recommendations?seed_genres=${randomGenre}&limit=${limit}`, false);
  }, []);

  // 메인 데이터 가져오기
  useEffect(() => {
    const fetchMainData = async () => {
      dispatch(setIsLoading(true));
      dispatch(setError(null));

      try {
        const [newReleasesData, popularTracksData, featuredPlaylistsData, randomGenreRecommendationsData] = await Promise.all([
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

        if (randomGenreRecommendationsData?.tracks) {
          dispatch(setRandomGenreRecommendations(randomGenreRecommendationsData.tracks));
        }

      } catch (error) {
        console.error('메인 데이터 가져오기 오류:', error);
        dispatch(setError('데이터를 가져오는데 실패했습니다. 다시 시도해 주세요.'));
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    fetchMainData();
  }, [dispatch, getRandomGenreRecommendations]);

  // 최근 재생 목록 가져오기 (인증된 경우에만)
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
        console.error('최근 재생 목록 가져오기 오류:', error);
        dispatch(setError('최근 재생 데이터를 가져오는데 실패했습니다.'));
      }
    };

    fetchRecentlyPlayed();
  }, [dispatch, isAuthenticated]);

  return { recentlyPlayed, newReleases, popularTracks, isLoading, error, isAuthenticated, featuredPlaylists, randomGenreRecommendations };
};