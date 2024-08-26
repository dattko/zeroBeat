import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { 
  setCurrentTrack, setIsPlaying, setDeviceId, setIsPlayerReady, 
  setIsSDKLoaded, setQueue, nextTrack, previousTrack, setCurrentTrackIndex,
  setVolume, setProgress, setRepeatMode, setDuration
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
    queue, currentTrack, isPlaying, volume, progress, repeatMode 
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
  
      // 단일 곡 반복 모드에서는 곡의 시작으로 되돌리기 제거
      if (repeatMode === 1 && player) {
        player.seek(0);
      }
  
      if (updateQueue) {
        const recommendations = await getRecommendations(track.id);
        const newQueue = [track, ...recommendations];
        dispatch(setQueue(newQueue));
      }
  
    } catch (err) {
      console.error('Error playing track:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const playTrackFromPlaylist = async (track: MusicListType, index: number) => {
    await handlePlayTrack(track, false, index);  
  };

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

  useEffect(() => {
    if (currentTrack && session && deviceId && isPlayerReady) {
      playTrack(session, currentTrack, isPlayerReady, deviceId)
        .catch(err => {
          console.error('Error playing track:', err);
          setError('Failed to play track. Please try again.');
        });
    }
  }, [currentTrack, session, deviceId, isPlayerReady]);

  return { 
    handlePlayTrack, 
    handleNextTrack, 
    handlePreviousTrack, 
    handlePlayPause, 
    playTrackFromPlaylist,
    handleVolumeChange,
    handleRepeatMode,
    loadMoreTracks, 
    handleProgressChange, 
    error, 
    isPlayerReady, 
    progress,
    getCurrentTime
  };
};
