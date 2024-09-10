import { useCallback, useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { usePlayTrack } from './usePlayTrack';
import { 
  setIsPlaying, setDeviceId, setIsPlayerReady, setIsSDKLoaded, setQueue, nextTrack, previousTrack, setVolume, setProgress, setRepeatMode, setDuration, setVisibilityChange, setCurrentTrackIndex, setCurrentTrack
} from '@redux/slice/playerSlice';
import { RootState } from '@redux/store';
import { 
  playTrack, pausePlayback, resumePlayback } from '@/lib/spotify/player';
import { getRecommendations,} from '@/lib/spotify/api';
import {SpotifySDK } from '@/types/spotify';
// import { formatTime } from '@/lib/spotify/utils';
let isInitializing = false;

export const useMusicPlayer = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { 
    isPlayerReady, deviceId, isSDKLoaded, currentTrackIndex, 
    queue, currentTrack, isPlaying, volume, progress, repeatMode , duration_ms
  } = useSelector((state: RootState) => state.player);
  const { handlePlayTrack } = usePlayTrack();
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<SpotifySDK.Player | null>(null);
  const currentIndexRef = useRef(currentTrackIndex);
  const isHandlingTrackEndRef = useRef(false);


  useEffect(() => {
    currentIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);


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
          dispatch(setProgress(position)); 
          dispatch(setDuration(duration)); 
        }
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    };
  }, [session, isSDKLoaded, dispatch]);


  const loadMoreTracks = useCallback(async () => {
    if (!currentTrack) return;

    try {
      const recommendations = await getRecommendations(currentTrack.id);
      dispatch(setQueue([...queue, ...recommendations]));
    } catch (error) {
      console.error('Error loading more tracks:', error);
      setError('Failed to load more tracks. Please try again.');
    }
  }, [currentTrack, queue, dispatch]);
  
  const handleNextTrack = useCallback(async () => {
    console.log('Handling next track. Current index:', currentIndexRef.current);
    let nextIndex = currentIndexRef.current + 1;
  
    if (nextIndex >= queue.length) {
      if (repeatMode === 2) {
        // 전체 반복 모드일 경우 첫 번째 트랙으로 돌아가기
        nextIndex = 0;
      } else {
        // 대기열의 끝에 도달했을 때 더 많은 트랙을 로드
        await loadMoreTracks();
        nextIndex = currentIndexRef.current + 1;
      }
    }
  
    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      dispatch(setCurrentTrackIndex(nextIndex));
      dispatch(setCurrentTrack(nextTrack));
      if (session && deviceId) {
        try {
          console.log('Playing next track:', nextTrack.name);
          await playTrack(session, nextTrack, isPlayerReady, deviceId);
          dispatch(setIsPlaying(true));
        } catch (err) {
          console.error('Error playing next track:', err);
          setError('Failed to play next track. Please try again.');
        }
      }
    } else {
      console.error('No next track available');
    }
  }, [queue, repeatMode, session, deviceId, isPlayerReady, dispatch, loadMoreTracks]);

  
  

  const handlePreviousTrack = useCallback(async () => {
    console.log('Handling previous track. Current index:', currentIndexRef.current);
    if (currentIndexRef.current > 0) {
      const prevIndex = currentIndexRef.current - 1;
      const prevTrack = queue[prevIndex];
      if (prevTrack) {
        dispatch(setCurrentTrackIndex(prevIndex));
        dispatch(setCurrentTrack(prevTrack));
        if (session && deviceId) {
          try {
            await playTrack(session, prevTrack, isPlayerReady, deviceId);
          } catch (err) {
            console.error('Error playing previous track:', err);
            setError('Failed to play previous track. Please try again.');
          }
        }
      }
    } else if (repeatMode === 2) {
      // 전체 반복 모드일 경우 마지막 트랙으로 이동
      const lastIndex = queue.length - 1;
      const lastTrack = queue[lastIndex];
      if (lastTrack) {
        dispatch(setCurrentTrackIndex(lastIndex));
        dispatch(setCurrentTrack(lastTrack));
        if (session && deviceId) {
          try {
            await playTrack(session, lastTrack, isPlayerReady, deviceId);
          } catch (err) {
            console.error('Error playing last track:', err);
            setError('Failed to play last track. Please try again.');
          }
        }
      }
    }
  }, [queue, repeatMode, currentIndexRef, session, deviceId, isPlayerReady, dispatch]);

  const handleTrackEnd = useCallback(async () => {
    if (isHandlingTrackEndRef.current) return;
    isHandlingTrackEndRef.current = true;

    console.log('Handling track end. Repeat mode:', repeatMode);
    try {
      switch (repeatMode) {
        case 1: // Single track repeat
          if (currentTrack) {
            console.log('Repeating current track');
            await handlePlayTrack(currentTrack, false, currentIndexRef.current);
          }
          break;
        case 0: // No repeat
        case 2: // Repeat all
          console.log('Playing next track');
          await handleNextTrack();
          break;
      }
      // 트랙 변경 후 재생 상태 확인 및 재생 시작
      dispatch(setIsPlaying(true));
      if (session && deviceId) {
        await resumePlayback(session, deviceId);
      }
    } catch (error) {
      console.error('Error handling track end:', error);
      setError('Failed to play next track. Please try again.');
    } finally {
      setTimeout(() => {
        isHandlingTrackEndRef.current = false;
      }, 1000);
    }
  }, [repeatMode, currentTrack, handlePlayTrack, handleNextTrack, session, deviceId, dispatch]);

  const handlePlayerStateChange = useCallback((state: SpotifySDK.PlaybackState | null) => {
    if (!state) return;
  
    const { position, duration, paused, track_window } = state;
    dispatch(setProgress(position));
    dispatch(setDuration(duration));
    dispatch(setIsPlaying(!paused));
  
    // 트랙이 끝났는지 정확하게 감지
    if (position === 0 && paused && track_window.previous_tracks.find(t => t.id === track_window.current_track.id)) {
      console.log('Track ended, handling next action');
      handleTrackEnd();
    }
  }, [dispatch, handleTrackEnd]);


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

  
  const handleProgressChange = async (newProgress: number) => {
    if (player) {
      try {
        const seekPosition = (newProgress / 100) * duration_ms;
        player.seek(seekPosition); 
        console.log('Seeking to:', seekPosition);
        dispatch(setProgress(seekPosition));
      } catch (err) {
        console.error('Error changing progress:', err);
        setError('Failed to change progress. Please try again.');
      }
    }
  };

  const getCurrentTime = useCallback(async (): Promise<number> => {
    if (player) {
      const state = await player.getCurrentState();
      return state ? state.position : 0;
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

  useEffect(() => {
    if (player) {
      player.addListener('player_state_changed', handlePlayerStateChange);
    }
  
    return () => {
      if (player) {
        player.removeListener('player_state_changed', handlePlayerStateChange);
      }
    };
  }, [player, handlePlayerStateChange]);
  


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
