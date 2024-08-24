import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@redux/store';
import { useSession } from 'next-auth/react';
import { 
  setIsPlaying, 
  setVolume, 
  setDeviceId,
  setIsPlayerReady,
  nextTrack,
  previousTrack,
  setCurrentTrackIndex,
  setCurrentTrack
} from '@redux/slice/playerSlice';
import styles from './Spotify.module.scss';
import { playTrack } from '@/lib/spotify';
import { SpotifySDK } from '@/types/spotify';

const PlayerBar: React.FC = () => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, volume, isPlayerReady, queue, currentTrackIndex, deviceId} = useSelector((state: RootState) => state.player);
  const [player, setPlayer] = useState<SpotifySDK.Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const { repeatMode } = useSelector((state: RootState) => state.player);

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

  useEffect(() => {
    // queue가 업데이트 될 때마다 현재 트랙을 재생
    if (queue.length > 0 && currentTrackIndex !== -1 && currentTrack && isPlayerReady && session && player) {
      playTrack(session, currentTrack, isPlayerReady, deviceId)
        .catch(error => {
          console.error('Failed to play track:', error);
          setError('Failed to play track. Please try again.');
        });
    }
  }, [queue, currentTrackIndex, currentTrack, isPlayerReady, session, player]);

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

  const handleNextTrack = async () => {
    if (currentTrackIndex < queue.length - 1) {
      dispatch(nextTrack());
    } else if (repeatMode === 2) {
      dispatch(setCurrentTrackIndex(0));
      dispatch(setCurrentTrack(queue[0]));
    } else {
      // Handle the case where there's no next track and repeat mode is off
      return;
    }
  };

  const handlePreviousTrack = async () => {
    if (currentTrackIndex > 0) {
      dispatch(previousTrack());
    } else if (repeatMode === 2) {
      dispatch(setCurrentTrackIndex(queue.length - 1));
      dispatch(setCurrentTrack(queue[queue.length - 1]));
    } else {
      // Handle the case where there's no previous track and repeat mode is off
      return;
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
        <button onClick={() => setError(null)}>Dismiss</button>
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
        <button onClick={handlePreviousTrack} disabled={!isPlayerReady} className={styles.controlButton}>
          Previous
        </button>
        <button onClick={handlePlayPause} disabled={!isPlayerReady} className={styles.controlButton}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={handleNextTrack} disabled={!isPlayerReady} className={styles.controlButton}>
          Next
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
          disabled={!isPlayerReady || !player}
        />
      </div>
    </div>
  );
};

export default PlayerBar;
