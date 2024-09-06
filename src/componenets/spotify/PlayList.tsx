import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { FixedSizeList as List } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import styles from './PlayList.module.scss';
import { usePlayList } from '@/hooks/usePlayList';
import PlayTrack from '@component/spotify/PlayTrack';
import { ListX } from 'lucide-react';
import { formatTime } from '@/lib/spotify';


interface PlayListProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayList: React.FC<PlayListProps> = React.memo(({ isOpen, onClose }) => {
  const queue = useSelector((state: RootState) => state.player.queue);
  const currentTrackIndex = useSelector((state: RootState) => state.player.currentTrackIndex);
  const { playTrackFromPlaylist, loadMoreTracks, error: playerError } = usePlayList();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List | null>(null);
  const [listHeight, setListHeight] = useState(400);


  
  const updateHeight = useCallback(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const headerHeight = 53; 
      setListHeight(containerHeight - headerHeight);
    }
  }, []);

  useEffect(() => {
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [updateHeight]);

  useEffect(() => {
    if (isOpen && listRef.current && currentTrackIndex !== null) {
      listRef.current.scrollToItem(currentTrackIndex, 'center');
    }
  }, [isOpen, currentTrackIndex]);

  const isItemLoaded = useCallback((index: number) => index < queue.length, [queue.length]);
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

  const TrackRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    if (!isItemLoaded(index)) {
      return <div style={style} className={styles.loadingRow}>Loading more tracks...</div>;
    }
  
    const track = queue[index];
    const isCurrentTrack = index === currentTrackIndex;
  
  //속성 맵핑
    const albumImageUrl = track.album?.images[0]?.url || '/images/no-image.png';
    const trackTitle = track.name;
    const trackArtist = track.artists[0]?.name || 'Unknown';
  
    return (
      <div 
        style={style} 
        onClick={() => playTrackFromPlaylist(track, index)} 
        className={`${styles.trackRow} ${isCurrentTrack ? styles.currentTrack : ''} ${isCurrentTrack ? styles.activeTrack : ''}`}
      >
        <div className={styles.albumImg}>
          <img src={albumImageUrl} alt={track.album?.name}/>
          <PlayTrack size={12} BoxSize={24} />
        </div>
        <div className={styles.playlistTrackInfo}>
          <span>{trackTitle}</span>
          <span>{trackArtist}</span>
        </div>
        <span className={styles.duration}>{formatTime(track.duration_ms)}</span>
      </div>
    );
  }, [queue, currentTrackIndex, playTrackFromPlaylist, isItemLoaded]);
  

  const memoizedList = useMemo(() => (
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
  ), [isItemLoaded, itemCount, loadMoreItems, listHeight, TrackRow]);

  return (
    <div ref={containerRef} className={`${styles.playlistContainer} ${isOpen ? styles.open : ''}`}>
      <span className={styles.playlistTitle}>
        재생목록
        <button onClick={onClose} className={styles.closeButton}>
          <ListX size={20} color='#e0e0e0'/>
        </button>
      </span>
      {queue.length > 0 ? memoizedList : (
        <div className={styles.noTracks}>No tracks in queue</div>
      )}
      {playerError && <div className={styles.error}>{playerError}</div>}
    </div>
  );
});

PlayList.displayName = 'PlayList';

export default PlayList;