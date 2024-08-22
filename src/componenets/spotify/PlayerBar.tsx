'use client';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@redux/store';
import { useSession } from 'next-auth/react';
import { 
  setIsPlaying, 
  setVolume, 
  setDeviceId,
  setIsPlayerReady,
} from '@redux/slice/playerSlice';
import styles from './Spotify.module.scss';
import { SpotifySDK } from '@/types/spotify';

const PlayerBar: React.FC = () => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, volume } = useSelector((state: RootState) => state.player);
  const isPlayerReady = useSelector((state: RootState) => state.player.isPlayerReady);
  const [player, setPlayer] = useState<SpotifySDK.Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!player && window.Spotify && window.Spotify.Player && session?.user?.accessToken) {
      const newPlayer = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => { cb(session.user.accessToken); },
      });

      newPlayer.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        dispatch(setDeviceId(device_id));
        dispatch(setIsPlayerReady(true));
      });

      newPlayer.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        dispatch(setIsPlayerReady(false));
      });

      newPlayer.connect();
      setPlayer(newPlayer);
    }
  }, [player, dispatch, session]);

  const handlePlayPause = async () => {
    if (player && isPlayerReady) {
      try {
        if (isPlaying) {
          await player.pause();
        } else {
          await player.resume();
        }
        dispatch(setIsPlaying(!isPlaying));
      } catch (error) {
        console.error('Error in play/pause:', error);
        setError('Failed to play/pause. Please try again.');
      }
    } else {
      setError('Player is not ready. Please wait and try again.');
    }
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    if (player && isPlayerReady) {
      try {
        await player.setVolume(newVolume / 100);
        dispatch(setVolume(newVolume));
      } catch (error) {
        console.error('Error setting volume:', error);
        setError('Failed to change volume. Please try again.');
      }
    } else {
      setError('Player is not ready. Please wait and try again.');
    }
  };

  if (error) {
    return (
      <div className={styles.errorMessage}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!currentTrack) return null;

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
        <button onClick={handlePlayPause} disabled={!isPlayerReady}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div className={styles.volumeControl}>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className={styles.volumeSlider}
          disabled={!isPlayerReady || !player}  // player와 isPlayerReady 상태에 따라 슬라이더 활성화
        />
      </div>
    </div>
  );
};

export default PlayerBar;
