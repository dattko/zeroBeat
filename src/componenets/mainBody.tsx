import React from 'react';
import Sidebar from '@component/sidebar'; 
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';





const Content = ({children}: {children: React.ReactNode}) => {
  const usePlayer = useSelector((state: RootState) => state.player.currentTrack);

  return(
    <div className={`main-body ${usePlayer ? 'player-on' : ''}`}>
        <Sidebar/>
        <div className='main-content'>
          <div className='main-content-inner'>
            {children}
          </div>
        </div>
      </div>
  )
}

export default Content;

