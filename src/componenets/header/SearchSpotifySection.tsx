import React from 'react';
import { SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '@/types/spotify';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import PlayTrack from '@component/spotify/PlayTrack';
import styles from './SearchSpotifySection.module.scss';
import GradientSectionTitle from '@component/layouts/gradientTitle/GradientSectionTitle';

type SpotifyItem = SpotifyTrack | SpotifyAlbum | SpotifyArtist;

interface SearchSpotifySectionProps {
  data: SpotifyItem[];
  title: string;
  type: 'track' | 'album' | 'artist';
}

export default function SearchSpotifySection({ data, title, type }: SearchSpotifySectionProps) {
  const { handlePlayTrack } = usePlayTrack();
  
  const handleItemClick = (item: SpotifyItem) => {
    if (type === 'track' && 'uri' in item) {
      handlePlayTrack(item as SpotifyTrack, true);
    }
  };

  const getImageUrl = (item: SpotifyItem): string => {
    if ('album' in item && item.album.images.length > 0) {
      return item.album.images[0].url;
    } else if ('images' in item && item.images.length > 0) {
      return item.images[0].url;
    }
    return '/images/no-image.png';
  };

  const getArtistName = (item: SpotifyItem): string => {
    if ('artists' in item) {
      return item.artists.map(artist => artist.name).join(', ');
    }
    return '';
  };

  return (
    <section className={'section'}>
      <div className={'section-title_box'}>
        <GradientSectionTitle title={title}/>
      </div>
      {data.length > 0 ? (
        <ul className={styles.grid}>
          {data.map((item) => (
            <li 
              key={item.id} 
              className={`${styles.item} ${styles[`item${type}`]}`}
              onClick={() => handleItemClick(item)}
            >
              <div className={`${styles.imageWrapper} ${styles[`imageWrapper${type}`]}`}>
                <img src={getImageUrl(item)} alt={item.name} className={styles.image} />
                <PlayTrack size={16} BoxSize={32}/>
              </div>
              <div className={`${styles.info} ${styles[`info${type}`]}`}>
                <span className={styles.title}>{item.name}</span>
                {type !== 'artist' && (
                  <span className={styles.subtitle}>
                    {type === 'track' ? getArtistName(item) : ''}
                  </span>
                )}
                {type === 'track' && 'album' in item && (
                  <span className={styles.album}>{item.album.name}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noDataMessage}>검색 결과가 없습니다.</p>
      )}
    </section>
  );
}