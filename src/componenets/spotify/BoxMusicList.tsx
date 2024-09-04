import React from 'react';
import { MusicList as MusicListType } from '@/types/spotify';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import styles from './BoxMusicList.module.scss';
import PlayTrack from './PlayTrack';

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
        <span className={`${ styles.sectionTitle} ${name ? styles['sectionTitle' + name] : ''}`}>{title}</span>
      </div>
      {data.length > 0 ? (
        name ? (
          <div className={styles.TrackContainer}>
            {data.map((item) => (
              <div 
                key={item.id} 
                className={`${styles['TrackList' + name]} ${styles.TrackList}`}
                onClick={() => handleItemClick(item)}
              >
                <div className={`${styles['TrackAlbumImage' + name]} ${styles.TrackAlbumImage}`}>
                  {item.album_art_url ? 
                  <img src={item.album_art_url} alt={item.title} /> 
                  : <img src="/images/no-image.png" alt={item.title} /> }
                  <PlayTrack size={18} BoxSize={38}/>
                </div>
                <span className={`${styles['TrackMusicInfoTitle' + name]} ${styles.TrackMusicInfoTitle}`}>
                  {item.title}
                </span>
                 {type !== 'artist' && 
                <span className={`${styles['TrackMusicInfoText' + name]} ${styles.TrackMusicInfoText}`}>
                  {type === 'track' ? item.artist : item.artist || ''}
                </span>}

                {/* {type === 'track' && 
                <span className={` ${styles['albumInfoText' + name], styles.TrackAlbumInfoText}`}>
                  {item.album}
                </span>} */}
              </div>
            ))}
          </div>
        ) : (
          <SwiperWrap>
            {data.map((item) => (
              <div 
                key={item.id} 
                className={styles.swiperList}
                onClick={() => handleItemClick(item)}
              >
                <div className={styles.albumImage}>
                  <img src={item.album_art_url} alt={item.title} />
                  <PlayTrack size={30} BoxSize={60}/>
                </div>
                <span className={styles.musicInfoTitle}>{item.title}</span>
                <span className={styles.musicInfoText}>
                  {type === 'track' ? item.artist : item.artist || '다양한 아티스트'}
                </span>
                {type === 'track' && 
                <span className={styles.albumInfoText}>{item.album}</span>}
              </div>
            ))}
          </SwiperWrap>
        )
      ) : (
        <div className={styles.noDataMessage}>{name} 목록이 없습니다.</div>
      )}
    </div>
  );
};

export default BoxMusicList;
