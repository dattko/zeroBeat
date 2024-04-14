"use client"
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { openModal } from '@redux/slice/modalSlice';
import SwiperWrap from '@component/swiper/SwiperWrap';
import { MusicList } from 'swiperTypes';
import styled from 'styled-components';
import axios from 'axios'; 
import { useAppSelector } from '@/redux/store';


interface MusucListProps {
  musicData: MusicList[]; 
}



const Page = () => {
  const [musicData, setMusicData] = useState<MusicList[]>([]);
  const dispatch = useDispatch();
  const isAuth = useAppSelector((state) => state.auth.value.isAuth);


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
  
  const handleOpenBasicModal = () => {
    dispatch(
      openModal({
        modalType: "BasicModal",
        isOpen: true,
        title: "modal2",
      })
    );
  };

  return (
    <>
    {isAuth ? (
      <Section>
      <SectionTitleBox>
        <SectionTitle>
          최근 재생한 음악  
        </SectionTitle>
        </SectionTitleBox>
      <SwiperWrap>
        {musicData
          .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
          .map((song) => (
            <SwiperList key={song.id}>
              <AlbumImge>
                <img src={song.album_art_url} alt={song.title} />
              </AlbumImge>
              <MusicInfoTitle>{song.title}</MusicInfoTitle>
              <MusicInfoText>{song.artist}</MusicInfoText>
              <MusicInfoText>{song.album}</MusicInfoText>
            </SwiperList>
          ))}
      </SwiperWrap>
      </Section>
    ) : null}
     
      <Section>
      <SectionTitleBox>
          <SectionTitle>
            	실시간 인기 음악
          </SectionTitle>
        </SectionTitleBox>
            <MusucList musicData={musicData}/>
      </Section>
      <Section>
      <SectionTitleBox>
          <SectionTitle>
            	최근 출시 음악
          </SectionTitle>
          </SectionTitleBox>
        {/* Display the top two songs based on popularity rank */}
        <SwiperWrap>
        {musicData
            .sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime())
            .map((song) => (
              <SwiperList key={song.id}>
                <AlbumImge>
                 <img src={song.album_art_url} alt={song.title} />
                </AlbumImge>
                <MusicInfoTitle>{song.title}</MusicInfoTitle>
                <MusicInfoText>{song.artist}</MusicInfoText>
                <MusicInfoText> {song.album}</MusicInfoText>
                <MusicInfoText>{new Date(song.release_date).toLocaleDateString()}</MusicInfoText>
              </SwiperList>
            ))}
        </SwiperWrap>
      </Section>
      <button onClick={handleOpenBasicModal}>기본 모달 열기</button>
    </>
  );
};



export default Page;


interface MusucListProps {
  musicData: MusicList[]; 
}

const MusucList: React.FC<MusucListProps> = ({ musicData }) => {
  return (
    <MusinListContainer>
      <MusinListUl>
        {musicData
        .sort((a, b) => a.popularity_rank - b.popularity_rank)
        .map((song, i) => (
          <MusinListLi key={song.id}>
            <MusicInfoText width='30px' grey center>
              {i + 1}
            </MusicInfoText>
            <AlbumImge small/>
            <MusicInfoTitle regular>{song.title}</MusicInfoTitle>
            <MusicInfoText width='22%'>{song.artist}</MusicInfoText>
            <MusicInfoText width='22%'>{song.album}</MusicInfoText>
            <MusicInfoText grey width='60px'>
              {song.duration}
            </MusicInfoText>
            <IconBtn>
              <img src="/icon/three-dot.svg" alt="재생" />
            </IconBtn>
          </MusinListLi>
        ))}
      </MusinListUl>
    </MusinListContainer>
  );
};


// 섹샨
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