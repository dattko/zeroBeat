import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { 
  setCurrentTrack, setIsPlaying, setQueue, setCurrentTrackIndex,
} from '@redux/slice/playerSlice';
import { SpotifyTrack, SpotifyImage } from '@/types/spotify';
import { RootState } from '@redux/store';
import { activateDevice, playTracks } from '@/lib/spotify/player';
import { useRouter } from 'next/navigation';

export const usePlayTracks = () => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { isPlayerReady, deviceId } = useSelector((state: RootState) => state.player);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePlayTracks = async (tracks: SpotifyTrack[], albumImageUrl?: string, startIndex: number = 0) => {
    if (status !== "authenticated") {
      setError('Please login to play tracks.');
      router.push('/login');
      return;
    }
  
    if (!deviceId) {
      setError('No active device found. Please refresh the page and try again.');
      return;
    }
  
    try {
      // 트랙마다 앨범 이미지 추가 (이미 있는 경우 그대로 사용)
      const tracksWithAlbumImages = tracks.map(track => ({
        ...track,
        album: {
          ...track.album,
          images: track.album?.images?.length > 0
            ? track.album.images
            : albumImageUrl
              ? [{ url: albumImageUrl } as SpotifyImage]
              : []
        }
      })) as SpotifyTrack[];
  
      dispatch(setQueue(tracksWithAlbumImages));
      dispatch(setCurrentTrackIndex(startIndex));
      dispatch(setCurrentTrack(tracksWithAlbumImages[startIndex]));
      dispatch(setIsPlaying(true));
  
      const isDeviceActivated = await activateDevice(session, deviceId);
      if (!isDeviceActivated) {
        throw new Error('Failed to activate device');
      }
  
      const isPlayed = await playTracks(session, tracksWithAlbumImages, startIndex, isPlayerReady, deviceId);
      if (!isPlayed) {
        throw new Error('Failed to play tracks');
      }
  
    } catch (err) {
      console.error('Error playing tracks:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return { 
    handlePlayTracks,
    error
  };
};


