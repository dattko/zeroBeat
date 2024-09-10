import React from 'react';
import { SpotifyTrack, SpotifyAlbum, SpotifyArtist, SpotifyPlaylist,SpotifyImage } from '@/types/spotify';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import { usePlayTracks } from '@/hooks/usePlayTracks';
import styles from './RowMusicList.module.scss';
import PlayTrack from './PlayTrack';
import GradientSectionTitle from '@component/layouts/gradientTitle/GradientSectionTitle';
import { formatTime } from '@/lib/spotify/utils';

type MusicItem = SpotifyTrack | SpotifyAlbum | SpotifyPlaylist;

interface RowMusicListProps {
  data: SpotifyTrack[];
  title: string;
  type?: string;
  limit?: number;
  albumImageUrl?: string;
}

const RowMusicList: React.FC<RowMusicListProps> = ({ data, title, limit, type, albumImageUrl }) => {
  const { handlePlayTrack } = usePlayTrack();
  const { handlePlayTracks } = usePlayTracks();

  const getArtistNames = (track: SpotifyTrack): string => {
    return track.artists?.map(artist => artist.name).join(', ') || 'Unknown';
  };

  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data passed to RowMusicList');
    return <div>No data available</div>;
  }

  const handleItemClick = (item: MusicItem) => {
    if (type === 'track') {
      handlePlayTrack(item as SpotifyTrack, true);
    } else if (type === 'album') {
      handlePlayTracks(data as SpotifyTrack[], albumImageUrl);
    } else if (type === 'playlist') {
      const playlist = item as SpotifyPlaylist;
      // 플레이리스트 처리 로직 (필요한 경우)
      console.log('Playlist handling not implemented yet');
    }
  };

  return (
    <div className={'section'}>
      {type !== 'album' && (
        <div className={'section-title_box'}>
          <GradientSectionTitle title={title} />
        </div>
      )}
      <div className={styles.musicListContainer}>
        <ul className={styles.musicListUl}>
          {data.map((track, i) => {
            if (!track) {
              console.error(`Invalid track at index ${i}`);
              return null;
            }
            return (
              <li key={track.id} className={styles.musicListLi} onClick={() => handleItemClick(track)}>
                <span className={`${styles.rowMusicInfoText} ${styles.grey} ${styles.center}`} style={{width: '30px', position: 'relative'}}>
                  {i + 1}
                  <PlayTrack size={12} BoxSize={24} />
                </span>
                {type !== 'album' && (
                  <div className={styles.smallAlbumImage}>
                    <img src={track.album?.images[0]?.url || '/images/no-image.png'} alt={track.name} />
                  </div>
                )}
                <span className={styles.rowMusicInfoTitle}>{track.name}</span>
                <span className={styles.rowMusicInfoText} style={{width: '22%'}}>{getArtistNames(track)}</span>
                {type !== 'album' && (
                  <span className={styles.rowMusicInfoTextAlbum} style={{width: '22%'}}>{track.album.name}</span>
                )}
                <span className={`${styles.rowMusicInfoText} ${styles.grey}`} style={{width: '60px', fontSize: '14px'}}>
                  {formatTime(track.duration_ms)}
                </span>
                <button className={styles.iconBtn}>
                  <img src="/icon/three-dot.svg" alt="재생" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default RowMusicList;