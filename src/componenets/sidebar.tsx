// sidebar.tsx
import React from 'react';
import Link from 'next/link';

export const Sidebar = () => {
  return (
    <div className='sidebar'>
      <ul>
        <li>
          <Link href="/">
              <img src="/icon/home.svg" alt="메뉴 아이콘" />
              홈
          </Link>
        </li>
        <li>
          <Link href="/chart">
              <img src="/icon/chart.svg" alt="메뉴 아이콘" />
              실시간 차트
          </Link>
        </li>
        <li>
          <Link href="/locker">
              <img src="/icon/locker.svg" alt="메뉴 아이콘" />
              보관함
          </Link>
        </li>
      </ul>
    </div>
  );
};


