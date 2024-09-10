'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from './header';
import Content from '@component/mainBody';
import ReduxProvider from '@redux/provider';
import GlobalModal from '@modal/globalModal';
import Playbar from './spotify/PlayerBar';
import PlayList from './spotify/PlayList';

interface WrapProps {
  children: ReactNode;
}

const Wrap: React.FC<WrapProps> = ({ children }) => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isPlayListOpen, setIsPlayListOpen] = useState(false);

  if (pathname === '/login') {
    return <>{children}</>; 
  }

  if (session?.user.isPremium === false) {
    console.log('요금제 가입을 해야 음악을 들을 수 있습니다.');
  }
  const togglePlayList = () => {
    setIsPlayListOpen(prev => !prev);
  };
  return (
    <ReduxProvider>
      <div className='wrap'>
        <GlobalModal /> 
          <Header/>
          <Content>
            {children}
          </Content>
          <PlayList isOpen={isPlayListOpen} onClose={()=>{setIsPlayListOpen(false)}}/>
          <Playbar onTogglePlayList={togglePlayList} />
      </div>
    </ReduxProvider>
  );
};

export default Wrap;