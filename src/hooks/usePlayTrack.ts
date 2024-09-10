import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { 
  setCurrentTrack, setIsPlaying, setQueue, setCurrentTrackIndex,
} from '@redux/slice/playerSlice';
import { SpotifyTrack, SpotifySDK } from '@/types/spotify';
import { RootState } from '@redux/store';
import { getRecommendations} from '@/lib/spotify/api';
import { activateDevice, playTrack} from '@/lib/spotify/player';
import { useRouter } from 'next/navigation';

export const usePlayTrack = () => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { 
    isPlayerReady, deviceId, repeatMode 
  } = useSelector((state: RootState) => state.player);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<SpotifySDK.Player | null>(null);
  const router = useRouter();

  const handlePlayTrack = async (track: SpotifyTrack, updateQueue: boolean = true, playlistIndex: number | null = null) => {   
    if (status !== "authenticated") {
      setError('Please login to play tracks.');
      router.push('/login');
      return;
    }
    console.log(session.user.isPremium);
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

  return { 
    handlePlayTrack,
    error
  };
}