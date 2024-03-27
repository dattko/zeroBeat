'use client'
import React from 'react';
import Sidebar from '@component/sidebar'; 
import { Content }  from '@component/content'; 
import { Provider } from 'react-redux';
import { store } from '@redux/store'
import  GlobalModal  from '@modal//globalModal';

export const Wrap = ({
  children
}: {
  children: React.ReactNode
}) => (      
  <div className='wrap'>
    <Provider store={store}>
      <GlobalModal /> 
        <div className='main-body'>
          <Sidebar/>
          <Content>
            {children}
          </Content>
        </div>
    </Provider>
  </div>
);

export default Wrap;