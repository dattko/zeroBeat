'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem } from 'menuTypes'; 
import axios from 'axios';

const Sidebar = () => {
  const pathName = usePathname();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);


  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_APP_API}/menuItems`);
        setMenuItems(response.data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };
    fetchMenuItems();
  }, []); 
  
  return (
    <div className='sidebar'>
      <div className="logo">
        <img src="/images/row-logo.svg" alt="logo" />
      </div>
      <ul>
        {menuItems.map((menuItem) => (
          <li key={menuItem.id} className={pathName === menuItem.link ? 'active' : ''}> 
            <Link href={menuItem.link}>
              <img src={`/icon/${menuItem.img}.svg`} alt="메뉴 아이콘" />
              {menuItem.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Sidebar;
