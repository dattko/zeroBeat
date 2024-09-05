import React from 'react';
import styles from './AlbumDetail.module.scss';
import PlayTrack from '@component/spotify/PlayTrack';
import { usePlayTrack } from '@hook/usePlayTrack';
import { SpotifyAlbum } from '@type/spotify';
import { formatTime, transformSpotifyTrackToMusicList } from '@/lib/spotify';

interface AlbumDetailProps {
  album: SpotifyAlbum;
}

const AlbumDetail: React.FC<AlbumDetailProps> = ({ album }) => {
  const { handlePlayTrack } = usePlayTrack();
  const albumImageUrl = album.images[0]?.url || '/images/no-image.png';
console.log('album', album);
  return (
    <div className={styles.albumDetailContainer}>
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
          const musicListTrack = transformSpotifyTrackToMusicList(track, albumImageUrl);
          return (
            <div key={track.id} className={styles.trackItem} onClick={() => handlePlayTrack(musicListTrack)}>
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

export default AlbumDetail;