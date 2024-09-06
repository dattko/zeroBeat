import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import styles from './PlayerBar.module.scss';
import { setCurrentTime, setProgress } from '@redux/slice/playerSlice';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, RepeatIcon, Volume2, Repeat1 } from 'lucide-react';
import { formatTime } from '@/lib/spotify';

interface PlaybarProps {
  onTogglePlayList: () => void;
}

const PlayerBar: React.FC<PlaybarProps> = ({ onTogglePlayList }) => {
  const dispatch = useDispatch();
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    queue, 
    currentTrackIndex, 
    duration_ms, 
    repeatMode, 
  } = useSelector((state: RootState) => state.player);
  const { 
    handleNextTrack, 
    handlePreviousTrack, 
    handlePlayPause, 
    handleVolumeChange, 
    handleRepeatMode, 
    handleProgressChange,
    getCurrentTime,
    initializePlayer
  } = useMusicPlayer();
  const [localProgress, setLocalProgress] = useState(0);
  
  useEffect(() => {
    initializePlayer();
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      handlePlayPause();
    }
  }, [handlePlayPause]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let updateCount = 0;
    if (isPlaying) {
      interval = setInterval(async () => {
        const time = await getCurrentTime();
        setLocalProgress((time / duration_ms) * 100);
        
        // Update Redux state less frequently
        updateCount++;
        if (updateCount >= 5) { // Update every 5 seconds
          dispatch(setCurrentTime(time));
          dispatch(setProgress((time / duration_ms) * 100));
          updateCount = 0;
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, getCurrentTime, dispatch, duration_ms]);

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    handleVolumeChange(newVolume); 
  };

  const handleProgressChangeWrapper = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setLocalProgress(newProgress);
    handleProgressChange(newProgress);
  }, [handleProgressChange]);

  if (!currentTrack) return null;

  const nextTrackInfo = queue[currentTrackIndex + 1];

  const handleControlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const albumArtUrl = currentTrack.album.images[0]?.url || '';
  const trackTitle = currentTrack.name;
  const artistName = currentTrack.artists[0]?.name || 'Unknown Artist';

  return (
    <div className={styles.playerBarContainer} onClick={onTogglePlayList}>
      <div className={styles.playerBar}>
        <div className={styles.playerOptions}>
          <div className={styles.playerTrackInfo}>
            <img src={albumArtUrl} alt={currentTrack.album.name} className={styles.playerAlbumArt} />
            <div className={styles.playerTextInfo}>
              <span className={styles.playerTrackTitle}>{trackTitle}</span>
              <span className={styles.playerArtistName}>{artistName}</span>
            </div>
          </div>
          <div className={styles.progressControl} onClick={handleControlClick}>
            <input
              type="range"
              min="0"
              max="100"
              value={localProgress}
              onChange={handleProgressChangeWrapper}
              className={styles.progressSlider}
            />
            <div className={styles.progressTime}>
              <span>{formatTime(localProgress / 100 * duration_ms)}</span> / <span>{formatTime(currentTrack.duration_ms)}</span>
            </div>
          </div>
        </div>
        <div className={styles.playerControls} onClick={handleControlClick}>
          <button onClick={handlePreviousTrack} className={styles.controlButton}>
            <SkipBackIcon />
          </button>
          <button onClick={handlePlayPause} className={styles.controlButton}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button onClick={handleNextTrack} className={styles.controlButton}>
            <SkipForwardIcon />
          </button>
          <button onClick={handleRepeatMode} className={styles.controlButton}>
            {repeatMode === 0 ? <RepeatIcon style={{ opacity: .4 }} /> : repeatMode === 1 ? <Repeat1 /> : <RepeatIcon />}
          </button>
        </div>
        <div className={styles.volumeControl} onClick={handleControlClick}>
          <div className={styles.volumeInfo}><Volume2 /></div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeSliderChange}
            className={styles.volumeSlider}
          />
          {volume}
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;