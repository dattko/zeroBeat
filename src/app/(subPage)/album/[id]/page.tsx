'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { SpotifyAlbum, SpotifyTrack } from '@type/spotify';
import { getAlbumDetails, getAlbumTracks } from '@/lib/spotify/api';
import styles from './Page.module.scss';
import RowMusicList from '@component/spotify/RowMusicList';

interface AlbumPageProps {
  params: { id: string };
}

const AlbumPage: React.FC<AlbumPageProps> = ({ params }) => {
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbumDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const albumData = await getAlbumDetails(params.id);
      setAlbum(albumData);

      const albumTracks = await getAlbumTracks(params.id);
      setTracks(albumTracks);

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

  return (
    <div className={styles.albumPageContainer}>
      <div className={styles.albumInfo}>
        <img 
          src={album.images[0].url}
          alt={album.name} 
          className={styles.albumCover}
        />
        <div className={styles.albumMeta}>
          <span className={styles.albumTitle}>{album.name}</span>
          <span className={styles.albumArtist}>{album.artists.map(artist => artist.name).join(', ')}</span>
          <span className={styles.albumRelease}>{album.release_date} • {album.total_tracks} 곡</span>
        </div>
      </div>
      {/* 트랙 데이터를 RowMusicList에 전달 */}
      <RowMusicList data={tracks} title="목록" type="album" albumImageUrl={album?.images[0].url}/>
    </div>
  );
};

export default AlbumPage;