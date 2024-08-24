import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { FixedSizeList as List } from 'react-window';
import { MusicList } from '@/types/spotify';
import styles from './Spotify.module.scss';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';

const PlayList: React.FC = () => {
  // Redux 상태에서 queue를 가져옵니다.
  const queue = useSelector((state: RootState) => state.player.queue);
  const { handlePlayTrack, error: playerError } = useMusicPlayer();

  // 각 트랙을 렌더링하는 컴포넌트입니다.
  const TrackRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const track = queue[index];
    return (
      <div style={style} onClick={() => handlePlayTrack(track)} className={styles.trackRow}>
        <img src={track.album_art_url} alt={track.album} width="40" height="40" />
        <div className={styles.trackInfo}>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </div>
        <span>{track.duration}</span>
      </div>
    );
  };

  return (
    <div className={styles.queueContainer}>
      <h2>Current Queue {queue.length > 0 ? `(${queue.length})` : ''}</h2>
      {queue.length > 0 ? (
        <List
          height={400}
          itemCount={queue.length}
          itemSize={50}
          width="100%"
        >
          {TrackRow}
        </List>
      ) : (
        <div className={styles.noTracks}>No tracks in queue</div>
      )}
      {playerError && <div className={styles.error}>{playerError}</div>}
    </div>
  );
};

export default PlayList;
