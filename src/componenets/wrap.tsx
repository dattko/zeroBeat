'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from './header';
import Content from '@component/mainBody';
import ReduxProvider from '@redux/provider';
import GlobalModal from '@modal/globalModal';
import Loading from '@/app/loading';
import Playbar from './spotify/PlayerBar';
import PlayList from './spotify/PlayList';


interface WrapProps {
  children: ReactNode;
}

const Wrap: React.FC<WrapProps> = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const [isPlayListOpen, setIsPlayListOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/login");
    }
  }, [status, router, isLoginPage]);

  const togglePlayList = () => {
    setIsPlayListOpen(prev => !prev);
  };

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    if (isLoginPage) {
      return <>{children}</>;
    }
    return null;
  }

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