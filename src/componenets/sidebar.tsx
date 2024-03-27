// sidebar.tsx

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import MenuItem from '@/types/menu';


const Sidebar = () => {
  const pathName = usePathname();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:3001/menuItems');
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  useEffect(() => {
    
    fetchMenuItems();
  }, []);

  return (
    <div className='sidebar'>
      <div className="logo">
        ZeroBeat
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