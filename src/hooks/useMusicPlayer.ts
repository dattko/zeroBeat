import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { setCurrentTrack, setIsPlaying, setDeviceId } from '@redux/slice/playerSlice';
import { RootState } from '@redux/store';
import { getDevices, activateDevice, playTrack } from '@/lib/spotify';
import { MusicList as MusicListType } from '@/types/spotify';

export const useMusicPlayer = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const isPlayerReady = useSelector((state: RootState) => state.player.isPlayerReady);
  const deviceId = useSelector((state: RootState) => state.player.deviceId);

  const fetchDevices = useCallback(async () => {
    const device = await getDevices(session);
    if (device) {
      dispatch(setDeviceId(device.id));
    } else {
      console.error('Web Playback SDK device not found');
    }
  }, [session, dispatch]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handlePlayTrack = async (track: MusicListType) => {
    dispatch(setCurrentTrack(track));
    dispatch(setIsPlaying(true));

    if (session && isPlayerReady && deviceId) {
      const isDeviceActivated = await activateDevice(session, deviceId);
      if (isDeviceActivated) {
        const isPlayed = await playTrack(session, track);
        if (!isPlayed) {
          alert('Failed to play track. Please try again.');
        }
      } else {
        alert('Failed to activate device. Please try again.');
      }
    } else {
      console.error('No access token, player is not ready, or device ID is missing');
      alert('Unable to play track. Please make sure you are logged in and the player is ready.');
    }
  };

  return { handlePlayTrack };
};