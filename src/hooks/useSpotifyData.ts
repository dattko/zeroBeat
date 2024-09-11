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

// 로컬 스토리지에서 기존 트랙 목록과 날짜를 불러오는 함수
const getStoredTracks = () => {
  try {
    const storedTracks = localStorage.getItem('randomTracks');
    const storedDate = localStorage.getItem('randomTracksDate');
    
    if (storedTracks && storedDate) {
      const today = new Date().toISOString().split('T')[0];
      if (today === storedDate) {
        return JSON.parse(storedTracks);
      }
    }
  } catch (err) {
    console.error("로컬 스토리지에서 데이터를 가져오지 못했습니다.", err);
  }
  return null;
};

// 새로운 트랙 목록을 로컬 스토리지에 저장하는 함수
const storeTracks = (tracks: SpotifyTrack[]) => {
  localStorage.setItem('randomTracks', JSON.stringify(tracks));
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('randomTracksDate', today); // 저장된 날짜를 기록
};

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
      apiCall: async () => {
        // 먼저 로컬 스토리지에 저장된 트랙 목록을 확인
        const storedTracks = getStoredTracks();
        if (storedTracks) {
          return { tracks: storedTracks }; // 저장된 트랙 목록 반환
        }
    
        // 저장된 트랙이 없으면, 무작위 장르를 선택하여 API 호출
        const randomGenre = POPULAR_GENRES[Math.floor(Math.random() * POPULAR_GENRES.length)];
        const data = await spotifyAPI.fetchSpotifyAPI(`/recommendations?seed_genres=${randomGenre}&limit=20`, false);
    
        // 새로 가져온 트랙 목록을 로컬 스토리지에 저장
        storeTracks(data.tracks);
        
        return data; // 반환
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

      if (!data) {
        throw new Error('API로부터 유효한 데이터를 받지 못했습니다.');
      }

      const extractedData = config.dataExtractor(data);
      dispatch(config.action(extractedData));
    } catch (err) {
      console.error(`${type} 데이터 가져오기 실패:`, err);
      setError(prev => ({ ...prev, [type]: fetchConfig[type].errorMessage })); // 에러 발생 시 메시지 설정
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