import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import styles from './spotifyTrackMenu.module.scss';
import { SpotifyTrack, SpotifyPlaylist } from '@/types/spotify';
import { 
  addTrackToLiked, 
  removeTrackFromLiked, 
  addTrackToPlaylist, 
  getUserPlaylists,
  isTrackLiked 
} from '@/lib/spotify/api';
import { stopPropagation } from '@/utils/eventUtils'; 

interface TrackMenuProps {
  track: SpotifyTrack;
  className?: string;
  onAddToQueue?: (track: SpotifyTrack) => void;
}

const SpotifyTrackMenu: React.FC<TrackMenuProps> = ({ 
  track, 
  className,
  onAddToQueue
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isCheckingLike, setIsCheckingLike] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const checkLikedStatus = useCallback(async () => {
    if (session && isLiked === null && !isCheckingLike) {
      setIsCheckingLike(true);
      try {
        const liked = await isTrackLiked(track.id);
        setIsLiked(liked);
      } catch (error) {
        console.error('Failed to check if track is liked:', error);
      } finally {
        setIsCheckingLike(false);
      }
    }
  }, [session, track.id, isLiked, isCheckingLike]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPlaylists(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchPlaylists = async () => {
    if (session && playlists.length === 0 && !isLoadingPlaylists) {
      setIsLoadingPlaylists(true);
      try {
        const userPlaylists = await getUserPlaylists();
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error('Failed to fetch user playlists:', error);
      } finally {
        setIsLoadingPlaylists(false);
      }
    }
  };

  const handleToggleLike = async () => {
    if (session) {
      try {
        if (isLiked) {
          await removeTrackFromLiked(track.id);
        } else {
          await addTrackToLiked(track.id);
        }
        setIsLiked(!isLiked);
      } catch (error) {
        console.error('Failed to toggle like:', error);
      }
      setIsOpen(false);
    }
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (session) {
      try {
        await addTrackToPlaylist(playlistId, track.uri);
        console.log(`${track.name} 성공적으로 추가되었습니다.`);
      } catch (error) {
        console.error('추가 실패:', error);
      }
      setIsOpen(false);
      setShowPlaylists(false);
    }
  };

  const handleShowPlaylists = () => {
    setShowPlaylists(!showPlaylists);
    fetchPlaylists();
  };

  const handleAddToQueue = () => {
    if (onAddToQueue) {
      onAddToQueue(track);
    }
    setIsOpen(false);
  };

  const handleOpenMenu = () => {
    setIsOpen(!isOpen);
    checkLikedStatus();
  };

  if (!session) {
    return null;
  }

  return (
    <div className={styles.container} ref={menuRef} onClick={stopPropagation}>
      <button 
        className={`${styles.iconBtn} ${className || ''} ${isOpen ? styles.active : ''}`}
        onClick={handleOpenMenu}
      >
        <img src="/icon/three-dot.svg" alt="옵션" />
      </button>
      
      {isOpen && (
        <ul className={styles.menu}>
            <li 
              className={styles.menuItem}
              onClick={handleToggleLike}
            >
              {isLiked ? '좋아요 취소' : '좋아요'}
            </li>
          <li 
            className={`${styles.menuItem} ${showPlaylists ? styles.active : ''}`}
            onClick={handleShowPlaylists}
          >
            플레이리스트에 추가
          </li>
          {showPlaylists && (
            <ul className={styles.subMenu}>
              {isLoadingPlaylists ? (
                <li className={styles.subMenuItem}>플레이리스트 로딩 중...</li>
              ) : playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <li 
                    key={playlist.id}
                    className={styles.subMenuItem}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    {playlist.name}
                  </li>
                ))
              ) : (
                <li className={styles.subMenuItem}>플레이리스트가 없습니다.</li>
              )}
            </ul>
          )}
          {/* {onAddToQueue && (
            <li 
              className={styles.menuItem}
              onClick={handleAddToQueue}
            >
              다음 곡으로 추가
            </li>
          )} */}
        </ul>
      )}
    </div>
  );
};

export default SpotifyTrackMenu;