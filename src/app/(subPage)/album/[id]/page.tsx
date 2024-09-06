'use client';
import React, { useEffect, useState,useCallback } from 'react';
import { usePlayTrack } from '@hook/usePlayTrack';
import { SpotifyAlbum } from '@type/spotify';
import { formatTime } from '@/lib/spotify';
import { getAlbumDetails } from '@/lib/spotify';
import styles from './Page.module.scss';
import PlayTrack from '@component/spotify/PlayTrack';

interface AlbumPageProps {
  params: { id: string };
}

const AlbumPage: React.FC<AlbumPageProps> = ({ params }) => {
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { handlePlayTrack } = usePlayTrack();

const fetchAlbumDetail = useCallback(async () => {
  setIsLoading(true);
  try {
    const data = await getAlbumDetails(params.id);
    setAlbum(data);
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
      <div className={styles.trackList}>
        <h2>Tracks</h2>
        {album.tracks.items.map((track, index) => {
          return (
            <div key={track.id} className={styles.trackItem} onClick={() => handlePlayTrack(
              track
            )}>
              <span className={styles.trackNumber}>{index + 1}</span>
              <div className={styles.trackInfo}>
                <span className={styles.trackName}>{track.name}</span>
                <span className={styles.artistName}>
                  {track.artists.map(artist => artist.name).join(', ')}
                </span>
              </div>
              <span className={styles.trackDuration}>
                {formatTime(track.duration_ms)}
              </span>
              <PlayTrack size={18} BoxSize={38} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlbumPage;