import React from 'react';
import { AudioWaveform } from 'lucide-react';

interface PlayTrackProps {
  size: number;
  BoxSize: number;
}
const PlayTrack:React.FC<PlayTrackProps> = ({size, BoxSize}) => {
  return (
    <div className='play-track' style={{width: BoxSize, height: BoxSize}}>
      <AudioWaveform size={size} color='#e0e0e0'/>
    </div>
  );
}

export default PlayTrack;