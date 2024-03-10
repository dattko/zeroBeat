import React from 'react';

const Sidebar = ({ children } : Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <div className='main-body'>
      {children}
    </div>
  );
};

export default Sidebar;
