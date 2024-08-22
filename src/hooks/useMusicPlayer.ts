import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { setCurrentTrack, setIsPlaying, setDeviceId, setIsPlayerReady, addToQueue } from '@redux/slice/playerSlice';
import { RootState } from '@redux/store';
import { activateDevice, playTrack } from '@/lib/spotify';
import { MusicList as MusicListType } from '@/types/spotify';

export const useMusicPlayer = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const isPlayerReady = useSelector((state: RootState) => state.player.isPlayerReady);
  const deviceId = useSelector((state: RootState) => state.player.deviceId);
  const [error, setError] = useState<string | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  const initializePlayer = useCallback(() => {
    if (!session?.user?.accessToken || isSDKLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;

    script.onload = () => {
      setIsSDKLoaded(true);
    };

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => { cb(session.user.accessToken); },
      });

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        dispatch(setDeviceId(device_id));
        dispatch(setIsPlayerReady(true));
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        dispatch(setIsPlayerReady(false));
      });

      player.connect();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [session, dispatch, isSDKLoaded]);

  useEffect(() => {
    initializePlayer();
  }, [initializePlayer]);

  const handlePlayTrack = async (track: MusicListType) => {
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
    dispatch(addToQueue(track));  // 트랙을 재생목록에 추가

    try {
      const isDeviceActivated = await activateDevice(session, deviceId);
      if (!isDeviceActivated) {
        throw new Error('Failed to activate device');
      }

      const isPlayed = await playTrack(session, track, isPlayerReady, deviceId);
      if (!isPlayed) {
        throw new Error('Failed to play track');
      }
    } catch (err) {
      console.error('Error playing track:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return { handlePlayTrack, error, isPlayerReady };
};
