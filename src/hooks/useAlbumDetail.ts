import { useState, useEffect } from 'react';
import { SpotifyAlbum } from '@/types/spotify';
import { getAlbumDetails } from '@/lib/spotify';

export const useAlbumDetail = (albumId: string) => {
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbumDetail = async () => {
      setIsLoading(true);
      try {
        const data = await getAlbumDetails(albumId);
        setAlbum(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch album details');
      } finally {
        setIsLoading(false);
      }
    };

    if (albumId) {
      fetchAlbumDetail();
    }
  }, [albumId]);

  return { album, isLoading, error };
};