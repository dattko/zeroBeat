import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePlayTrack } from './usePlayTrack';
import { setQueue} from '@redux/slice/playerSlice';
import { RootState } from '@redux/store';
import {  getRecommendations} from '@/lib/spotify/api';
import { SpotifyTrack } from '@/types/spotify';


export const usePlayList = () => {
  const { handlePlayTrack } = usePlayTrack();
  const dispatch = useDispatch();
  const { 
    queue, currentTrack
  } = useSelector((state: RootState) => state.player);
  const [error, setError] = useState<string | null>(null);

  const playTrackFromPlaylist = useCallback(async (track: SpotifyTrack, index: number) => {
    await handlePlayTrack(track, false, index);  
  }, [handlePlayTrack]);
  

  const loadMoreTracks = useCallback(async () => {
    if (!currentTrack) return;
  
    try {
      const recommendations = await getRecommendations(currentTrack.id);
      dispatch(setQueue([...queue, ...recommendations]));
    } catch (error) {
      console.error('Error loading more tracks:', error);
      setError('Failed to load more tracks. Please try again.');
    }
  }, [currentTrack?.id, queue, dispatch]);
  

return { 
  playTrackFromPlaylist,
  loadMoreTracks,
  error
 };

}