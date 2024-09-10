'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { SpotifyPlaylist, SpotifyTrack } from '@type/spotify';
import { getPlaylistDetails, getPlaylistTracks } from '@/lib/spotify/api';
import styles from './Page.module.scss';
import RowMusicList from '@component/spotify/RowMusicList';
import { Info } from 'lucide-react';
interface PlaylistPageProps {
  params: { id: string };
}

const PlaylistPage: React.FC<PlaylistPageProps> = ({ params }) => {
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylistDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const playlistData = await getPlaylistDetails(params.id);
      setPlaylist(playlistData);
      console.log(playlistData);
      const playlistTracks = await getPlaylistTracks(params.id);
      setTracks(playlistTracks);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch playlist details');
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchPlaylistDetail();
  }, [fetchPlaylistDetail]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!playlist) return <div>Playlist not found</div>;




  return (
    <div className={styles.playlistPageContainer}>
      <div className={styles.playlistInfo}>
        <img 
          src={playlist.images !== null? playlist.images[0].url : '/images/no-image.png'}
          alt={playlist.name} 
          className={styles.playlistCover}
        />
        <div className={styles.playlistMeta}>
          <span className={styles.playlistTitle}>{playlist.name}</span>
          <span className={styles.playlistOwner}>By {playlist.owner.display_name}</span>
          <span className={styles.playlistDetails}>{playlist.tracks.total} 곡</span>
          {playlist.tracks.total >= 0 && (
            <span className={styles.playlisTip}><Info width={18}/> 트랙목록를 추가해 주세요.</span>
          )}
        </div>
      </div>
      <RowMusicList 
        data={tracks} 
        title="트랙 목록" 
        type="playlist" 
        playlist={playlist}
      />
    </div>
  );
};

export default PlaylistPage;