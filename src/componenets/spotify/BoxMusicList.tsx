import React from 'react';
import { MusicList as MusicListType } from '@/types/spotify';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import styles from './BoxMusicList.module.scss';

interface BoxMusicListProps {
  data: MusicListType[];
  title: string;
  type?: 'track' | string;
  name?: string;
}

const BoxMusicList: React.FC<BoxMusicListProps> = ({ data, title, type, name }) => {
  const { handlePlayTrack } = usePlayTrack();
  
  const handleItemClick = (item: MusicListType) => {
    if (type === 'track') {
      handlePlayTrack(item, true);
    } else {
      console.log('item :', item);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitleBox}>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      {data.length > 0 ? (
        <SwiperWrap>
          {data.map((item) => (
            <div 
              key={item.id} 
              className={`${styles.swiperList} ${name ? styles['swiperList' + name] : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <div className={`${styles.albumImage} ${name ? styles['albumImage' + name] : ''}`}>
                <img src={item.album_art_url} alt={item.title} />
              </div>
              <span className={`${styles.musicInfoTitle} ${name ? styles['musicInfoTitle' + name] : ''}`}>
                {item.title}
                </span>
              <span className={`${styles.musicInfoText} ${name ? styles['musicInfoText' + name] : ''}`}>
                {type === 'track' ? item.artist : item.artist || '다양한 아티스트'}

              </span>
              {type === 'track' && 
              <span className={`${styles.albumInfoText} ${name ? styles['albumInfoText' + name] : ''}`}>
                {item.album}
                </span>}
            </div>
          ))}
        </SwiperWrap>
      ) : (
        <div className={styles.noDataMessage}>{name} 목록이 없습니다.</div>
      )}
    </div>
  );
};

export default BoxMusicList;