import React from 'react';
import { MusicList as MusicListType } from '@/types/spotify';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import styles from './RowMusicList.module.scss';
import PlayTrack from './PlayTrack';
import GradientSectionTitle from '@component/layouts/gradientTitle/GradientSectionTitle';
interface RowMusicListProps {
  data: MusicListType[];
  title: string;
  limit?: number;
  class?: string;
}

const RowMusicList: React.FC<RowMusicListProps> = ({ data, title, limit }) => {
  const { handlePlayTrack } = usePlayTrack();
  const displayData = limit ? data.slice(0, limit) : data;

  return (
    <div className={'section'}>
      <div className={'section-title_box'}>
        <GradientSectionTitle title={title}/>
      </div>
      <div className={styles.musicListContainer}>
        <ul className={styles.musicListUl}>
          {displayData.map((data, i) => (
            <li key={data.id} className={styles.musicListLi} onClick={() => handlePlayTrack(data)}>
              <span className={`${styles.rowMusicInfoText} ${styles.grey} ${styles.center}`} style={{width: '30px'}}>
                {i + 1}
              </span>
              <div className={styles.smallAlbumImage}>
                <img src={data.album_art_url} alt={data.title} />
                <PlayTrack size={12} BoxSize={24}/>
              </div>
              <span className={styles.rowMusicInfoTitle}>{data.title}</span>
              <span className={styles.rowMusicInfoText } style={{width: '22%'}}>{data.artist}</span>
              <span className={styles.rowMusicInfoTextAlbum} style={{width: '22%'}}>{data.album}</span>
              <span className={`${styles.rowMusicInfoText} ${styles.grey}`} style={{width: '60px', fontSize: '14px'}}>
                {data.duration}
              </span>
              <button className={styles.iconBtn}>
                <img src="/icon/three-dot.svg" alt="재생" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RowMusicList;