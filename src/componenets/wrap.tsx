'use client';
import React, { ReactNode } from 'react';
import Sidebar from '@component/sidebar'; 
import { Content } from '@component/content'; 
import ReduxProvider from '@redux/provider';
import GlobalModal from '@modal/globalModal';

interface WrapProps {
  children: ReactNode;
}

const Wrap: React.FC<WrapProps> = ({ children }) => {
  
  return (
    <>
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
    </>
  );
};

export default Wrap;
