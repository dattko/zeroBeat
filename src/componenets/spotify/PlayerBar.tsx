import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@redux/store';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import styles from './Spotify.module.scss';

interface PlaybarProps {
  onTogglePlayList: () => void;
}

const PlayerBar: React.FC<PlaybarProps> = ({ onTogglePlayList }) => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, volume, queue, currentTrackIndex, progress, duration, repeatMode } = useSelector((state: RootState) => state.player);
  
  const { 
    handleNextTrack, 
    handlePreviousTrack, 
    handlePlayPause, 
    handleVolumeChange, 
    handleRepeatMode, 
    handleProgressChange 
  } = useMusicPlayer();
  
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (duration > 0) {
      setCurrentProgress(progress);
    }
  }, [duration, progress]);

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    handleVolumeChange(newVolume); 
  };

  const handleProgressChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setCurrentProgress(newProgress);
    handleProgressChange(newProgress);
  };

  const handleRepeatClick = () => {
    handleRepeatMode();
  };

  if (!currentTrack) return null;

  const nextTrackInfo = queue[currentTrackIndex + 1];

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className={styles.playerBarContainer} onClick={onTogglePlayList}>
      <div className={styles.trackInfo}>
        <img src={currentTrack.album_art_url} alt={currentTrack.album} className={styles.albumArt} />
        <div className={styles.textInfo}>
          <h3 className={styles.trackTitle}>{currentTrack.title}</h3>
          <p className={styles.artistName}>{currentTrack.artist}</p>
        </div>
      </div>
      <div className={styles.playerControls} onClick={onTogglePlayList}>
        <button onClick={handlePreviousTrack} className={styles.controlButton}>Previous</button>
        <button onClick={handlePlayPause} className={styles.controlButton}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleNextTrack} className={styles.controlButton}>Next</button>
        <button onClick={handleRepeatClick} className={styles.controlButton}>
          Repeat: {repeatMode === 0 ? 'Off' : repeatMode === 1 ? 'Single' : 'All'}
        </button>
      </div>
      <div className={styles.progressControl} onClick={onTogglePlayList}>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentProgress}
          onChange={handleProgressChangeWrapper}
          className={styles.progressSlider}
        />
        <div className={styles.progressTime}>
          <span>{formatTime(currentProgress)}</span> / <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className={styles.volumeControl} onClick={onTogglePlayList}>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeSliderChange}
          className={styles.volumeSlider}
        />
      </div>
      {nextTrackInfo && (
        <div className={styles.nextTrackInfo}>
          <p>Next: {nextTrackInfo.title} - {nextTrackInfo.artist}</p>
        </div>
      )}
    </div>
  );
};

export default PlayerBar;
