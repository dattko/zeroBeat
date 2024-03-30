import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem } from 'menuTypes';


export default  async function  Sidebar(){
  const pathName = usePathname();
  
  const response = await fetch('http://localhost:9999/menuItems');
  const data : MenuItem[] = await response.json();
  
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

