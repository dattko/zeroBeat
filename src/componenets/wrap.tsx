'use client'
import React from 'react';
import { Sidebar } from '@component/sidebar'; 
import { Content }  from '@component/content'; 

export const Wrap = ({
  children
}: {
  children: React.ReactNode
}) => (
  <div className='wrap'>
    <div className='main-body'>
      <Sidebar/>
      <Content>
        {children}
      </Content>
    </div>
  </div>
);

export default Wrap;