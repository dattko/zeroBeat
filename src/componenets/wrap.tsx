'use client'
import React from 'react';
import Sidebar from '@component/sidebar'; 
import { Content }  from '@component/content'; 
import ReduxProvider from '@redux/provider';
import  GlobalModal  from '@modal/globalModal';

export const Wrap = ({
  children
}: {
  children: React.ReactNode
}) => (      
  <div className='wrap'>
    <ReduxProvider>
      <GlobalModal /> 
        <div className='main-body'>
          <Sidebar/>
          <Content>
            {children}
          </Content>
        </div>
    </ReduxProvider>
  </div>
);

export default Wrap;