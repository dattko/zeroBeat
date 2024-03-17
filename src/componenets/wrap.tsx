'use client'
import React from 'react';
import { Sidebar } from '@component/sidebar'; 
import { Header } from '@component/header'; 
import { Content }  from '@component/content'; 

export const Wrap = ({
  children
}: {
  children: React.ReactNode
}) => (
  <div className='wrap'>
    <Header/>
    <div className='main-body'>
      <Sidebar/>
      <Content>
        {children}
      </Content>
    </div>
  </div>
);

