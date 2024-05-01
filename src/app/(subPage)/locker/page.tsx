"use client"
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { MusicList } from 'swiperTypes';
import axios from 'axios';


const Locker = () => {
  const [musicData, setMusicData] = useState<MusicList[]>([]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_APP_API}/music`);
            setMusicData(response.data); 
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchData();
      }, []);

    return (
        <>
            <Section>
                <SectionTitleBox>
                <SectionTitle>
                        보관함
                </SectionTitle>
                </SectionTitleBox>
                {/* Display the top two songs based on popularity rank */}
                <SwiperWrap>
                    <SwiperList >
                        <AlbumImge>
                            <img src="/icon/locak-album.svg" alt="보관함"
                            style={{maxWidth: '88px', maxHeight: '88px'}}/>
                        </AlbumImge>
                        <MusicInfoText>새 보관함</MusicInfoText>
                    </SwiperList>
                {musicData
                    .slice(0, 3)
                    .map((song) => (
                    <SwiperList key={song.id}>
                        <AlbumImge>
                        <img src={song.album_art_url} alt={song.title} />
                        </AlbumImge>
                        <MusicInfoText>playList</MusicInfoText>
                    </SwiperList>
                    ))}
                </SwiperWrap>
            </Section>
        </>
    )
}

export default Locker;


const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const SectionTitleBox = styled.div`
  display: flex;
  align-items: center;
`
const SectionTitle = styled.span`
  font-size: 32px;
  font-weight: 700;
`

//스와이퍼 리스트
const SwiperList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

`
//앨범커버
interface AlbumImgeProps {
  small?: boolean;
}

const AlbumImge = styled.div<AlbumImgeProps>`
  width: ${(props) => (props.small ? '48px' : '220px')};
  height: ${(props) => (props.small ? '48px' : '220px')};
  background-color: #D9D9D9 ;
  display: flex;
  align-items: center;
  justify-content: center;
  img{
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`

// 음악 세로 리스트

const MusinListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-right: 80px;
`

const MusinListUl = styled.ul`
display: flex;
flex-direction: column;
gap: 16px;
`
const MusinListLi = styled.li`
display: flex;
justify-content: space-between;
padding-bottom: 17px;
border-bottom: 1px solid #D9D9D9;
align-items: center;
gap: 16px;
`




interface MusicInfoTextProps {
  regular?: boolean;
  grey?: boolean;
  width?: string;
  center?: boolean;
}


const MusicInfoTitle = styled.span<MusicInfoTextProps>`
  font-size: ${(props) => (props.regular ? '16px' : '18px')};
  font-weight: 700;
  flex: 1;
  
`;
const MusicInfoText = styled.span<MusicInfoTextProps>`
  color: ${(props) => (props.grey ? '#7a7a7a' : '#000')};
  max-width: ${(props) => (props.width)};
  text-align: ${(props) => (props.center ? 'center' : 'left')};
  width: 100%;
`;

const IconBtn = styled.button`
display: flex;
align-items: center;
justify-content: center;
width: 48px;
height: 48px;
`