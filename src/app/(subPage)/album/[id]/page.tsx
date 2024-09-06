'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { SpotifyAlbum, SpotifyTrack } from '@type/spotify';
import { getAlbumDetails } from '@/lib/spotify';
import styles from './Page.module.scss';
import RowMusicList from '@/componenets/spotify/RowMusicList';

interface AlbumPageProps {
  params: { id: string };
}

const AlbumPage: React.FC<AlbumPageProps> = ({ params }) => {
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbumDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAlbumDetails(params.id);
      // Add album image to each track
      const tracksWithAlbumImage = data.tracks.items.map((track: SpotifyTrack) => ({
        ...track,
        album: {
          ...track.album,
          images: data.images
        }
      }));
      setAlbum({
        ...data,
        tracks: {
          ...data.tracks,
          items: tracksWithAlbumImage
        }
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch album details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchAlbumDetail();
  }, [fetchAlbumDetail]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!album) return <div>Album not found</div>;

  const albumImageUrl = album.images[0]?.url || '/images/no-image.png';

  return (
    <div className={styles.albumPageContainer}>
      <div className={styles.albumInfo}>
        <img 
          src={albumImageUrl}
          alt={album.name} 
          className={styles.albumCover}
        />
        <div className={styles.albumMeta}>
          <h1>{album.name}</h1>
          <p>{album.artists.map(artist => artist.name).join(', ')}</p>
          <p>{new Date(album.release_date).getFullYear()} • {album.total_tracks} songs</p>
        </div>
      </div>
      <RowMusicList data={album.tracks.items} title="목록" type='album' albumImage={albumImageUrl} />
    </div>
  );
};

export default AlbumPage;
