import React, { useMemo } from 'react';
import { SpotifyTrack, SpotifyAlbum, SpotifyArtist, SpotifyPlaylist, SpotifyImage } from '@/types/spotify';
import { usePlayTrack } from '@/hooks/usePlayTrack';
import { usePlayTracks } from '@/hooks/usePlayTracks';
import styles from './RowMusicList.module.scss';
import PlayTrack from './PlayTrack';
import GradientSectionTitle from '@component/layouts/gradientTitle/GradientSectionTitle';
import { formatTime } from '@/lib/spotify/utils';
import SpotifyTrackMenu from '@/componenets/spotifyTrackMenu/SpotifyTrackMenu';
import { addToQueue } from '@/lib/spotify/api';

type MusicItem = SpotifyTrack | SpotifyAlbum | SpotifyPlaylist;

interface RowMusicListProps {
  data: SpotifyTrack[];
  title: string;
  type?: 'track' | 'album' | 'playlist';
  playlist?: SpotifyPlaylist;
  limit?: number;
  albumImageUrl?: string;
}

const RowMusicList: React.FC<RowMusicListProps> = ({ data, title, limit, type, albumImageUrl, playlist }) => {
  const { handlePlayTrack } = usePlayTrack();
  const { handlePlayTracks } = usePlayTracks();

  // limit이 있을 경우 데이터를 잘라냄
  const limitedData = useMemo(() => {
    if (limit && limit > 0) {
      return data.slice(0, limit);
    }
    return data;
  }, [data, limit]);

  const getArtistNames = (track: SpotifyTrack): string => {
    return track.artists?.map(artist => artist.name).join(', ') || 'Unknown';
  };

  const handleItemClick = (item: MusicItem, index: number) => {
    if (type === 'track') {
      handlePlayTrack(item as SpotifyTrack, true);
    } else if (type === 'album') {
      handlePlayTracks(limitedData, albumImageUrl);
    } else if (type === 'playlist') {
      handlePlayTracks(limitedData, playlist?.images[0]?.url, index);
    }
  };

  const handleAddToQueue = async (track: SpotifyTrack) => {
    try {
      // Spotify API를 사용하여 트랙을 재생 대기열에 추가하는 로직
      await addToQueue(track.uri);
      console.log('Track added to queue successfully');
    } catch (error) {
      console.error('Failed to add track to queue:', error);
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
          {limitedData.map((track, i) => {
            if (!track) {
              console.error(`Invalid track at index ${i}`);
              return null;
            }
            return (
              <li key={track.id} className={styles.musicListLi} onClick={() => handleItemClick(track, i)}>
                <span className={`${styles.rowMusicInfoNumber} `}>
                  {i + 1}
                  <PlayTrack size={12} BoxSize={24} />
                </span>
                {type !== 'album' && (
                  <div className={styles.smallAlbumImage}>
                    <img src={track.album?.images[0]?.url || '/images/no-image.png'} alt={track.name} />
                  </div>
                )}
                <div className={styles.rowMusicTextBox}>
                  <span className={styles.rowMusicInfoTitle}>{track.name}</span>
                  <span className={styles.rowMusicInfoText}>
                    <span>{getArtistNames(track)}</span>
                  </span>
                </div>
                <span className={`${styles.rowMusicInfoText} ${styles.grey} ${styles.duration}`}>
                  {formatTime(track.duration_ms)}
                </span>
                <SpotifyTrackMenu 
                  track={track}
                  className={styles.iconBtn}
                  onAddToQueue={handleAddToQueue}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default RowMusicList;