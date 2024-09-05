import React from 'react';
import { MusicList as MusicListType } from '@/types/spotify';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import PlayTrack from '@component/spotify/PlayTrack';
import styles from './SearchSpotifySection.module.scss';
import GradientSectionTitle from '@component/layouts/gradientTitle/GradientSectionTitle';

interface SearchSpotifySectionProps {
  data: MusicListType[];
  title: string;
  type: 'track' | 'album' | 'artist';
}

export default function SearchSpotifySection({ data, title, type }: SearchSpotifySectionProps) {
  const { handlePlayTrack } = usePlayTrack();
  
  const handleItemClick = (item: MusicListType) => {
    if (type === 'track') {
      handlePlayTrack(item, true);
    } else {
      console.log('Item clicked:', item);
    }
  };

  const getImageUrl = (item: MusicListType) => {
    return item.album_art_url || item.images?.[0]?.url || '/images/no-image.png';
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
                <img src={getImageUrl(item)} alt={item.title || item.name} className={styles.image} />
               <PlayTrack size={16} BoxSize={32}/>
              </div>
              <div className={`${styles.info} ${styles[`info${type}`]}`}>
                <span className={styles.title}>{item.title || item.name}</span>
                {type !== 'artist' && (
                  <span className={styles.subtitle}>
                    {type === 'track' ? item.artist : (item.artists?.map(a => a.name).join(', ') || '')}
                  </span>
                )}
                {type === 'track' && (
                  <span className={styles.album}>{item.album}</span>
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