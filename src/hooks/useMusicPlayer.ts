import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { usePlayTrack } from './usePlayTrack';
import { 
  setIsPlaying, setDeviceId, setIsPlayerReady, setIsSDKLoaded, setQueue, nextTrack, previousTrack, setVolume, setProgress, setRepeatMode, setDuration, setVisibilityChange
} from '@redux/slice/playerSlice';
import { RootState } from '@redux/store';
import { 
  playTrack, getRecommendations, pausePlayback, resumePlayback 
} from '@/lib/spotify';
import {SpotifySDK } from '@/types/spotify';

let isInitializing = false;

export const useMusicPlayer = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { 
    isPlayerReady, deviceId, isSDKLoaded, currentTrackIndex, 
    queue, currentTrack, isPlaying, volume, progress, repeatMode 
  } = useSelector((state: RootState) => state.player);
  const { handlePlayTrack } = usePlayTrack();
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

      newPlayer.addListener('player_state_changed', (state) => {
        if (state) {
          const { position, duration } = state;
          dispatch(setProgress(position / 1000)); 
          dispatch(setDuration(duration / 1000)); 
        }
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    };
  }, [session, isSDKLoaded, dispatch]);


  const handleNextTrack = async () => {
    if (repeatMode === 1) {
      // 단일 곡 반복 모드일 경우, 현재 곡을 다시 재생
      if (currentTrack) {
        await handlePlayTrack(currentTrack, false, currentTrackIndex);
      }
      return;
    }
  
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

  const handlePreviousTrack = async () => {
    if (repeatMode === 1) {
      // 단일 곡 반복 모드일 경우, 현재 곡을 다시 재생
      if (repeatMode !== 1) {
        player?.seek(0); 
      }
      return;
    }
  
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

  const handlePlayPause = useCallback(async () => {
    if (!session) {
      setError('No session available');
      return;
    }
  
    if (!currentTrack) {
      window.alert('플레이어바가 없습니다. 음악을 먼저 선택해주세요.');
      return;
    }
  
    try {
      if (isPlaying) {
        await pausePlayback(session);
        dispatch(setVisibilityChange(false));
      } else {
        await resumePlayback(session, deviceId);
        dispatch(setVisibilityChange(true));
      }
      dispatch(setIsPlaying(!isPlaying));
    } catch (err) {
      console.error('Error toggling play/pause:', err);
      setError('Failed to toggle play/pause. Please try again.');
    }
  }, [session, currentTrack, isPlaying, deviceId, dispatch]);

  const handleVolumeChange = async (volume: number) => {
    if (player) {
      try {
        await player.setVolume(volume / 100);
        dispatch(setVolume(volume));
      } catch (err) {
        console.error('Error changing volume:', err);
        setError('Failed to change volume. Please try again.');
      }
    }
  };

  const handleRepeatMode = () => {
    const newRepeatMode = (repeatMode + 1) % 3; 
    dispatch(setRepeatMode(newRepeatMode));
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
  
  const handleProgressChange = async (newProgress: number) => {
    if (player) {
      try {
        player.seek(newProgress * 1000); // 밀리초 단위로 변환
        dispatch(setProgress(newProgress)); // 상태 업데이트
      } catch (err) {
        console.error('Error changing progress:', err);
        setError('Failed to change progress. Please try again.');
      }
    }
  };

  const getCurrentTime = useCallback(async (): Promise<number> => {
    if (player) {
      const state = await player.getCurrentState();
      return state ? state.position / 1000 : 0;
    }
    return 0;
  }, [player]);

  // useEffect(() => {
  //   if (currentTrack && session && deviceId && isPlayerReady) {
  //     playTrack(session, currentTrack, isPlayerReady, deviceId)
  //       .catch(err => {
  //         console.error('Error playing track:', err);
  //         setError('Failed to play track. Please try again.');
  //       });
  //   }
  // }, [currentTrack, session, deviceId, isPlayerReady]);
  
  const restorePlayerState = useCallback(async () => {
    if (player && currentTrack && session && deviceId && isPlayerReady) {
      const state = await player.getCurrentState();
      if (state) {
        const currentPosition = state.position;
        if (isPlaying && state.paused) {
          // 재생 중이어야 하는데 일시정지 상태라면 재생을 재개
          await resumePlayback(session, deviceId);
          // 현재 위치로 이동
          player.seek(currentPosition);
        } else if (!isPlaying && !state.paused) {
          // 일시정지 상태여야 하는데 재생 중이라면 일시정지
          await pausePlayback(session);
        }
      }
    }
  }, [player, currentTrack, session, deviceId, isPlayerReady, isPlaying]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        restorePlayerState();
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
  
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [restorePlayerState]);


  return { 
    handlePlayTrack, 
    handleNextTrack, 
    handlePreviousTrack, 
    handlePlayPause, 
    handleVolumeChange,
    handleRepeatMode,
    loadMoreTracks, 
    handleProgressChange, 
    error, 
    isPlayerReady, 
    progress,
    getCurrentTime,
    initializePlayer
  };
};
