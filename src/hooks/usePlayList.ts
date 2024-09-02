import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePlayTrack } from './usePlayTrack';
import { setQueue} from '@redux/slice/playerSlice';
import { RootState } from '@redux/store';
import {  getRecommendations} from '@/lib/spotify';
import { MusicList as MusicListType } from '@/types/spotify';


export const usePlayList = () => {
  const { handlePlayTrack } = usePlayTrack();
  const dispatch = useDispatch();
  const { 
    queue, currentTrack
  } = useSelector((state: RootState) => state.player);
  const [error, setError] = useState<string | null>(null);

  const playTrackFromPlaylist = async (track: MusicListType, index: number) => {
    await handlePlayTrack(track, false, index);  
  };

  const loadMoreTracks = useCallback(async () => {
    if (!currentTrack) return;

    try {
      const recommendations = await getRecommendations(currentTrack.id, 30);
      dispatch(setQueue([...queue, ...recommendations]));
    } catch (error) {
      console.error('Error loading more tracks:', error);
      setError('Failed to load more tracks. Please try again.');
    }
  }, [currentTrack, queue, dispatch]);

return { 
  playTrackFromPlaylist,
  loadMoreTracks,
  error
 };

}