export interface MenuItem {
  id: number;
  name: string;
  link: string;
  img: string;
}


export const menuItems: MenuItem[] = [
  {
    id: 1,
    name: '홈',
    link: '/',
    img: 'home',
  },
  {
    id: 2,
    name: '글로벌 차트',
    link: '/chart',
    img: 'chart',
  },
  {
    id: 3,
    name: '라이브러리',
    link: '/locker',
    img: 'locker',
  },
];