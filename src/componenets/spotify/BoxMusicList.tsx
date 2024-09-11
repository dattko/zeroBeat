import React from 'react';
import { SpotifyTrack, SpotifyAlbum, SpotifyArtist,SpotifyPlaylist  } from '@/types/spotify';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import { useRouter } from 'next/navigation';
import styles from './BoxMusicList.module.scss';
import GradientSectionTitle from '@component/layouts/gradientTitle/GradientSectionTitle';
import PlayTrack from './PlayTrack';

type MusicItem = SpotifyTrack | SpotifyAlbum | SpotifyArtist | SpotifyPlaylist;

interface BoxMusicListProps {
  data: MusicItem[];
  title: string;
  type: string;
  name?: string;
}

const BoxMusicList: React.FC<BoxMusicListProps> = ({ data, title, type, name }) => {
  const { handlePlayTrack } = usePlayTrack();
  const router = useRouter();

  if (!data || data.length === 0) {
    return null; 
  }

  
  const handleItemClick = (item: MusicItem) => {
    if (type === 'track') {
    handlePlayTrack(item as SpotifyTrack, true);
    } else if (type === 'album') {
      router.push(`/album/${item.id}`);
    } else if (type === 'artist') {
      router.push(`/artist/${item.id}`);
    }else if (type === 'playlist') {
      router.push(`/playlist/${item.id}`);
    }
  };

  const getItemImage = (item: MusicItem): string => {
    if ('album' in item && item.album.images.length > 0) {
      return item.album.images[0].url;
    } else if ('images' in item && item.images && item.images.length > 0) {
      return item.images[0].url;
    }
    return '/images/no-image.png';
  };
  

  const getItemArtist = (item: MusicItem): string => {
    if ('artists' in item) {
      return item.artists.map(artist => artist.name).join(', ');
    } else if ('name' in item) {
      return item.name;
    }
    return '';
  };

  const getItemDescription = (item: MusicItem): string => {
    if (type === 'playlist' && 'description' in item) {
      return item.description || '';
    }
    return '';
  };

  return (
    <section className={'section'}>
      <div className={'section-title_box'}>
        <GradientSectionTitle title={title}/>
      </div>
      {data.length > 0 ? (
        name && name !== 'recommendationPlaylist' ?  (
          <div className={styles.TrackContainer}>
            {data.map((item) => (
              <div 
                key={item.id} 
                className={`${styles['TrackList' + name]} ${styles.TrackList}`}
                onClick={() => handleItemClick(item)}
              >
                <div className={`${styles['TrackAlbumImage' + name]} ${styles.TrackAlbumImage}`}>
                  <img src={getItemImage(item)} alt={item.name} />
                  <PlayTrack size={18} BoxSize={38}/>
                </div> 
                <span className={`${styles['TrackMusicInfoTitle' + name]} ${styles.TrackMusicInfoTitle}`}>
                  {item.name}
                </span>
                {type !== 'artist' && 
                <span className={`${styles['TrackMusicInfoText' + name]} ${styles.TrackMusicInfoText}`}>
                  {getItemArtist(item)}
                </span>}
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
                  <img src={getItemImage(item)} alt={item.name} />
                  <PlayTrack size={30} BoxSize={60}/>
                </div>
                <span className={styles.musicInfoTitle}>{item.name}</span>
                <span className={`${styles['musicInfoText' + name]} ${styles.musicInfoText}`}>
                  {type === 'track' ? getItemArtist(item) : type === 'playlist' ? getItemDescription(item) : getItemArtist(item)}
                </span>
                {type === 'track' && 'album' in item && 
                <span className={styles.albumInfoText}>{item.album.name}</span>}
              </div>
            ))}
          </SwiperWrap>
        )
      ) : (
        <div className={styles.noDataMessage}>{name} 목록이 없습니다.</div>
      )}
    </section>
  );
};

export default BoxMusicList;