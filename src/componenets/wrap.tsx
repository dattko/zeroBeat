'use client';

import React, { ReactNode, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from '@component/sidebar'; 
import { Content } from '@component/content'; 
import ReduxProvider from '@redux/provider';
import GlobalModal from '@modal/globalModal';
import LoadingPage from '@/app/loading'; // 로딩 컴포넌트 import

interface WrapProps {
  children: ReactNode;
}

const Wrap: React.FC<WrapProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/login");
    }
  }, [status, router, isLoginPage]);

  if (status === "loading") {
    return <LoadingPage />;
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
        <div className='main-body'>
          <Sidebar/>
          <Content>
            {children}
          </Content>
        </div>
      </div>
    </ReduxProvider>
  );
};

export default Wrap;