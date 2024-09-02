import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { useMusicPlayer } from '@/hooks/useMusicPlayer';
import styles from './Spotify.module.scss';
import { setCurrentTime, setProgress } from '@redux/slice/playerSlice';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, RepeatIcon, Volume2, Repeat1 } from 'lucide-react'

interface PlaybarProps {
  onTogglePlayList: () => void;
}

const PlayerBar: React.FC<PlaybarProps> = ({ onTogglePlayList }) => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, volume, queue, currentTrackIndex, progress, duration, repeatMode, currentTime, } = useSelector((state: RootState) => state.player);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const PlayBarUse = !!useSelector((state: RootState) => state.player.currentTrack);
  
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

  useEffect(() => {
    initializePlayer();
  }, []);
  // 스페이스바 제어를 위한 이벤트 핸들러
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // 입력 요소나 contentEditable 요소에 포커스가 있는 경우 무시
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault(); // 스크롤 방지
      handlePlayPause();
    }
  }, [handlePlayPause]);

  useEffect(() => {
    // 컴포넌트 마운트 시 이벤트 리스너 추가
    document.addEventListener('keydown', handleKeyPress);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(async () => {
        const time = await getCurrentTime();
        setLocalCurrentTime(time);
        dispatch(setCurrentTime(time));
        dispatch(setProgress(time / duration * 100));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, getCurrentTime, dispatch, duration]);

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    handleVolumeChange(newVolume); 
  };

  const handleProgressChangeWrapper = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setLocalCurrentTime(newProgress);
    handleProgressChange(newProgress);
  }, [handleProgressChange]);

  if (!currentTrack) return null;

  const nextTrackInfo = queue[currentTrackIndex + 1];

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleControlClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
  };


  return (
    <div className={styles.playerBarContainer} onClick={onTogglePlayList}>
      {/* 트랙 정보 */}
      <div className={styles.trackInfo}>
        <img src={currentTrack.album_art_url} alt={currentTrack.album} className={styles.albumArt} />
        <div className={styles.textInfo}>
          <h3 className={styles.trackTitle}>{currentTrack.title}</h3>
          <p className={styles.artistName}>{currentTrack.artist}</p>
        </div>
      </div>
      
      {/* 플레이어 컨트롤 */}
      <div className={styles.playerControls} onClick={handleControlClick}>
        <button onClick={handlePreviousTrack} className={styles.controlButton}>
          <SkipBackIcon/>
        </button>
        <button onClick={handlePlayPause} className={styles.controlButton}>
          {isPlaying ? <PauseIcon/> : <PlayIcon/>}
        </button>
        <button onClick={handleNextTrack} className={styles.controlButton}>
          <SkipForwardIcon/>
        </button>
        <button onClick={handleRepeatMode} className={styles.controlButton}>
         {repeatMode === 0 ? <RepeatIcon style={{opacity: .4}}/> : repeatMode === 1 ? <Repeat1/> : <RepeatIcon/>}
        </button>
      </div>
      
      {/* 프로그레스 바 */}
<div className={styles.progressControl} onClick={handleControlClick}>
        <input
          type="range"
          min="0"
          max={duration}
          value={localCurrentTime}
          onChange={handleProgressChangeWrapper}
          className={styles.progressSlider}
        />
        <div className={styles.progressTime}>
          <span>{formatTime(localCurrentTime)}</span> / <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* 볼륨 컨트롤 */}
      <div className={styles.volumeControl} onClick={handleControlClick}>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeSliderChange}
          className={styles.volumeSlider}
        />
        <span><Volume2/>{volume}</span>
      </div>
      
      {/* 다음 트랙 정보 */}
      {nextTrackInfo && (
        <div className={styles.nextTrackInfo}>
          <p>Next: {nextTrackInfo.title} - {nextTrackInfo.artist}</p>
        </div>
      )}
    </div>
  );
};

export default PlayerBar;
