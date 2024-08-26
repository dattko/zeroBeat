import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { 
  setCurrentTrack, setIsPlaying, setDeviceId, setIsPlayerReady, 
  setIsSDKLoaded, setQueue, nextTrack, previousTrack, setCurrentTrackIndex 
} from '@redux/slice/playerSlice';
import { RootState } from '@redux/store';
import { 
  activateDevice, playTrack, getRecommendations, 
  pausePlayback, resumePlayback 
} from '@/lib/spotify';
import { MusicList as MusicListType, SpotifySDK } from '@/types/spotify';

let isInitializing = false;

export const useMusicPlayer = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { 
    isPlayerReady, deviceId, isSDKLoaded, currentTrackIndex, 
    queue, currentTrack, isPlaying 
  } = useSelector((state: RootState) => state.player);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<SpotifySDK.Player | null>(null);

  const initializePlayer = useCallback(() => {
    if (!session?.user?.accessToken || isSDKLoaded || isInitializing) return;

    isInitializing = true;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    script.onload = () => {
      dispatch(setIsSDKLoaded(true));
      isInitializing = false;
    };

    script.onerror = () => {
      console.error('Failed to load Spotify SDK');
      setError('Failed to load Spotify SDK');
      isInitializing = false;
    };

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const newPlayer = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => { cb(session.user.accessToken); },
      });

      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        dispatch(setDeviceId(device_id));
        dispatch(setIsPlayerReady(true));
      });

      newPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        dispatch(setIsPlayerReady(false));
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    };
  }, [session, isSDKLoaded, dispatch]);

  useEffect(() => {
    initializePlayer();
  }, [initializePlayer]);

  const handlePlayTrack = async (track: MusicListType, updateQueue: boolean = true, playlistIndex: number | null = null) => {
    if (!session?.user?.accessToken) {
      setError('No access token available');
      return;
    }

    if (!isPlayerReady) {
      setError('Player is not ready. Please wait and try again.');
      return;
    }

    if (!deviceId) {
      setError('No active device found. Please refresh the page and try again.');
      return;
    }

    dispatch(setCurrentTrack(track));
    dispatch(setIsPlaying(true));

    // 플레이리스트에서 재생하는 경우 해당 인덱스를 사용, 그렇지 않으면 0으로 설정
    dispatch(setCurrentTrackIndex(playlistIndex !== null ? playlistIndex : 0));

    try {
      const isDeviceActivated = await activateDevice(session, deviceId);
      if (!isDeviceActivated) {
        throw new Error('Failed to activate device');
      }

      const isPlayed = await playTrack(session, track, isPlayerReady, deviceId);
      if (!isPlayed) {
        throw new Error('Failed to play track');
      }

      if (updateQueue) {
        // 추천 트랙 가져오기
        const recommendations = await getRecommendations(track.id);

        // 큐 초기화 후 선택한 트랙과 추천 트랙 추가
        const newQueue = [track, ...recommendations];
        dispatch(setQueue(newQueue));
      }

    } catch (err) {
      console.error('Error playing track:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };



  const handleNextTrack = async () => {
    dispatch(nextTrack());
    if (currentTrackIndex < queue.length - 1) {
      const nextTrackToPlay = queue[currentTrackIndex + 1];
      if (session && deviceId && nextTrackToPlay) {
        try {
          await playTrack(session, nextTrackToPlay, isPlayerReady, deviceId);
        } catch (err) {
          console.error('Error playing next track:', err);
          setError('Failed to play next track. Please try again.');
        }
      }
    }
  };

  const playTrackFromPlaylist = async (track: MusicListType, index: number) => {
    await handlePlayTrack(track, false, index);  
  };

  const handlePreviousTrack = async () => {
    dispatch(previousTrack());
    if (currentTrackIndex > 0) {
      const prevTrackToPlay = queue[currentTrackIndex - 1];
      if (session && deviceId && prevTrackToPlay) {
        try {
          await playTrack(session, prevTrackToPlay, isPlayerReady, deviceId);
        } catch (err) {
          console.error('Error playing previous track:', err);
          setError('Failed to play previous track. Please try again.');
        }
      }
    }
  };

  const handlePlayPause = async () => {
    if (!session) {
      setError('No session available');
      return;
    }

    try {
      if (isPlaying) {
        await pausePlayback(session);
      } else {
        await resumePlayback(session, deviceId);
      }
      dispatch(setIsPlaying(!isPlaying));
    } catch (err) {
      console.error('Error toggling play/pause:', err);
      setError('Failed to toggle play/pause. Please try again.');
    }
  };

  const loadMoreTracks = useCallback(async () => {
    if (!currentTrack) return;

    try {
      const recommendations = await getRecommendations(currentTrack.id, 20);
      dispatch(setQueue([...queue, ...recommendations]));
    } catch (error) {
      console.error('Error loading more tracks:', error);
      setError('Failed to load more tracks. Please try again.');
    }
  }, [currentTrack, queue, dispatch]);
   
  useEffect(() => {
    // 현재 트랙이 변경될 때마다 실행
    if (currentTrack && session && deviceId && isPlayerReady) {
      playTrack(session, currentTrack, isPlayerReady, deviceId)
        .catch(err => {
          console.error('Error playing track:', err);
          setError('Failed to play track. Please try again.');
        });
    }
  }, [currentTrack, session, deviceId, isPlayerReady]);

  return { handlePlayTrack, handleNextTrack, handlePreviousTrack, handlePlayPause, playTrackFromPlaylist,loadMoreTracks, error, isPlayerReady };
};