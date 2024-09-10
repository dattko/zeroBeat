import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { AppDispatch, RootState } from '@redux/store';
import * as spotifyActions from '@redux/slice/spotifySlice';
import * as spotifyAPI from '@/lib/spotify/api';
import { SpotifyTrack } from '@/types/spotify';

const POPULAR_GENRES = [
  'pop', 'rock', 'hip-hop', 'electronic', 'classical', 'jazz', 'r-n-b', 'country',
  'indie', 'alternative', 'dance', 'latin', 'metal', 'folk', 'blues'
];

type DataType = 'recentlyPlayed' | 'newReleases' | 'popularTracks' | 'featuredPlaylists' | 'randomGenreRecommendations';

interface FetchConfig {
  action: Function;
  apiCall: Function;
  dataExtractor: (data: any) => any;
  errorMessage: string;
}

export const useSpotifyData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const spotifyState = useSelector((state: RootState) => state.spotify);

  const [loading, setLoading] = useState<Record<DataType, boolean>>({
    recentlyPlayed: false,
    newReleases: false,
    popularTracks: false,
    featuredPlaylists: false,
    randomGenreRecommendations: false,
  });
  const [error, setError] = useState<Record<DataType, string | null>>({
    recentlyPlayed: null,
    newReleases: null,
    popularTracks: null,
    featuredPlaylists: null,
    randomGenreRecommendations: null,
  });

  const isAuthenticated = useMemo(() => !!session, [session]);

  const fetchConfig: Record<DataType, FetchConfig> = {
    recentlyPlayed: {
      action: spotifyActions.setRecentlyPlayed,
      apiCall: spotifyAPI.getRecentlyPlayed,
      dataExtractor: (data) => {
        const tracks: SpotifyTrack[] = data.items.map((item: { track: SpotifyTrack }) => item.track);
        const uniqueTracksMap = new Map(tracks.map((track: SpotifyTrack) => [track.id, track]));
        return Array.from(uniqueTracksMap.values());
      },
      errorMessage: '최근 재생 데이터를 가져오는데 실패했습니다.',
    },
    newReleases: {
      action: spotifyActions.setNewReleases,
      apiCall: () => spotifyAPI.getNewReleases(20, 0, 'KR'),
      dataExtractor: (data) => data.albums.items,
      errorMessage: '새 릴리즈 데이터를 가져오는데 실패했습니다.',
    },
    popularTracks: {
      action: spotifyActions.setPopularTracks,
      apiCall: spotifyAPI.getPopularTracks,
      dataExtractor: (data) => data.tracks.items.map((item: any) => item.track),
      errorMessage: '인기 트랙 데이터를 가져오는데 실패했습니다.',
    },
    featuredPlaylists: {
      action: spotifyActions.setFeaturedPlaylists,
      apiCall: spotifyAPI.getFeaturedPlaylists,
      dataExtractor: (data) => data.playlists.items,
      errorMessage: '추천 플레이리스트 데이터를 가져오는데 실패했습니다.',
    },
    randomGenreRecommendations: {
      action: spotifyActions.setRandomGenreRecommendations,
      apiCall: () => {
        const randomGenre = POPULAR_GENRES[Math.floor(Math.random() * POPULAR_GENRES.length)];
        return spotifyAPI.fetchSpotifyAPI(`/recommendations?seed_genres=${randomGenre}&limit=20`, false);
      },
      dataExtractor: (data) => data.tracks,
      errorMessage: '랜덤 장르 추천 데이터를 가져오는데 실패했습니다.',
    },
  };

  const fetchData = useCallback(async (type: DataType) => {
    if (type === 'recentlyPlayed' && !isAuthenticated) {
      dispatch(spotifyActions.setRecentlyPlayed([]));
      return;
    }

    setLoading(prev => ({ ...prev, [type]: true }));
    setError(prev => ({ ...prev, [type]: null }));

    try {
      const config = fetchConfig[type];
      const data = await config.apiCall();
      const extractedData = config.dataExtractor(data);
      dispatch(config.action(extractedData));
    } catch (err) {
      console.error(`${type} 가져오기 오류:`, err);
      setError(prev => ({ ...prev, [type]: fetchConfig[type].errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    ['newReleases', 'popularTracks', 'featuredPlaylists', 'randomGenreRecommendations'].forEach(
      type => fetchData(type as DataType)
    );
  }, [fetchData]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData('recentlyPlayed');
    }
  }, [fetchData, isAuthenticated]);

  const refreshAll = useCallback(() => {
    Object.keys(fetchConfig).forEach(type => fetchData(type as DataType));
  }, [fetchData]);

  return {
    ...spotifyState,
    loading,
    error,
    isAuthenticated,
    refreshAll,
    ...Object.keys(fetchConfig).reduce((acc, type) => ({
      ...acc,
      [`refresh${type.charAt(0).toUpperCase() + type.slice(1)}`]: () => fetchData(type as DataType),
    }), {}),
  };
};