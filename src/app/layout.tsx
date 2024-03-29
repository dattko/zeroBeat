import React from 'react';
import type { Metadata } from "next";
import '@style/globals.scss'; 
import { Wrap } from '@/componenets/wrap';

export const metadata: Metadata = {
  title: "ZeroBeat",
  description: "music service",
};

const RootLayout = ({
  children
}: {
  children: React.ReactNode
}) => (
  <html lang='en'>
    <body>
      <Wrap>
        {children} 
      </Wrap>
    </body>
  </html>
);

export default RootLayout;