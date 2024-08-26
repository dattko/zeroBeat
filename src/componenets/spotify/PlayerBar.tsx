import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import styles from './Spotify.module.scss';

interface PlaybarProps {
  onTogglePlayList: () => void;
}

const PlayerBar: React.FC<PlaybarProps> = ({ onTogglePlayList }) => {
  const { currentTrack, isPlaying, volume, queue, currentTrackIndex, progress, duration, repeatMode } = useSelector((state: RootState) => state.player);
  const [currentTime, setCurrentTime] = useState(0);

  const { 
    handleNextTrack, 
    handlePreviousTrack, 
    handlePlayPause, 
    handleVolumeChange, 
    handleRepeatMode, 
    handleProgressChange ,
    getCurrentTime
  } = useMusicPlayer();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(async () => {
        const time = await getCurrentTime();
        setCurrentTime(time);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, getCurrentTime]);

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    handleVolumeChange(newVolume); 
  };
  const handleProgressChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    handleProgressChange(newProgress);
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
      <div className={styles.playerControls}>
        <button onClick={handlePreviousTrack} className={styles.controlButton}>Previous</button>
        <button onClick={handlePlayPause} className={styles.controlButton}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleNextTrack} className={styles.controlButton}>Next</button>
        <button onClick={handleRepeatMode} className={styles.controlButton}>
          Repeat: {repeatMode === 0 ? 'Off' : repeatMode === 1 ? 'Single' : 'All'}
        </button>
      </div>
      <div className={styles.progressControl}>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleProgressChangeWrapper}
          className={styles.progressSlider}
        />
        <div className={styles.progressTime}>
          <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className={styles.volumeControl}>
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

