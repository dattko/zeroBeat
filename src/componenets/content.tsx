// content.tsx
import React from 'react';


export const Content = ({
  children
}: {
  children: React.ReactNode
}) => (
        <div className='main-content'>
          <div className='main-content-inner'>
            {children}
          </div>
        </div>
  );

