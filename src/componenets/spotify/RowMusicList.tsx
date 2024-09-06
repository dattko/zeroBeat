import React from 'react';
import { SpotifyTrack } from '@/types/spotify';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import styles from './RowMusicList.module.scss';
import PlayTrack from './PlayTrack';
import GradientSectionTitle from '@component/layouts/gradientTitle/GradientSectionTitle';
import { formatTime } from '@/lib/spotify';

interface RowMusicListProps {
  data: SpotifyTrack[];
  title: string;
  type?: string;
  limit?: number;
  albumImage?: string;
}

const RowMusicList: React.FC<RowMusicListProps> = ({ data, title, limit, type, albumImage }) => {
  const { handlePlayTrack } = usePlayTrack();
  const displayData = limit ? data.slice(0, limit) : data;

  const getArtistNames = (track: SpotifyTrack): string => {
    return track.artists?.map(artist => artist.name).join(', ') || 'Unknown';
  };

  if (!Array.isArray(data) || data.length === 0) {
    console.error('Invalid or empty data passed to RowMusicList');
    return <div>No data available</div>;
  }

  return (
    <div className={'section'}>
      {type !== 'album' && (
        <div className={'section-title_box'}>
          <GradientSectionTitle title={title}/>
        </div>
      )}
      <div className={styles.musicListContainer}>
        <ul className={styles.musicListUl}>
          {displayData.map((track, i) => {
            if (!track) {
              console.error(`Invalid track at index ${i}`);
              return null;
            }
            return (
              <li key={track.id} className={styles.musicListLi} onClick={() => handlePlayTrack({
                ...track,
                album: {
                  ...track.album,
                  images: [{ url: albumImage || track.album?.images[0]?.url || '/images/no-image.png' }]
                }
              })}>
                <span className={`${styles.rowMusicInfoText} ${styles.grey} ${styles.center}`} style={{width: '30px',position: 'relative'}}>
                  {i + 1}
                  <PlayTrack size={12} BoxSize={24}/>
                </span>
                {type !== 'album' && (
                  <div className={styles.smallAlbumImage}>
                    <img src={albumImage || track.album?.images[0]?.url || '/images/no-image.png'} alt={track.name} />
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