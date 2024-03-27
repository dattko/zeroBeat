// content.tsx
import React from 'react';
import { Header } from './header';

export const Content = ({
  children
}: {
  children: React.ReactNode
}) => (
        <div className='main-content'>
          <Header></Header>
          <div className='main-content-inner'>
            {children}
          </div>
        </div>
  );

