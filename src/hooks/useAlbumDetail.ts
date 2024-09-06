import { useState, useEffect, useCallback } from 'react';
import { SpotifyAlbum } from '@/types/spotify';
import { getAlbumDetails } from '@/lib/spotify/api';

export const useAlbumDetail = (albumId: string) => {
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbumDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAlbumDetails(albumId);
      setAlbum(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch album details');
      setAlbum(null);
    } finally {
      setIsLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    fetchAlbumDetail();
  }, [fetchAlbumDetail]);

  return { album, isLoading, error };
};
