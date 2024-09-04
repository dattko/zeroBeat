import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import styles from './PlayList.module.scss';
import { usePlayList } from '@/hooks/usePlayList';
import PlayTrack from './PlayTrack';
interface PlayListProps {
  isOpen: boolean;
}

const PlayList: React.FC<PlayListProps> = ({ isOpen }) => {
  const queue = useSelector((state: RootState) => state.player.queue);
  const currentTrackIndex = useSelector((state: RootState) => state.player.currentTrackIndex);
  const { playTrackFromPlaylist, loadMoreTracks, error: playerError } = usePlayList();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List | null>(null);
  const [listHeight, setListHeight] = useState(400);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const headerHeight = 53; 
        setListHeight(containerHeight - headerHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current && currentTrackIndex !== null) {
      listRef.current.scrollToItem(currentTrackIndex, 'center');
    }
  }, [isOpen, currentTrackIndex]);

  const isItemLoaded = (index: number) => index < queue.length;
  const itemCount = queue.length + 1;

  const loadMoreItems = useCallback(async (startIndex: number, stopIndex: number) => {
    if (startIndex === queue.length) {
      await loadMoreTracks();
    }
  }, [queue.length, loadMoreTracks]);

  useEffect(() => {
    if (currentTrackIndex >= queue.length - 5) {
      loadMoreTracks();
    }
  }, [currentTrackIndex, queue.length, loadMoreTracks]);

  const TrackRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (!isItemLoaded(index)) {
      return <div style={style} className={styles.loadingRow}>Loading more tracks...</div>;
    }

    const track = queue[index];
    const isCurrentTrack = index === currentTrackIndex;

    return (
      <div 
        style={style} 
        onClick={() => playTrackFromPlaylist(track, index)} 
        className={`${styles.trackRow} ${isCurrentTrack ? styles.currentTrack : ''} ${isCurrentTrack ? styles.activeTrack : ''}`}
      >
        <div className={styles.albumImg}>
          <img src={track.album_art_url} alt={track.album}/>
          <PlayTrack size={12} BoxSize={24} />
        </div>
        <div className={styles.playlistTrackInfo}>
          <span>{track.title}</span>
          <span>{track.artist}</span>
        </div>
        <span className={styles.duration}>{track.duration}</span>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`${styles.playlistContainer} ${isOpen ? styles.open : ''}`}>
      <span className={styles.playlistTitle}>재생목록 
      {/* {queue.length > 0 ? `(${queue.length})` : ''} */}
      </span>
      {queue.length > 0 ? (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={itemCount}
          loadMoreItems={loadMoreItems}
          threshold={1}
        >
          {({ onItemsRendered, ref }) => (
              <List
                ref={(list) => {
                  listRef.current = list;
                  if (typeof ref === 'function') {
                    ref(list);
                  }
                }}
                height={listHeight}
                itemCount={itemCount}
                itemSize={45}
                width="100%"
                onItemsRendered={onItemsRendered}
                overscanCount={5}
                style={{ display: 'flex' }}
              >
                {TrackRow}
              </List>
          )}
        </InfiniteLoader>
      ) : (
        <div className={styles.noTracks}>No tracks in queue</div>
      )}
      {playerError && <div className={styles.error}>{playerError}</div>}
    </div>
  );
};

export default PlayList;