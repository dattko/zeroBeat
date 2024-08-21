import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSession } from 'next-auth/react';
import { RootState } from '@redux/store';
import { 
  setIsPlaying, 
  setCurrentTrack, 
  setVolume, 
  setProgress, 
  toggleShuffle, 
  setRepeatMode,
  setIsPlayerReady,
  setDeviceId
} from '@redux/slice/playerSlice';
import styles from './Spotify.module.scss';
import { SpotifySDK, MusicList } from '@/types/spotify';
import { getDevices, activateDevice, playTrack } from '@/lib/spotify';

const PlayerBar: React.FC = () => {
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { currentTrack, isPlaying, volume, progress, shuffleOn, repeatMode, deviceId } = useSelector((state: RootState) => state.player);
  const [player, setPlayer] = useState<SpotifySDK.Player | null>(null);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkPremiumStatus = useCallback(async () => {
    if (!session?.user?.accessToken) {
      setError('No access token available');
      return;
    }

    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setIsPremium(data.product === 'premium');
    } catch (error) {
      console.error('Failed to check premium status:', error);
      setError('Failed to verify premium status. Please try again later.');
      setIsPremium(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      checkPremiumStatus();
    }
  }, [status, checkPremiumStatus]);

  useEffect(() => {
    if (!isPremium || !session?.user?.accessToken) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: cb => { 
          cb(session.user.accessToken);
        },
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize', message);
        setError(`Failed to initialize player: ${message}`);
      });
      player.addListener('authentication_error', ({ message }) => {
        console.error('Failed to authenticate', message);
        setError(`Authentication failed: ${message}`);
      });
      player.addListener('account_error', ({ message }) => {
        console.error('Failed to validate Spotify account', message);
        setError(`Account error: ${message}`);
      });
      player.addListener('playback_error', ({ message }) => {
        console.error('Failed to perform playback', message);
        setError(`Playback error: ${message}`);
      });

      // Playback status updates
      player.addListener('ptayer_state_changed', (state: SpotifySDK.PlaybackState) => {
        if (!state) {
          console.error('Player state is null');
          return;
        }

        const track = state.track_window.current_track;
        if (!track) {
          console.error('No track information available');
          return;
        }

        dispatch(setCurrentTrack({
          id: track.id,
          uri: track.uri,
          title: track.name,
          artist: track.artists.map(artist => artist.name).join(', '),
          album: track.album.name,
          album_art_url: track.album.images[0]?.url || '',
          duration: msToMinutesAndSeconds(state.duration),
          release_date: '',
          popularity_rank: 0,
        } as MusicList));
        dispatch(setIsPlaying(!state.paused));
        dispatch(setProgress(state.position));
      });

      // Ready
      player.addListener('ready', async ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        dispatch(setDeviceId(device_id));
        dispatch(setIsPlayerReady(true));
        
        // Activate the device
        const isActivated = await activateDevice(session, device_id);
        if (!isActivated) {
          setError('Failed to activate the player. Please try refreshing the page.');
        }
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        dispatch(setIsPlayerReady(false));
      });

      // Connect to the player!
      player.connect().then(success => {
        if (success) {
          console.log('The Web Playback SDK successfully connected to Spotify!');
        } else {
          console.error('Failed to connect to Spotify');
          setError('Failed to connect to Spotify player');
        }
      });

      setPlayer(player);
    };

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      if (player) {
        player.disconnect();
      }
    };
  }, [session, dispatch, isPremium]);

  const handlePlayPause = async () => {
    if (player) {
      if (isPlaying) {
        await player.pause();
      } else {
        if (currentTrack) {
          const isPlayed = await playTrack(session, currentTrack);
          if (!isPlayed) {
            setError('Failed to play track. Please try again.');
          }
        } else {
          await player.resume();
        }
      }
      dispatch(setIsPlaying(!isPlaying));
    }
  };


  const handlePreviousTrack = () => {
    if (player) {
      player.previousTrack();
    }
  };

  const handleNextTrack = () => {
    if (player) {
      player.nextTrack();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    if (player) {
      player.setVolume(newVolume / 100).then(() => {
        dispatch(setVolume(newVolume));
      });
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPosition = Number(e.target.value);
    if (player && currentTrack) {
      player.seek(newPosition).then(() => {
        dispatch(setProgress(newPosition));
      });
    }
  };

  const handleShuffleToggle = async () => {
    if (session?.user?.accessToken) {
      try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=${!shuffleOn}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`
          }
        });
        if (response.ok) {
          dispatch(toggleShuffle());
        } else {
          throw new Error('Failed to toggle shuffle');
        }
      } catch (error: unknown) {
        console.error('Error toggling shuffle:', error);
        setError(error instanceof Error ? error.message : 'Failed to toggle shuffle. Please try again.');
      }
    }
  };

  const handleRepeatToggle = async () => {
    if (session?.user?.accessToken) {
      const newMode = (repeatMode + 1) % 3; // 0: off, 1: context, 2: track
      const repeatState = ['off', 'context', 'track'][newMode];
      try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/repeat?state=${repeatState}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`
          }
        });
        if (response.ok) {
          dispatch(setRepeatMode(newMode));
        } else {
          throw new Error('Failed to change repeat mode');
        }
      } catch (error: unknown) {
        console.error('Error setting repeat mode:', error);
        setError(error instanceof Error ? error.message : 'Failed to change repeat mode. Please try again.');
      }
    }
  };

  const msToMinutesAndSeconds = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (status === "loading" || isPremium === null) {
    return <div className={styles.loadingMessage}>Loading player...</div>;
  }

  if (status === "unauthenticated") {
    return <div className={styles.errorMessage}>Please log in to use the player.</div>;
  }

  if (!isPremium) {
    return (
      <div className={styles.premiumAlert}>
        <p>This feature is only available for Spotify Premium users.</p>
        <a href="https://www.spotify.com/premium/" target="_blank" rel="noopener noreferrer">
          Upgrade to Premium
        </a>
      </div>
    );
  }

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
        <button onClick={handleShuffleToggle} className={shuffleOn ? styles.active : ''}>
          Shuffle
        </button>
        <button onClick={handlePreviousTrack}>Previous</button>
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        <button onClick={handleNextTrack}>Next</button>
        <button onClick={handleRepeatToggle} className={repeatMode !== 0 ? styles.active : ''}>
          Repeat
        </button>
      </div>
      <div className={styles.progressContainer}>
        <span>{msToMinutesAndSeconds(progress)}</span>
        <input
          type="range"
          min="0"
          max={currentTrack.duration ? parseInt(currentTrack.duration) * 1000 : 0}
          value={progress}
          onChange={handleProgressChange}
          className={styles.progressBar}
        />
        <span>{currentTrack.duration}</span>
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
    </div>
  );
};

export default PlayerBar;