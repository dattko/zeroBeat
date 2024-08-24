import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@redux/store';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import { 
  setVolume, 
} from '@redux/slice/playerSlice';
import styles from './Spotify.module.scss';

const PlayerBar: React.FC = () => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, volume, queue, currentTrackIndex } = useSelector((state: RootState) => state.player);
  const { handleNextTrack, handlePreviousTrack, handlePlayPause } = useMusicPlayer();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    dispatch(setVolume(newVolume));
  };

  if (!currentTrack) return null;

  const nextTrackInfo = queue[currentTrackIndex + 1];

  return (
    <div className={styles.playerBarContainer}>
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
      </div>
      <div className={styles.volumeControl}>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
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