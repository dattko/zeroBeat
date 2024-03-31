import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem } from 'menuTypes';
import axios from 'axios';

export default async function Sidebar() {
  const pathName = usePathname();
  
  const response = await axios.get(`${process.env.NEXT_PUBLIC_APP_API}/menuItems`);
  const data: MenuItem[] = response.data;
  
  return (
    <div className='sidebar'>
      <div className="logo">
        ZeroBeat
      </div>
      <ul>
        {data.map((menuItem) => (
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