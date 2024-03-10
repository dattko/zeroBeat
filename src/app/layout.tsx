import React from 'react';
import type { Metadata } from "next";
import '@style/globals.scss'; 
import Header from '@component/header'; 
import Sidebar from '@component/sidebar'; 
import Content from '@component/content'; 
import Main from '@component/mainBody'; 

export const metadata: Metadata = {
  title: "HM NEXT",
  description: "HM portfolio",
};

const RootLayout = () => {
  return (
    <html lang="ko">
      <body>
        <Header/>
        <Main>
          <Sidebar/>
          <Content/>
        </Main>
      </body> 
    </html>
  );
}

export default RootLayout;
